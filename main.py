from dotenv import load_dotenv
load_dotenv()  # loads MODAL_ENDPOINT_URL and USE_MODAL from .env

from fastapi import FastAPI
from app.api.endpoints import resume, interview
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import httpx
import asyncio
import os
import logging

logger = logging.getLogger("startup")

@asynccontextmanager
async def lifespan(app: FastAPI):
    use_modal = os.getenv("USE_MODAL", "true").lower() != "false"
    modal_url = os.getenv("MODAL_ENDPOINT_URL", "").rstrip("/")
    if use_modal and modal_url:
        logger.info("Waking up Modal vLLM endpoint... this may take up to 2-3 minutes if cold-starting.")
        async with httpx.AsyncClient(timeout=30.0) as client:
            for i in range(15):
                try:
                    res = await client.get(f"{modal_url}/v1/models")
                    if res.status_code == 200:
                        logger.info("✅ Modal vLLM endpoint is awake and ready.")
                        break
                except Exception:
                    pass
                logger.info(f"Waiting for Modal to wake up... (attempt {i+1}/15)")
                await asyncio.sleep(10)
    yield

app = FastAPI(
    title="Smart Job Portal AI API",
    description="Microservice for resume parsing and scoring.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend URL(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
