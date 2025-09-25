from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sockets import Sockets
import os, bcrypt, jwt, psycopg2
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)
sockets = Sockets(app)
SECRET_KEY = os.getenv("JWT_SECRET", "test123")

# PostgreSQL connection
conn = psycopg2.connect(
    host="host.docker.internal",
    port=5432,
    user="vian",
    password="vian",
    database="participant"
)
cursor = conn.cursor()

# ---------------- AUTH ----------------
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"message": "Missing username or password"}), 400
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    try:
        cursor.execute(
            "INSERT INTO users (username, password) VALUES (%s, %s) RETURNING id, username",
            (username, hashed)
        )
        user = cursor.fetchone()
        conn.commit()
        return jsonify({"user": {"id": user[0], "username": user[1]}}), 201
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return jsonify({"message": "Username already exists"}), 409
    except Exception as e:
        print("Register error:", e)
        return jsonify({"message": "Server error"}), 500

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"message": "Missing username or password"}), 400
    cursor.execute("SELECT id, username, password FROM users WHERE username=%s", (username,))
    user = cursor.fetchone()
    if not user:
        return jsonify({"message": "Invalid credentials"}), 401
    if not bcrypt.checkpw(password.encode(), user[2].encode()):
        return jsonify({"message": "Invalid credentials"}), 401
    token = jwt.encode({"id": user[0], "username": user[1]}, SECRET_KEY, algorithm="HS256")
    return jsonify({"token": token})

# Middleware JWT decorator
def require_auth(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization")
        if not auth:
            return jsonify({"message": "No token provided"}), 401
        token = auth.split(" ")[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user = payload
        except Exception:
            return jsonify({"message": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated

@app.route("/profile", methods=["GET"])
@require_auth
def profile():
    return jsonify({"id": request.user["id"], "username": request.user["username"]})

# Root test
@app.route("/")
def root():
    return "Backend running: Flask server + Auth integrated."

# ---------------- WEBSOCKET SSH ----------------
# WebSocket + SSH bisa diimplementasikan dengan gevent + paramiko, nanti kalau mau aku buatkan contoh.

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3001)
