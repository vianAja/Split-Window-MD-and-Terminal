from flask import Blueprint, request, jsonify
import psycopg2, jwt, os

user_bp = Blueprint("user_bp", __name__)
SECRET_KEY = os.getenv("JWT_SECRET", "test123")

conn = psycopg2.connect(
    host="localhost",
    database="yourdb",
    user="postgres",
    password="yourpassword",
    port=5432
)
cursor = conn.cursor()

@user_bp.route("/validate-user", methods=["POST"])
def validate_user():
    data = request.get_json()
    token = data.get("token")
    if not token:
        return jsonify({"success": False, "message": "No token provided"}), 401
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        cursor.execute(
            "SELECT * FROM users WHERE username=%s AND email=%s AND name=%s",
            (decoded["username"], decoded["email"], decoded["name"])
        )
        user = cursor.fetchone()
        if user:
            return jsonify({"success": True, "user": user})
        else:
            return jsonify({"success": False, "message": "User not valid"}), 401
    except Exception as e:
        print("DB error:", e)
        return jsonify({"success": False, "message": "Server error"}), 500
