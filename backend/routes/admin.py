from flask import Blueprint, jsonify

from database.supabase_client import supabase
from middleware.auth import token_required, role_required


admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/users", methods=["GET"])
@token_required
@role_required("admin")
def get_users():
    result = (
        supabase
        .table("users")
        .select("id, name, email, role, created_at")
        .execute()
    )

    return jsonify({
        "users": result.data
    }), 200


@admin_bp.route("/internships", methods=["GET"])
@token_required
@role_required("admin")
def get_all_internships():
    result = (
        supabase
        .table("internships")
        .select("*")
        .execute()
    )

    return jsonify({
        "internships": result.data
    }), 200


@admin_bp.route("/stats", methods=["GET"])
@token_required
@role_required("admin")
def get_stats():

    users = (
        supabase
        .table("users")
        .select("id, role")
        .execute()
    )

    internships = (
        supabase
        .table("internships")
        .select("id")
        .execute()
    )

    users_data = users.data or []

    students = sum(
        1 for user in users_data
        if user["role"] == "student"
    )

    companies = sum(
        1 for user in users_data
        if user["role"] == "company"
    )

    admins = sum(
        1 for user in users_data
        if user["role"] == "admin"
    )

    return jsonify({
        "total_users": len(users_data),
        "students": students,
        "companies": companies,
        "admins": admins,
        "total_internships": len(internships.data or [])
    }), 200

