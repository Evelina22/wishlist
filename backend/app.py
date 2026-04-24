from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt
import jwt
import datetime
from functools import wraps
import psycopg2
import os

app = Flask(__name__)
CORS(app, supports_credentials=True)

SECRET_KEY = "bithday"
OWNER_USERNAME = "Aijamal"

DATABASE_URL = os.environ.get("DATABASE_URL")

def get_db():
    return psycopg2.connect(DATABASE_URL)


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
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

    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT username FROM users WHERE username = %s", (username,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "Пользователь уже существует"}), 400

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    cur.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Зарегистрировано успешно"})


@app.route("/login", methods=["POST"])
def login():
    body = request.json
    username = body.get("username", "").strip()
    password = body.get("password", "").strip()

    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT password FROM users WHERE username = %s", (username,))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "Неверный логин или пароль"}), 401

    if not bcrypt.checkpw(password.encode(), row[0].encode()):
        return jsonify({"error": "Неверный логин или пароль"}), 401

    token = jwt.encode({
        "username": username,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, SECRET_KEY, algorithm="HS256")

    return jsonify({
        "token": token,
        "username": username,
        "isOwner": username == OWNER_USERNAME
    })


@app.route("/items", methods=["GET"])
@token_required
def get_items():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT id, title, image, link, comment, reserved_by FROM items")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    items = []
    for row in rows:
        item = {
            "id": row[0],
            "title": row[1],
            "image": row[2],
            "link": row[3],
            "comment": row[4],
            "reserved_by": row[5]
        }
        if request.current_user == OWNER_USERNAME:
            item["reserved_by"] = "***" if row[5] else None
        items.append(item)

    return jsonify(items)


@app.route("/items", methods=["POST"])
@token_required
def add_item():
    if request.current_user != OWNER_USERNAME:
        return jsonify({"error": "Только владелец может добавлять товары"}), 403

    body = request.json
    item_id = int(datetime.datetime.utcnow().timestamp() * 1000)

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO items (id, title, image, link, comment, reserved_by) VALUES (%s, %s, %s, %s, %s, NULL)",
        (item_id, body.get("title", ""), body.get("image", ""), body.get("link", ""), body.get("comment", ""))
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "id": item_id,
        "title": body.get("title", ""),
        "image": body.get("image", ""),
        "link": body.get("link", ""),
        "comment": body.get("comment", ""),
        "reserved_by": None
    }), 201


@app.route("/items/<int:item_id>", methods=["DELETE"])
@token_required
def delete_item(item_id):
    if request.current_user != OWNER_USERNAME:
        return jsonify({"error": "Только владелец может удалять товары"}), 403

    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM items WHERE id = %s", (item_id,))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Удалено"})


@app.route("/items/<int:item_id>/reserve", methods=["POST"])
@token_required
def reserve_item(item_id):
    if request.current_user == OWNER_USERNAME:
        return jsonify({"error": "Владелец не может бронировать свои товары"}), 403

    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT reserved_by FROM items WHERE id = %s", (item_id,))
    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return jsonify({"error": "Товар не найден"}), 404

    reserved_by = row[0]

    if reserved_by and reserved_by != request.current_user:
        cur.close()
        conn.close()
        return jsonify({"error": "Уже забронировано другим"}), 400

    if reserved_by == request.current_user:
        cur.execute("UPDATE items SET reserved_by = NULL WHERE id = %s", (item_id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"reserved": False})
    else:
        cur.execute("UPDATE items SET reserved_by = %s WHERE id = %s", (request.current_user, item_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"reserved": True})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)