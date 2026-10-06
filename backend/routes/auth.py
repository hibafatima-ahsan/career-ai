from flask import Blueprint, request, jsonify
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone

from config import Config
from database.supabase_client import supabase


auth_bp = Blueprint("auth", __name__)


# =========================
# REGISTER
# =========================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "student")

    # Only student and company accounts can be created
    # through public registration.
    if role not in ["student", "company"]:
        role = "student"

    # Validate required fields
    if not name or not email or not password:
        return jsonify({
            "error": "All fields are required"
        }), 400

    # Minimum password length
    if len(password) < 6:
        return jsonify({
            "error": "Password must be at least 6 characters"
        }), 400

    # Check whether email already exists
    existing = (
        supabase
        .table("users")
        .select("id")
        .eq("email", email)
        .execute()
    )

    if existing.data:
        return jsonify({
            "error": "Email already registered"
        }), 409

    # Hash password before storing it
    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    # Create user
    user = (
        supabase
        .table("users")
        .insert({
            "name": name,
            "email": email,
            "password": hashed_password,
            "role": role
        })
        .execute()
    )

    if not user.data:
        return jsonify({
            "error": "Registration failed"
        }), 500

    created_user = user.data[0]

    return jsonify({
        "message": "Registration successful",
        "user": {
            "id": created_user["id"],
            "name": created_user["name"],
            "email": created_user["email"],
            "role": created_user["role"]
        }
    }), 201


# =========================
# LOGIN
# =========================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    # Validate login fields
    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    # Find user by email
    result = (
        supabase
        .table("users")
        .select("*")
        .eq("email", email)
        .execute()
    )

    if not result.data:
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    user = result.data[0]

    # Verify password
    if not bcrypt.checkpw(
        password.encode("utf-8"),
        user["password"].encode("utf-8")
    ):
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    # Generate JWT token
    token = jwt.encode(
        {
            "user_id": user["id"],
            "role": user["role"],
            "exp": datetime.now(timezone.utc) + timedelta(hours=24)
        },
        Config.JWT_SECRET,
        algorithm="HS256"
    )

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 200
