from dotenv import load_dotenv
load_dotenv()  # loads MODAL_ENDPOINT_URL and USE_MODAL from .env

from fastapi import FastAPI
from app.api.endpoints import resume, interview

app = FastAPI(
    title="Smart Job Portal AI API",
    description="Microservice for resume parsing and scoring. Primary: Modal GPU (Gemma 4 E4B-it). Fallback: local Ollama.",
    version="1.0.0"
)

app.include_router(resume.router, prefix="/api/v1", tags=["resume"])
app.include_router(interview.router, prefix="/ws/interview", tags=["interview"])

@app.get("/health")
def health_check():
    import os
    use_modal = os.getenv("USE_MODAL", "true").lower() != "false"
    modal_url = os.getenv("MODAL_ENDPOINT_URL", "")
    backend = "modal-gpu" if (use_modal and modal_url) else "ollama-local"
    return {"status": "ok", "backend": backend, "modal_configured": bool(modal_url)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
