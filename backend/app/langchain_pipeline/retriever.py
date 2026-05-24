from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.vectorstores import VectorStoreRetriever
import chromadb
from app.config import settings


def get_retriever(space_id: str, k: int = 8, api_key: str = None) -> VectorStoreRetriever:
    chroma_client = chromadb.HttpClient(
        host=settings.CHROMA_HOST,
        port=settings.CHROMA_PORT,
    )
    embeddings = OpenAIEmbeddings(
        model=settings.OPENAI_EMBEDDING_MODEL,
        openai_api_key=api_key or settings.OPENAI_API_KEY,
    )
    vectorstore = Chroma(
        client=chroma_client,
        collection_name=f"space_{space_id}",
        embedding_function=embeddings,
    )
    return vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={
            "k": k,
            "fetch_k": 20,
            "lambda_mult": 0.7,
        },
    )
