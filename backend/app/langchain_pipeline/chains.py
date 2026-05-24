from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.documents import Document as LCDocument
from typing import List, Tuple, AsyncIterator
from app.langchain_pipeline.retriever import get_retriever
from app.langchain_pipeline.prompts import RAG_PROMPT
from app.config import settings
import structlog

logger = structlog.get_logger()


def format_documents(docs: List[LCDocument]) -> str:
    formatted = []
    for i, doc in enumerate(docs, 1):
        meta = doc.metadata
        formatted.append(
            f"[{i}] (Source: {meta.get('source', 'Unknown')}, "
            f"Page {meta.get('page_number', 'N/A')})\n"
            f"{doc.page_content}"
        )
    return "\n\n---\n\n".join(formatted)


def build_chat_history(history: List[dict]) -> List:
    messages = []
    for msg in history:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))
    return messages


def build_rag_chain(space_id: str, model: str = "gpt-4o", api_key: str = None):
    retriever = get_retriever(space_id, api_key=api_key)
    llm = ChatOpenAI(
        model=model,
        temperature=0.1,
        streaming=True,
        openai_api_key=api_key or settings.OPENAI_API_KEY,
    )

    chain = (
        {
            "context": lambda x: format_documents(retriever.invoke(x["input"])),
            "input": lambda x: x["input"],
            "chat_history": lambda x: x.get("chat_history", []),
        }
        | RAG_PROMPT
        | llm
        | StrOutputParser()
    )
    return chain, retriever


async def stream_rag_response(
    space_id: str,
    question: str,
    chat_history: List[dict],
    model: str = "gpt-4o",
    api_key: str = None,
) -> AsyncIterator[str]:
    chain, _ = build_rag_chain(space_id, model, api_key)
    history = build_chat_history(chat_history)

    async for token in chain.astream({
        "input": question,
        "chat_history": history,
    }):
        yield token


async def retrieve_sources(
    space_id: str,
    question: str,
    api_key: str = None,
) -> List[dict]:
    retriever = get_retriever(space_id, api_key=api_key)
    docs = await retriever.ainvoke(question)
    return [
        {
            "index": i + 1,
            "document_id": doc.metadata.get("document_id", ""),
            "document_name": doc.metadata.get("source", "Unknown"),
            "page_number": doc.metadata.get("page_number"),
            "chunk_index": doc.metadata.get("chunk_index", 0),
            "chunk_text": doc.page_content[:300],
            "relevance_score": float(doc.metadata.get("score", 0.0)),
        }
        for i, doc in enumerate(docs)
    ]


async def generate_title(question: str, answer: str, api_key: str = None) -> str:
    from app.langchain_pipeline.prompts import TITLE_GENERATION_PROMPT
    llm = ChatOpenAI(
        model=settings.OPENAI_CHAT_MODEL_MINI,
        temperature=0,
        openai_api_key=api_key or settings.OPENAI_API_KEY,
    )
    prompt = TITLE_GENERATION_PROMPT.format(question=question, answer=answer[:200])
    result = await llm.ainvoke(prompt)
    return result.content.strip()[:100]


async def generate_suggestions(excerpts: str, api_key: str = None) -> List[str]:
    from app.langchain_pipeline.prompts import SUGGESTIONS_PROMPT
    llm = ChatOpenAI(
        model=settings.OPENAI_CHAT_MODEL_MINI,
        temperature=0.7,
        openai_api_key=api_key or settings.OPENAI_API_KEY,
    )
    prompt = SUGGESTIONS_PROMPT.format(excerpts=excerpts[:2000])
    result = await llm.ainvoke(prompt)
    lines = [l.strip() for l in result.content.strip().split("\n") if l.strip()]
    return lines[:5]
