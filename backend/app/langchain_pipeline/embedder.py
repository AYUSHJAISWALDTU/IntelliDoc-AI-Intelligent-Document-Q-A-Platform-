from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
import chromadb
from typing import List
from app.config import settings
import structlog

logger = structlog.get_logger()


def get_chroma_client() -> chromadb.HttpClient:
    return chromadb.HttpClient(
        host=settings.CHROMA_HOST,
        port=settings.CHROMA_PORT,
    )


def get_embeddings(api_key: str = None) -> OpenAIEmbeddings:
    return OpenAIEmbeddings(
        model=settings.OPENAI_EMBEDDING_MODEL,
        openai_api_key=api_key or settings.OPENAI_API_KEY,
    )


def get_vectorstore(space_id: str, api_key: str = None) -> Chroma:
    return Chroma(
        client=get_chroma_client(),
        collection_name=f"space_{space_id}",
        embedding_function=get_embeddings(api_key),
    )


def embed_and_store(
    documents: List[Document],
    space_id: str,
    api_key: str = None,
) -> List[str]:
    vectorstore = get_vectorstore(space_id, api_key)
    ids = vectorstore.add_documents(documents)
    logger.info("embeddings_stored", count=len(ids), space_id=space_id)
    return ids


def delete_document_vectors(document_id: str, space_id: str) -> None:
    try:
        client = get_chroma_client()
        collection = client.get_collection(f"space_{space_id}")
        collection.delete(where={"document_id": document_id})
        logger.info("vectors_deleted", document_id=document_id)
    except Exception as e:
        logger.error("vector_delete_failed", document_id=document_id, error=str(e))


def delete_space_collection(space_id: str) -> None:
    try:
        client = get_chroma_client()
        client.delete_collection(f"space_{space_id}")
        logger.info("collection_deleted", space_id=space_id)
    except Exception as e:
        logger.warning("collection_delete_failed", space_id=space_id, error=str(e))
