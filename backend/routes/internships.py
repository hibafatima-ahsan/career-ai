from flask import Blueprint, request, jsonify
from database.supabase_client import supabase
from middleware.auth import token_required, role_required

internships_bp = Blueprint("internships", __name__)


@internships_bp.route("/", methods=["GET"])
def get_internships():
    result = supabase.table("internships").select("*").execute()

    return jsonify(result.data)


@internships_bp.route("/", methods=["POST"])
@token_required
@role_required("company", "admin")
def create_internship():
    data = request.get_json()

    internship = {
        "company_id": request.user["user_id"],
        "title": data.get("title"),
        "description": data.get("description"),
        "skills": data.get("skills"),
        "location": data.get("location"),
        "stipend": data.get("stipend"),
        "duration": data.get("duration")
    }

    result = supabase.table("internships").insert(
        internship
    ).execute()

    return jsonify({
        "message": "Internship created",
        "internship": result.data[0]
    }), 201


@internships_bp.route("/<int:internship_id>", methods=["DELETE"])
@token_required
@role_required("company", "admin")
def delete_internship(internship_id):
    supabase.table("internships").delete().eq(
        "id", internship_id
    ).execute()

    return jsonify({
        "message": "Internship deleted"
    })