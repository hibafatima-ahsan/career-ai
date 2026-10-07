from flask import Blueprint, request, jsonify
from database.supabase_client import supabase
from middleware.auth import token_required
from datetime import datetime, timezone
chat_bp = Blueprint("chat", __name__)


# --------------------------------------------------
# GET ALL CONVERSATIONS FOR LOGGED-IN USER
# --------------------------------------------------

@chat_bp.route("/conversations", methods=["GET"])
@token_required
def get_conversations():

    user_id = request.user["user_id"]

    result = (
        supabase
        .table("chat_conversations")
        .select("*")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .execute()
    )

    return jsonify(result.data), 200


# --------------------------------------------------
# CREATE NEW CONVERSATION
# --------------------------------------------------

@chat_bp.route("/conversations", methods=["POST"])
@token_required
def create_conversation():

    user_id = request.user["user_id"]

    data = request.get_json() or {}

    title = data.get("title", "New Career Chat")

    result = (
        supabase
        .table("chat_conversations")
        .insert({
            "user_id": user_id,
            "title": title
        })
        .execute()
    )

    if not result.data:
        return jsonify({
            "error": "Could not create conversation"
        }), 500

    return jsonify(result.data[0]), 201


# --------------------------------------------------
# GET MESSAGES FROM ONE CONVERSATION
# --------------------------------------------------

@chat_bp.route(
    "/conversations/<int:conversation_id>/messages",
    methods=["GET"]
)
@token_required
def get_messages(conversation_id):

    user_id = request.user["user_id"]

    # Make sure conversation belongs to logged-in user
    conversation = (
        supabase
        .table("chat_conversations")
        .select("id")
        .eq("id", conversation_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not conversation.data:
        return jsonify({
            "error": "Conversation not found"
        }), 404

    result = (
        supabase
        .table("chat_messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at")
        .execute()
    )

    return jsonify(result.data), 200


# --------------------------------------------------
# SAVE MESSAGE
# --------------------------------------------------

@chat_bp.route(
    "/conversations/<int:conversation_id>/messages",
    methods=["POST"]
)
@token_required
def save_message(conversation_id):

    user_id = request.user["user_id"]

    data = request.get_json() or {}

    role = data.get("role")
    content = data.get("content", "").strip()

    if role not in ["user", "assistant"]:
        return jsonify({
            "error": "Invalid message role"
        }), 400

    if not content:
        return jsonify({
            "error": "Message content is required"
        }), 400

    # Make sure conversation belongs to logged-in user
    conversation = (
        supabase
        .table("chat_conversations")
        .select("id")
        .eq("id", conversation_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not conversation.data:
        return jsonify({
            "error": "Conversation not found"
        }), 404

    result = (
        supabase
        .table("chat_messages")
        .insert({
            "conversation_id": conversation_id,
            "role": role,
            "content": content
        })
        .execute()
    )

    # Update conversation timestamp
    supabase \
    .table("chat_conversations") \
    .update({
        "updated_at": datetime.now(timezone.utc).isoformat()
    }) \
    .eq("id", conversation_id) \
    .execute()

    if not result.data:
        return jsonify({
            "error": "Could not save message"
        }), 500

    return jsonify(result.data[0]), 201


# --------------------------------------------------
# DELETE CONVERSATION
# --------------------------------------------------

@chat_bp.route(
    "/conversations/<int:conversation_id>",
    methods=["DELETE"]
)
@token_required
def delete_conversation(conversation_id):

    user_id = request.user["user_id"]

    result = (
        supabase
        .table("chat_conversations")
        .delete()
        .eq("id", conversation_id)
        .eq("user_id", user_id)
        .execute()
    )

    return jsonify({
        "message": "Conversation deleted"
    }), 200