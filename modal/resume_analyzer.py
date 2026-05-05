"""
Modal GPU serverless function — Smart Job Portal Resume Analyzer

Runs google/gemma-4-E2B-it via vLLM (OpenAI-compatible server) on an NVIDIA L4.
vLLM provides: continuous batching, PagedAttention KV-cache, ~3x faster than raw transformers.

Deploy:  modal deploy modal/resume_analyzer.py
Serve:   modal serve modal/resume_analyzer.py   (ephemeral, live-reload)
Test:    modal run modal/resume_analyzer.py
"""

import json
from typing import Any

import aiohttp
import modal

# ---------------------------------------------------------------------------
# Container image — vLLM + CUDA (follows Modal official pattern)
# ---------------------------------------------------------------------------
vllm_image = (
    modal.Image.from_registry(
        "nvidia/cuda:12.9.0-devel-ubuntu22.04", add_python="3.12"
    )
    .entrypoint([])
    .uv_pip_install(
        "vllm==0.19.0",
    )
    .uv_pip_install(  # as of vllm 0.19.0, must install transformers separately for Gemma 4
        "transformers==5.5.0",
    )
    .env({"HF_XET_HIGH_PERFORMANCE": "1"})  # faster model transfers
)

# ---------------------------------------------------------------------------
# Model config — Gemma 4 E2B-it (5B params, fits L4 24GB VRAM comfortably)
# ---------------------------------------------------------------------------
MODEL_NAME = "google/gemma-4-E2B-it"

# ---------------------------------------------------------------------------
# Cache volumes — persist model weights & vLLM JIT artifacts across cold starts
# ---------------------------------------------------------------------------
hf_cache_vol = modal.Volume.from_name("huggingface-cache", create_if_missing=True)
vllm_cache_vol = modal.Volume.from_name("vllm-cache", create_if_missing=True)

# ---------------------------------------------------------------------------
# Server config
# ---------------------------------------------------------------------------
app = modal.App("smart-job-portal", image=vllm_image)

N_GPU = 1
MINUTES = 60  # seconds
VLLM_PORT = 8000
FAST_BOOT = True  # True = faster cold start, good for serverless scaling from 0


# ---------------------------------------------------------------------------
# vLLM OpenAI-compatible server (follows Modal official vllm_inference pattern)
# ---------------------------------------------------------------------------
@app.function(
    image=vllm_image,
    gpu=f"L4:{N_GPU}",
    scaledown_window=15 * MINUTES,    # increased to 15 mins to prevent cold starts during an interview
    timeout=10 * MINUTES,             # max container start time
    volumes={
        "/root/.cache/huggingface": hf_cache_vol,
        "/root/.cache/vllm": vllm_cache_vol,
    },
    secrets=[modal.Secret.from_name("huggingface-secret")],
)
@modal.concurrent(max_inputs=32)      # L4 has 24GB VRAM, can handle more concurrent requests
@modal.web_server(port=VLLM_PORT, startup_timeout=10 * MINUTES)
def serve():
    import subprocess

    cmd = [
        "vllm",
        "serve",
        MODEL_NAME,
        "--served-model-name",
        MODEL_NAME,
        "llm",
        "--host",
        "0.0.0.0",
        "--port",
        str(VLLM_PORT),
        "--uvicorn-log-level=info",
    ]

    # enforce-eager disables Torch compilation + CUDA graph capture (faster cold start)
    cmd += ["--enforce-eager" if FAST_BOOT else "--no-enforce-eager"]

    cmd += ["--tensor-parallel-size", str(N_GPU)]

    # L4 has 24GB VRAM — plenty of room
    cmd += [
        "--gpu-memory-utilization", "0.90",
        "--max-model-len", "4096",     # good context window for resume parsing
    ]

    # Skip multimedia support (text-only for resume parsing)
    cmd += [
        "--limit-mm-per-prompt",
        f"'{json.dumps({'image': 0, 'video': 0, 'audio': 0})}'",
    ]

    print("Starting vLLM server:", *cmd)
    subprocess.Popen(" ".join(cmd), shell=True)


# ---------------------------------------------------------------------------
# Local entrypoint — test the deployed server
# ---------------------------------------------------------------------------
@app.local_entrypoint()
async def test(test_timeout=10 * MINUTES):
    url = await serve.get_web_url.aio()

    resume_text = (
        "John Doe — Senior Python Developer. 5 years experience with FastAPI, PostgreSQL, "
        "Docker, AWS. Built microservices handling 10K+ requests/sec. MS in Computer Science "
        "from MIT (2019). Previous roles at Google (2019-2021) and Stripe (2021-2024)."
    )
    job_description = (
        "We're looking for a Backend Engineer with 3+ years Python experience. "
        "Must know FastAPI, PostgreSQL, Docker, CI/CD. AWS experience preferred."
    )

    system_prompt = {
        "role": "system",
        "content": (
            "You are an expert technical recruiter and AI resume analyzer. "
            "Compare the Resume against the Job Description. "
            "Extract skills, education, and experience. "
            "Calculate a realistic match_score from 0.0 to 100.0 based on skill overlap. "
            "Return ONLY valid JSON conforming to this schema — no markdown, no extra text:\n"
            '{"skills":["..."],'
            '"education":[{"degree":"...","institution":"...","year":"..."}],'
            '"experience":[{"role":"...","company":"...","duration":"...","description":"..."}],'
            '"match_score":75.0,'
            '"feedback":"..."}'
        ),
    }

    messages = [
        system_prompt,
        {
            "role": "user",
            "content": (
                f"--- JOB DESCRIPTION ---\n{job_description}\n\n"
                f"--- RESUME ---\n{resume_text}"
            ),
        },
    ]

    async with aiohttp.ClientSession(base_url=url) as session:
        print(f"🔍 Health check: {url}")
        async with session.get("/health", timeout=test_timeout - 1 * MINUTES) as resp:
            assert resp.status == 200, f"Health check failed: {resp.status}"
        print("✅ Server healthy")

        print(f"\n📄 Sending resume analysis request...")
        await _send_request(session, "llm", messages)


async def _send_request(
    session: aiohttp.ClientSession, model: str, messages: list
) -> None:
    """Send an OpenAI-compatible chat completion request and stream the response."""
    payload: dict[str, Any] = {
        "messages": messages,
        "model": model,
        "stream": True,
        "temperature": 0.1,       # low temp for structured JSON output
        "max_tokens": 1024,
    }

    headers = {"Content-Type": "application/json", "Accept": "text/event-stream"}

    async with session.post(
        "/v1/chat/completions", json=payload, headers=headers
    ) as resp:
        async for raw in resp.content:
            resp.raise_for_status()
            line = raw.decode().strip()
            if not line or line == "data: [DONE]":
                continue
            if line.startswith("data: "):
                line = line[len("data: "):]

            chunk = json.loads(line)
            assert chunk["object"] == "chat.completion.chunk"
            delta = chunk["choices"][0]["delta"]
            content = (
                delta.get("content")
                or delta.get("reasoning")
                or delta.get("reasoning_content")
            )
            if content:
                print(content, end="")
            else:
                print("\n", chunk)
    print()
