from flask import Flask, jsonify
from flask_cors import CORS
from database.supabase_client import supabase
from routes.auth import auth_bp
from routes.internships import internships_bp
from routes.ai import ai_bp
app = Flask(__name__)
CORS(app)
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(
    internships_bp,
    url_prefix="/api/internships"
)
app.register_blueprint(
    ai_bp,
    url_prefix="/api/ai"
)
@app.route("/")
def home():
    return jsonify({
        "message": "CareerAI API is running!"
    })


@app.route("/api/health")
def health():
    return jsonify({
        "status": "healthy",
        "database": "connected"
    })


@app.route("/api/test-db")
def test_db():
    response = supabase.table("users").select("*").execute()

    return jsonify({
        "success": True,
        "users": response.data
    })


if __name__ == "__main__":
    app.run(debug=True)