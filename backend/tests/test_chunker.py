import pytest
from app.langchain_pipeline.chunker import clean_text, chunk_document


def test_clean_text():
    dirty = "Hello   world\n\n\n\ntest"
    cleaned = clean_text(dirty)
    assert "\n\n\n" not in cleaned
    assert "   " not in cleaned


def test_chunk_document_basic():
    text = " ".join(["word"] * 500)
    chunks = chunk_document(text, "doc-123", "test.txt", chunk_size=100, chunk_overlap=20)
    assert len(chunks) > 1
    for chunk in chunks:
        assert chunk.metadata["document_id"] == "doc-123"
        assert "chunk_index" in chunk.metadata


def test_chunk_document_metadata():
    text = "Hello world. " * 100
    chunks = chunk_document(text, "doc-abc", "file.pdf", chunk_size=200, chunk_overlap=50)
    for i, chunk in enumerate(chunks):
        assert chunk.metadata["chunk_index"] == i
        assert len(chunk.page_content) > 0
