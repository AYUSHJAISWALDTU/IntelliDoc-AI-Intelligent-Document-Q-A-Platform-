from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from typing import List, Tuple
import io
import structlog

logger = structlog.get_logger()


def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, dict]:
    import PyPDF2
    import pdfplumber

    text_parts = []
    page_texts = {}
    metadata = {}

    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        metadata = {
            "title": pdf_reader.metadata.get("/Title", "") if pdf_reader.metadata else "",
            "author": pdf_reader.metadata.get("/Author", "") if pdf_reader.metadata else "",
            "page_count": len(pdf_reader.pages),
        }

        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for i, page in enumerate(pdf.pages, 1):
                page_text = page.extract_text() or ""
                tables = page.extract_tables()
                for table in tables:
                    table_text = "\n".join(["\t".join([str(c) for c in row if c]) for row in table if row])
                    page_text += f"\n{table_text}"
                page_texts[i] = page_text
                text_parts.append(page_text)

        full_text = "\n\n".join(text_parts)

        if not full_text.strip():
            logger.info("pdf_ocr_fallback", reason="no_text_extracted")
            full_text = extract_text_ocr(file_bytes)

        return full_text, {**metadata, "page_texts": page_texts}

    except Exception as e:
        logger.error("pdf_extraction_failed", error=str(e))
        raise


def extract_text_ocr(file_bytes: bytes) -> str:
    import pytesseract
    from PIL import Image
    import fitz  # PyMuPDF

    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        texts = []
        for page in doc:
            pix = page.get_pixmap(dpi=200)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            texts.append(pytesseract.image_to_string(img))
        return "\n\n".join(texts)
    except Exception as e:
        logger.warning("ocr_failed", error=str(e))
        return ""


def extract_text_from_docx(file_bytes: bytes) -> Tuple[str, dict]:
    from docx import Document as DocxDocument

    doc = DocxDocument(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    text = "\n\n".join(paragraphs)
    metadata = {
        "title": doc.core_properties.title or "",
        "author": doc.core_properties.author or "",
        "paragraph_count": len(paragraphs),
    }
    return text, metadata


def extract_text_from_txt(file_bytes: bytes) -> Tuple[str, dict]:
    text = file_bytes.decode("utf-8", errors="replace")
    return text, {"char_count": len(text)}


def extract_text_from_csv(file_bytes: bytes) -> Tuple[str, dict]:
    import pandas as pd

    df = pd.read_csv(io.BytesIO(file_bytes))
    text = df.to_string(index=False)
    metadata = {
        "rows": len(df),
        "columns": list(df.columns),
    }
    return text, metadata


def extract_text(file_bytes: bytes, file_type: str) -> Tuple[str, dict]:
    extractors = {
        "pdf": extract_text_from_pdf,
        "docx": extract_text_from_docx,
        "doc": extract_text_from_docx,
        "txt": extract_text_from_txt,
        "csv": extract_text_from_csv,
    }
    extractor = extractors.get(file_type.lower())
    if not extractor:
        raise ValueError(f"Unsupported file type: {file_type}")
    return extractor(file_bytes)


def clean_text(text: str) -> str:
    import re
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = text.strip()
    return text


def chunk_document(
    text: str,
    document_id: str,
    file_name: str,
    page_texts: dict = None,
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
) -> List[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n## ", "\n### ", "\n\n", "\n", ". ", " ", ""],
        length_function=len,
    )

    chunks = splitter.create_documents(
        texts=[text],
        metadatas=[{
            "document_id": document_id,
            "source": file_name,
        }],
    )

    for i, chunk in enumerate(chunks):
        chunk.metadata["chunk_index"] = i
        char_start = text.find(chunk.page_content[:50])
        chunk.metadata["char_start"] = max(0, char_start)
        chunk.metadata["char_end"] = chunk.metadata["char_start"] + len(chunk.page_content)

        if page_texts:
            for page_num, page_text in page_texts.items():
                if chunk.page_content[:100] in page_text:
                    chunk.metadata["page_number"] = page_num
                    break

    return chunks
