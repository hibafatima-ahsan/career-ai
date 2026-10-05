from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="qwen2.5:0.5b",
    temperature=0.2
)


def ask_ai(question):
    response = llm.invoke(question)
    return response.content