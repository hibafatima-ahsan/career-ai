from pathlib import Path

from langchain_ollama import (
    ChatOllama,
    OllamaEmbeddings
)
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter
)
from langchain_community.vectorstores import FAISS


BASE_DIR = Path(__file__).resolve().parents[2]
DATA_FILE = BASE_DIR / "data" / "career_knowledge.txt"


embeddings = OllamaEmbeddings(
    model="nomic-embed-text"
)

llm = ChatOllama(
    model="qwen2.5:0.5b",
    temperature=0.2
)


def create_vector_store():
    text = DATA_FILE.read_text(encoding="utf-8")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    documents = splitter.create_documents([text])

    return FAISS.from_documents(
        documents,
        embeddings
    )


vector_store = create_vector_store()


def ask_rag(question):
    documents = vector_store.similarity_search(
        question,
        k=3
    )

    context = "\n\n".join(
        doc.page_content for doc in documents
    )

    prompt = f"""
You are CareerAI, a career assistant.

Answer the user's question using the provided career knowledge.

Knowledge:
{context}

Question:
{question}

Give a practical and beginner-friendly answer.
"""

    response = llm.invoke(prompt)

    return response.content