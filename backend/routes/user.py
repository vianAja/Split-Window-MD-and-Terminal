from flask import Blueprint, request, jsonify
import psycopg2, jwt, os, bcrypt, json

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

@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    cursor.execute(
        "SELECT id, username, password, course FROM users WHERE username=%s",
        (username,)
    )
    user = cursor.fetchone()
    print('User in DB:',user, flush=True)
    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    user_id, user_name, user_password, user_course = user

    if not bcrypt.checkpw(password.encode(), user_password.encode()):
        return jsonify({"message": "Invalid credentials"}), 401

    print(json.dumps({"id": user_id, "username": user_name, "course": user_course}, indent=4), flush=True)
    # JWT include username + course
    token = jwt.encode(
        {"id": user_id, "username": user_name, "course": user_course},
        SECRET_KEY,
        algorithm="HS256"
    )

    return jsonify({
        "token": token,
        "id": user_id,
        "username": user_name,
        "course": user_course
    })

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
