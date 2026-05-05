from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from app.models.schemas import ParsedResumeData
from app.services.pdf_service import extract_text_from_pdf
from app.services.llm_service import analyze_resume
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/parse-resume", response_model=ParsedResumeData)
async def parse_resume_endpoint(
    job_description: str = Form(...),
    resume_file: UploadFile = File(...)
):
    if not resume_file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        file_bytes = await resume_file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")
        
    # 1. Extract Text
    try:
        resume_text = extract_text_from_pdf(file_bytes)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"PDF extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal error during PDF extraction.")
        
    # 2. Process with Local LLM (Gemma 4)
    try:
        parsed_data = analyze_resume(resume_text, job_description)
        return parsed_data
    except ValueError as ve:
        raise HTTPException(status_code=502, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=str(re))
    except Exception as e:
        logger.error(f"LLM analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal error during AI analysis.")
