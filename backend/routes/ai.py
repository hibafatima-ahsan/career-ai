from flask import Blueprint, request, jsonify
from ai.ollama_service import ask_ai
from middleware.auth import token_required
from ai.career_graph import get_career_recommendation
ai_bp = Blueprint("ai", __name__)


@ai_bp.route("/ask", methods=["POST"])
@token_required
def ask():
    data = request.get_json()
    question = data.get("question")

    if not question:
        return jsonify({"error": "Question is required"}), 400

    print("AI request received:", question)

    answer = ask_ai(question)

    print("AI response generated")

    return jsonify({
        "question": question,
        "answer": answer
    })
@ai_bp.route("/career-recommendation", methods=["POST"])
@token_required
def career_recommendation():
    data = request.get_json()
    question = data.get("question")

    if not question:
        return jsonify({"error": "Question is required"}), 400

    result = get_career_recommendation(question)

    return jsonify(result)