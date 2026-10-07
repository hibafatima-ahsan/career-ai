from flask import Blueprint, request, jsonify

from database.supabase_client import supabase
from middleware.auth import token_required, role_required


internships_bp = Blueprint("internships", __name__)


# =========================================================
# GET ALL INTERNSHIPS
# =========================================================

@internships_bp.route("/", methods=["GET"])
def get_internships():

    try:
        result = (
            supabase
            .table("internships")
            .select("*")
            .execute()
        )

        return jsonify(result.data), 200

    except Exception as error:

        print("Get internships error:", error)

        return jsonify({
            "error": "Could not load internships."
        }), 500


# =========================================================
# CREATE INTERNSHIP
# =========================================================

@internships_bp.route("/", methods=["POST"])
@token_required
@role_required("company", "admin")
def create_internship():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No internship data received."
            }), 400

        # ---------------------------------------------
        # Validate required fields
        # ---------------------------------------------

        required_fields = [
            "title",
            "description",
            "skills",
            "location",
            "duration"
        ]

        for field in required_fields:

            if not data.get(field):
                return jsonify({
                    "error": f"{field.replace('_', ' ').title()} is required."
                }), 400

        # ---------------------------------------------
        # Create internship object
        # ---------------------------------------------

        internship = {
            "company_id": request.user["user_id"],
            "title": data.get("title"),
            "description": data.get("description"),
            "requirements": data.get("requirements"),
            "skills": data.get("skills"),
            "location": data.get("location"),
            "stipend": data.get("stipend"),
            "duration": data.get("duration"),
            "deadline": data.get("deadline")
        }

        # ---------------------------------------------
        # Insert into Supabase
        # ---------------------------------------------

        result = (
            supabase
            .table("internships")
            .insert(internship)
            .execute()
        )

        if not result.data:

            return jsonify({
                "error": "Internship could not be created."
            }), 500

        return jsonify({
            "message": "Internship created successfully.",
            "internship": result.data[0]
        }), 201

    except Exception as error:

        print("Create internship error:", error)

        return jsonify({
            "error": "Could not create internship.",
            "details": str(error)
        }), 500


# =========================================================
# DELETE INTERNSHIP
# =========================================================

@internships_bp.route(
    "/<int:internship_id>",
    methods=["DELETE"]
)
@token_required
@role_required("company", "admin")
def delete_internship(internship_id):

    try:

        result = (
            supabase
            .table("internships")
            .delete()
            .eq("id", internship_id)
            .execute()
        )

        return jsonify({
            "message": "Internship deleted successfully."
        }), 200

    except Exception as error:

        print("Delete internship error:", error)

        return jsonify({
            "error": "Could not delete internship.",
            "details": str(error)
        }), 500