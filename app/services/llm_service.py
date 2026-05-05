"""
LLM service — resume analysis via Modal vLLM GPU (primary) or local Ollama (fallback).

The Modal backend runs an OpenAI-compatible vLLM server on T4 GPU.
We call it using the standard /v1/chat/completions endpoint.

Environment variables:
  MODAL_ENDPOINT_URL  — base URL of the deployed Modal vLLM server
  USE_MODAL           — set "false" to force local Ollama mode
"""

import json
import logging
import os
import httpx
from app.models.schemas import ParsedResumeData

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MODAL_ENDPOINT_URL = os.getenv("MODAL_ENDPOINT_URL", "")
USE_MODAL = os.getenv("USE_MODAL", "true").lower() != "false"

# Fallback: local Ollama model (unchanged from original)
LOCAL_MODEL_NAME = "batiai/gemma4-e2b:q4"

# Shared system prompt
SYSTEM_PROMPT = (
    "You are an expert technical recruiter and AI resume analyzer. "
    "Compare the Resume against the Job Description. "
    "Extract the candidate's skills, education, and experience. "
    "Calculate a realistic match_score from 0.0 to 100.0 based on skill overlap and experience relevance. "
    "Provide feedback justifying the score and highlighting areas for improvement. "
    "Return ONLY valid JSON conforming to this schema — no markdown, no extra text:\n"
    '{"skills":["..."],'
    '"education":[{"degree":"...","institution":"...","year":"..."}],'
    '"experience":[{"role":"...","company":"...","duration":"...","description":"..."}],'
    '"match_score":75.0,'
    '"feedback":"..."}'
)


# ---------------------------------------------------------------------------
# Modal vLLM path (OpenAI-compatible /v1/chat/completions)
# ---------------------------------------------------------------------------
def _analyze_with_modal(resume_text: str, job_description: str) -> ParsedResumeData:
    """Calls the deployed Modal vLLM server via OpenAI chat completions API."""
    if not MODAL_ENDPOINT_URL:
        raise RuntimeError("MODAL_ENDPOINT_URL is not set.")

    safe_resume = resume_text[:12000]
    safe_jd = job_description[:4000]

    payload = {
        "model": "llm",   # served-model-name in vLLM config
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"--- JOB DESCRIPTION ---\n{safe_jd}\n\n"
                    f"--- RESUME ---\n{safe_resume}"
                ),
            },
        ],
        "temperature": 0.1,
        "max_tokens": 1024,
        "stream": False,
    }

    base_url = MODAL_ENDPOINT_URL.rstrip("/")

    try:
        with httpx.Client(timeout=300.0) as client:
            response = client.post(
                f"{base_url}/v1/chat/completions",
                json=payload,
            )
            response.raise_for_status()
    except httpx.TimeoutException:
        raise RuntimeError("Modal vLLM endpoint timed out after 300s.")
    except httpx.HTTPStatusError as e:
        raise RuntimeError(
            f"Modal vLLM returned HTTP {e.response.status_code}: {e.response.text[:200]}"
        )
    except httpx.RequestError as e:
        raise RuntimeError(f"Could not reach Modal vLLM endpoint: {str(e)}")

    # Parse OpenAI-compatible response
    data = response.json()
    raw_content = data["choices"][0]["message"]["content"].strip()

    # Extract JSON from potential markdown code fences
    json_str = raw_content
    if "```" in json_str:
        import re
        match = re.search(r"```(?:json)?\s*([\s\S]*?)```", json_str)
        if match:
            json_str = match.group(1).strip()

    try:
        parsed_dict = json.loads(json_str)
        return ParsedResumeData(**parsed_dict)
    except (json.JSONDecodeError, ValueError) as e:
        raise ValueError(
            f"Modal response JSON parsing failed: {str(e)[:200]}. Raw: {raw_content[:300]}"
        )


# ---------------------------------------------------------------------------
# Local Ollama fallback path (original implementation)
# ---------------------------------------------------------------------------
def _analyze_with_ollama(resume_text: str, job_description: str) -> ParsedResumeData:
    """Falls back to local Ollama if Modal is unavailable."""
    import ollama

    safe_resume_text = resume_text[:15000]
    safe_job_desc = job_description[:5000]

    user_prompt = (
        f"--- JOB DESCRIPTION ---\n{safe_job_desc}\n\n"
        f"--- RESUME TEXT ---\n{safe_resume_text}"
    )

    response = ollama.chat(
        model=LOCAL_MODEL_NAME,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        format=ParsedResumeData.model_json_schema(),
        options={"temperature": 0.1},
    )

    result_text = response["message"]["content"]
    parsed_dict = json.loads(result_text)
    return ParsedResumeData(**parsed_dict)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def analyze_resume(resume_text: str, job_description: str) -> ParsedResumeData:
    """
    Analyzes a resume against a job description.

    Primary:  Modal vLLM GPU (google/gemma-4-E4B-it on T4)
    Fallback: Local Ollama (batiai/gemma4-e2b:q4)
    """
    if USE_MODAL and MODAL_ENDPOINT_URL:
        logger.info("Analyzing resume via Modal vLLM GPU endpoint...")
        result = _analyze_with_modal(resume_text, job_description)
        logger.info("Modal vLLM analysis successful.")
        return result

    # Fallback to local Ollama
    logger.info(f"Analyzing resume via local Ollama model '{LOCAL_MODEL_NAME}'...")
    try:
        result = _analyze_with_ollama(resume_text, job_description)
        logger.info("Local Ollama analysis successful.")
        return result
    except json.JSONDecodeError:
        raise ValueError("The AI model returned an invalid JSON format.")
    except Exception as e:
        logger.error(f"Ollama error: {str(e)}")
        raise RuntimeError(
            f"Ensure Ollama is running and model '{LOCAL_MODEL_NAME}' is pulled. Error: {str(e)}"
        )
