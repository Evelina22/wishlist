from flask import Flask, request, jsonify
from flask_cors import CORS
import json, bcrypt, jwt, datetime
from functools import wraps

app = Flask(__name__)
CORS(app, supports_credentials=True)

SECRET_KEY = "bithday"
OWNER_USERNAME = "Aizhamal"
DB_PATH = "db.json"
USERS_PATH = "users.json"

def read_db():
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def write_db(data):
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def read_users():
    with open(USERS_PATH, "r", encoding="utf-8") as f:  # ← было ecording
        return json.load(f)

def write_users(data):
    with open(USERS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)  # ← было inden

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")  # ← было headest и "Авторизация"
        if not token:
            return jsonify({"error": "Нет токена"}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.current_user = data["username"]
        except:
            return jsonify({"error": "Неверный токен"}), 401
        return f(*args, **kwargs)
    return decorated

@app.route("/register", methods=["POST"])
def register():
    body = request.json
    username = body.get("username", "").strip()
    password = body.get("password", "").strip()

    if not username or not password:
        return jsonify({"error": "Заполни все поля"}), 400

    users = read_users()
    if username in users:
        return jsonify({"error": "Пользователь уже существует"}), 400

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    users[username] = {"password": hashed}
    write_users(users)
    return jsonify({"message": "Зарегистрировано успешно"})

@app.route("/login", methods=["POST"])
def login():
    body = request.json
    username = body.get("username", "").strip()
    password = body.get("password", "").strip()

    users = read_users()
    if username not in users:
        return jsonify({"error": "Неверный логин или пароль"}), 401

    stored = users[username]["password"].encode()
    if not bcrypt.checkpw(password.encode(), stored):
        return jsonify({"error": "Неверный логин или пароль"}), 401

    token = jwt.encode({
        "username": username,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)  # ← не было exp
    }, SECRET_KEY, algorithm="HS256")  # ← не было SECRET_KEY и algorithm

    return jsonify({
        "token": token,
        "username": username,
        "isOwner": username == OWNER_USERNAME
    })

@app.route("/items", methods=["GET"])
@token_required
def get_items():
    db = read_db()
    items = db["items"]
    if request.current_user != OWNER_USERNAME:
        return jsonify(items)
    sanitized = []
    for item in items:
        i = item.copy()
        i["reserved_by"] = "***" if item.get("reserved_by") else None
        sanitized.append(i)
    return jsonify(sanitized)

@app.route("/items", methods=["POST"])
@token_required
def add_item():
    if request.current_user != OWNER_USERNAME:
        return jsonify({"error": "Только владелец может добавлять товары"}), 403

    body = request.json
    db = read_db()
    new_item = {
        "id": int(datetime.datetime.utcnow().timestamp() * 1000),
        "title": body.get("title", ""),
        "image": body.get("image", ""),
        "link": body.get("link", ""),
        "comment": body.get("comment", ""),
        "reserved_by": None
    }
    db["items"].append(new_item)  # ← было append(new_item), 201 — запятая не там
    write_db(db)                  # ← не было write_db и return
    return jsonify(new_item), 201

@app.route("/items/<int:item_id>", methods=["DELETE"])
@token_required
def delete_item(item_id):
    if request.current_user != OWNER_USERNAME:
        return jsonify({"error": "Только владелец может удалять товары"}), 403

    db = read_db()
    db["items"] = [i for i in db["items"] if i["id"] != item_id]
    write_db(db)
    return jsonify({"message": "Удалено"})

@app.route("/items/<int:item_id>/reserve", methods=["POST"])
@token_required
def reserve_item(item_id):
    if request.current_user == OWNER_USERNAME:
        return jsonify({"error": "Владелец не может бронировать свои товары"}), 403

    db = read_db()
    for item in db["items"]:
        if item["id"] == item_id:
            if item["reserved_by"] and item["reserved_by"] != request.current_user:
                return jsonify({"error": "Уже забронировано другим"}), 400
            if item["reserved_by"] == request.current_user:
                item["reserved_by"] = None
                write_db(db)
                return jsonify({"reserved": False})
            else:
                item["reserved_by"] = request.current_user
                write_db(db)
                return jsonify({"reserved": True})

    return jsonify({"error": "Товар не найден"}), 404

app.run(host="0.0.0.0", port=5000, debug=False)