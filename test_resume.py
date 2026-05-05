import asyncio
import time
from app.services.pdf_service import extract_text_from_pdf
from app.services.llm_service import analyze_resume
import json

async def test_resume():
    pdf_path = "/home/rayan-babur/Desktop/smart-job-portal/Rayan_Babur.pdf"
    
    print(f"Reading PDF: {pdf_path}")
    try:
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()
            
        print("Extracting text...")
        text = extract_text_from_pdf(pdf_bytes)
        print(f"Extracted {len(text)} characters of text.")
        
        job_description = """
        We are looking for a Senior Software Engineer with strong Python and React skills.
        Experience with machine learning, AWS, and building microservices is highly desired.
        Must have at least 5 years of experience.
        """
        
        print("Analyzing resume against job description...")
        print("(First run on local CPU may take a few minutes, Modal GPU should be fast...)")
        start = time.time()
        result = analyze_resume(text, job_description)
        elapsed = time.time() - start
        
        print(f"\n--- RESULTS (completed in {elapsed:.1f}s) ---")
        print(result.model_dump_json(indent=2))
        
    except Exception as e:
        print(f"Error during testing: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_resume())
