import pdfplumber
import io
import logging

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from a PDF file using pdfplumber.
    Limits extraction to the first 5 pages to prevent memory issues.
    """
    try:
        text = ""
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            # Limit to first 5 pages to prevent excessive memory usage
            for page in pdf.pages[:5]:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
        
        if not text.strip():
            raise ValueError("No text could be extracted from the PDF. It might be an image-only PDF.")
            
        return text.strip()
    except ValueError as ve:
        raise ve
    except Exception as e:
        logger.error(f"Error extracting PDF: {str(e)}")
        raise ValueError(f"Failed to read PDF file: {str(e)}")
