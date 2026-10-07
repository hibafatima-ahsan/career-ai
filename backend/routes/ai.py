from flask import Blueprint, request, jsonify
from ai.ollama_service import ask_ai
from middleware.auth import token_required
from database.supabase_client import supabase
from ai.career_graph import get_career_recommendation
from datetime import datetime, timezone

ai_bp = Blueprint("ai", __name__)


# ==========================================
# AI CHAT
# ==========================================

@ai_bp.route("/ask", methods=["POST"])
@token_required
def ask():
    data = request.get_json() or {}

    question = data.get("question", "").strip()
    conversation_id = data.get("conversation_id")

    if not question:
        return jsonify({
            "error": "Question is required"
        }), 400

    user_id = request.user["user_id"]

    print("========================================")
    print("AI REQUEST RECEIVED:", question)
    print("USER ID:", user_id)
    print("CONVERSATION ID:", conversation_id)
    print("========================================")

    # ------------------------------------------
    # CREATE CONVERSATION IF NEEDED
    # ------------------------------------------

    if not conversation_id:

        try:
            conversation = (
                supabase
                .table("chat_conversations")
                .insert({
                    "user_id": user_id,
                    "title": question[:60]
                })
                .execute()
            )

            print(
                "CONVERSATION CREATE RESPONSE:",
                conversation.data
            )

        except Exception as e:

            print(
                "CONVERSATION CREATE ERROR:",
                repr(e)
            )

            return jsonify({
                "error": "Could not create conversation"
            }), 500

        if not conversation.data:

            return jsonify({
                "error": "Could not create conversation"
            }), 500

        conversation_id = conversation.data[0]["id"]

        print(
            "NEW CONVERSATION CREATED:",
            conversation_id
        )

    # ------------------------------------------
    # VERIFY CONVERSATION BELONGS TO USER
    # ------------------------------------------

    try:

        conversation_check = (
            supabase
            .table("chat_conversations")
            .select("id")
            .eq("id", conversation_id)
            .eq("user_id", user_id)
            .execute()
        )

        print(
            "CONVERSATION CHECK:",
            conversation_check.data
        )

    except Exception as e:

        print(
            "CONVERSATION CHECK ERROR:",
            repr(e)
        )

        return jsonify({
            "error": "Could not verify conversation"
        }), 500

    if not conversation_check.data:

        return jsonify({
            "error": "Conversation not found"
        }), 404

    # ------------------------------------------
    # SAVE USER MESSAGE
    # ------------------------------------------

    try:

        user_message = (
            supabase
            .table("chat_messages")
            .insert({
                "conversation_id": conversation_id,
                "role": "user",
                "content": question
            })
            .execute()
        )

        print(
            "USER MESSAGE SAVED:",
            user_message.data
        )

    except Exception as e:

        print(
            "USER MESSAGE SAVE ERROR:",
            repr(e)
        )

        return jsonify({
            "error": "Could not save user message"
        }), 500

    if not user_message.data:

        return jsonify({
            "error": "Could not save user message"
        }), 500

    # ------------------------------------------
    # GENERATE AI RESPONSE
    # ------------------------------------------

    try:

        answer = ask_ai(question)

        print("AI RESPONSE GENERATED")

    except Exception as e:

        print(
            "AI GENERATION ERROR:",
            repr(e)
        )

        return jsonify({
            "error": "AI response could not be generated"
        }), 500

    # ------------------------------------------
    # SAVE AI RESPONSE
    # ------------------------------------------

    try:

        assistant_message = (
            supabase
            .table("chat_messages")
            .insert({
                "conversation_id": conversation_id,
                "role": "assistant",
                "content": answer
            })
            .execute()
        )

        print(
            "AI MESSAGE SAVED:",
            assistant_message.data
        )

    except Exception as e:

        print(
            "AI MESSAGE SAVE ERROR:",
            repr(e)
        )

        return jsonify({
            "error": "Could not save AI response"
        }), 500

    if not assistant_message.data:

        return jsonify({
            "error": "Could not save AI response"
        }), 500

    # ------------------------------------------
    # UPDATE CONVERSATION TIME
    # ------------------------------------------

    try:

        supabase \
            .table("chat_conversations") \
            .update({
                "updated_at": datetime.now(
                    timezone.utc
                ).isoformat()
            }) \
            .eq("id", conversation_id) \
            .execute()

        print(
            "CONVERSATION TIMESTAMP UPDATED"
        )

    except Exception as e:

        print(
            "CONVERSATION UPDATE ERROR:",
            repr(e)
        )

    print("========================================")
    print("AI CHAT COMPLETED")
    print("CONVERSATION ID:", conversation_id)
    print("========================================")

    return jsonify({
        "conversation_id": conversation_id,
        "question": question,
        "answer": answer
    }), 200


# ==========================================
# CAREER RECOMMENDATION
# ==========================================

@ai_bp.route("/career-recommendation", methods=["POST"])
@token_required
def career_recommendation():

    data = request.get_json() or {}

    question = data.get("question", "").strip()

    if not question:

        return jsonify({
            "error": "Question is required"
        }), 400

    try:

        result = get_career_recommendation(
            question
        )

        return jsonify(result), 200

    except Exception as e:

        print(
            "CAREER RECOMMENDATION ERROR:",
            repr(e)
        )

        return jsonify({
            "error": "Career recommendation could not be generated"
        }), 500