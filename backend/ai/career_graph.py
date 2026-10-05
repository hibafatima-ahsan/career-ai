from typing import TypedDict
from langgraph.graph import StateGraph, END


class CareerState(TypedDict):
    question: str
    skills: str
    recommendation: str


def analyze_skills(state: CareerState):
    question = state["question"]

    # Simple beginner-friendly skill analysis
    skills = []

    keywords = {
        "python": "Python",
        "flask": "Flask",
        "react": "React",
        "javascript": "JavaScript",
        "machine learning": "Machine Learning",
        "sql": "SQL",
        "ai": "AI"
    }

    for keyword, skill in keywords.items():
        if keyword in question.lower():
            skills.append(skill)

    if not skills:
        skills.append("General Programming")

    return {"skills": ", ".join(skills)}


def generate_recommendation(state: CareerState):
    skills = state["skills"]

    recommendation = (
        f"Based on your mentioned skills ({skills}), "
        f"you can explore internships related to these technologies. "
        f"Build 2-3 practical projects and improve your GitHub portfolio."
    )

    return {"recommendation": recommendation}


# Create graph
graph = StateGraph(CareerState)

graph.add_node("analyze_skills", analyze_skills)
graph.add_node("generate_recommendation", generate_recommendation)

graph.set_entry_point("analyze_skills")

graph.add_edge("analyze_skills", "generate_recommendation")
graph.add_edge("generate_recommendation", END)

career_graph = graph.compile()


def get_career_recommendation(question):
    result = career_graph.invoke({
        "question": question,
        "skills": "",
        "recommendation": ""
    })

    return {
        "skills": result["skills"],
        "recommendation": result["recommendation"]
    }