from flask import Blueprint, request, jsonify
import bcrypt
import jwt
from datetime import datetime, timedelta
from config import Config
from database.supabase_client import supabase

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "student")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    existing = supabase.table("users").select("*").eq(
        "email", email
    ).execute()

    if existing.data:
        return jsonify({"error": "Email already registered"}), 409

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    user = supabase.table("users").insert({
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": role
    }).execute()

    return jsonify({
        "message": "Registration successful",
        "user": {
            "id": user.data[0]["id"],
            "name": name,
            "email": email,
            "role": role
        }
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    result = supabase.table("users").select("*").eq(
        "email", email
    ).execute()

    if not result.data:
        return jsonify({"error": "Invalid email or password"}), 401

    user = result.data[0]

    if not bcrypt.checkpw(
        password.encode("utf-8"),
        user["password"].encode("utf-8")
    ):
        return jsonify({"error": "Invalid email or password"}), 401

    token = jwt.encode(
        {
            "user_id": user["id"],
            "role": user["role"],
            "exp": datetime.utcnow() + timedelta(hours=24)
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
    })