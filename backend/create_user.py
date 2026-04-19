import json
import bcrypt

USERS_PATH = "user.json"
def create_user(username, password):
    try:
        with open(USERS_PATH, "r") as f:
            users = json.load(f)
    except:
        users = {}
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    users[username] = {"password": hashed}

    with open(USERS_PATH, "w") as f:
        json.dump(users, f, ensure_ascii=False, indent=2)

    print(f" Пользователь '{username}' создан!")


create_user("Aizhamal", "10072009")
create_user("Evelina", "22022010E")
