import io
import re
from typing import Tuple
from pypdf import PdfReader


def extract_text_from_file(file_bytes: bytes, filename: str) -> Tuple[str, int, int]:
    """
    Extracts text from PDF or TXT bytes.
    Returns a tuple of: (cleaned_text, word_count, reading_time_minutes)
    """
    filename_lower = filename.lower()
    extracted_text = ""

    if filename_lower.endswith(".pdf"):
        try:
            pdf_stream = io.BytesIO(file_bytes)
            reader = PdfReader(pdf_stream)
            pages_text = []
            for idx, page in enumerate(reader.pages):
                page_content = page.extract_text() or ""
                if page_content.strip():
                    pages_text.append(f"--- Page {idx + 1} ---\n" + page_content.strip())
            
            extracted_text = "\n\n".join(pages_text)
            if not extracted_text.strip():
                raise ValueError("The uploaded PDF appears to be empty or contains only scanned images without OCR text.")
        except Exception as e:
            if "empty" in str(e).lower() or "scanned" in str(e).lower():
                raise e
            raise ValueError(f"Failed to parse PDF document: {str(e)}")
            
    elif filename_lower.endswith((".txt", ".md", ".rtf")):
        # Try UTF-8 first, fallback to latin-1 / cp1252
        for encoding in ["utf-8", "utf-8-sig", "latin-1", "cp1252"]:
            try:
                extracted_text = file_bytes.decode(encoding)
                break
            except UnicodeDecodeError:
                continue
        if not extracted_text:
            raise ValueError("Unable to decode the text file. Please ensure it is saved in UTF-8 format.")
    else:
        raise ValueError(f"Unsupported file format: {filename}. Please upload a PDF or TXT file.")

    # Clean and normalize text
    cleaned_text = normalize_text(extracted_text)
    
    # Calculate word count & reading time
    words = re.findall(r"\b\w+\b", cleaned_text)
    word_count = len(words)
    # Average student reading speed is ~200-250 WPM
    reading_time_mins = max(1, round(word_count / 220))

    return cleaned_text, word_count, reading_time_mins


def normalize_text(raw_text: str) -> str:
    """Cleans up repetitive spaces, line breaks, and strange control characters."""
    # Replace carriage returns
    text = raw_text.replace("\r\n", "\n").replace("\r", "\n")
    # Remove null bytes or non-printable controls
    text = "".join(ch for ch in text if ch == "\n" or ch == "\t" or (ord(ch) >= 32 and ord(ch) != 127))
    # Consolidate 3+ newlines to 2 newlines
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Consolidate multiple horizontal whitespaces
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()
