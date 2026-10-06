from flask import Blueprint, request, jsonify
import bcrypt
import jwt
import os
import secrets
from datetime import datetime, timedelta, timezone

from config import Config
from database.supabase_client import supabase
from services.email_service import send_verification_email


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

    # Generate secure email verification token
    verification_token = secrets.token_urlsafe(32)

    # Create user
    user = (
        supabase
        .table("users")
        .insert({
            "name": name,
            "email": email,
            "password": hashed_password,
            "role": role,
            "email_verified": False,
            "verification_token": verification_token
        })
        .execute()
    )

    if not user.data:
        return jsonify({
            "error": "Registration failed"
        }), 500

    created_user = user.data[0]

    # Create verification link
    verification_link = (
        f"{os.getenv('FRONTEND_URL')}"
        f"/verify-email?token={verification_token}"
    )

    # Send verification email
    try:
        send_verification_email(
            created_user["email"],
            verification_link
        )
    except Exception as e:
        print("Verification email error:", e)

        return jsonify({
            "error": "Account created, but verification email could not be sent"
        }), 500

    return jsonify({
        "message": "Registration successful. Please check your email to verify your account.",
        "user": {
            "id": created_user["id"],
            "name": created_user["name"],
            "email": created_user["email"],
            "role": created_user["role"]
        }
    }), 201

# =========================
# VERIFY EMAIL
# =========================
@auth_bp.route("/verify-email", methods=["GET"])
def verify_email():
    token = request.args.get("token")

    if not token:
        return jsonify({
            "error": "Verification token is missing"
        }), 400

    result = (
        supabase
        .table("users")
        .select("id, email_verified")
        .eq("verification_token", token)
        .execute()
    )

    if not result.data:
        return jsonify({
            "error": "Invalid verification token"
        }), 400

    user = result.data[0]

    if user["email_verified"]:
        return jsonify({
            "message": "Email is already verified"
        }), 200

    updated = (
        supabase
        .table("users")
        .update({
            "email_verified": True,
            "verification_token": None
        })
        .eq("id", user["id"])
        .execute()
    )

    if not updated.data:
        return jsonify({
            "error": "Email verification failed"
        }), 500

    return jsonify({
        "message": "Email verified successfully"
    }), 200
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
