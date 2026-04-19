const BASE = "http://localhost:5000";
// Адрес сервера Flask
// Когда выложишь на хостинг - поменяй на реальный адрес

function getToken() {
  return localStorage.getItem("token");
  // localStorage - хранилище в браузере, сохраняется даже после закрытия вкладки
  // Здесь лежит токен после входа
}

function authHeaders() {
  // Заголовки которые нужно добавлять к каждому защищённому запросу
  return {
    "Content-Type": "application/json",
    // Говорим серверу что отправляем JSON

    Authorization: `Bearer ${getToken()}`,
    // Прикрепляем токен. Flask читает его через request.headers.get("Authorization")
  };
}

export async function login(username, password) {
  // async - функция асинхронная (ждёт ответа сервера)
  const res = await fetch(`${BASE}/login`, {
    // await - ждём пока сервер ответит, только потом идём дальше
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    // JSON.stringify - превращает JavaScript объект в строку JSON для отправки
  });
  return res.json();
  // .json() - превращает ответ сервера обратно в JavaScript объект
}

export async function register(username, password) {
  // Такая же структура как login, только адрес другой
  const res = await fetch(`${BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function getItems() {
  const res = await fetch(`${BASE}/items`, {
    headers: authHeaders(),
    // authHeaders() добавляет токен - сервер знает кто делает запрос
  });
  return res.json();
}

export async function addItem(item) {
  const res = await fetch(`${BASE}/items`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(item),
    // item - объект с title, image, link, comment
  });
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`${BASE}/items/${id}`, {
    // id вставляется прямо в URL: /items/1234567890
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

export async function reserveItem(id) {
  const res = await fetch(`${BASE}/items/${id}/reserve`, {
    method: "POST",
    headers: authHeaders(),
  });
  return res.json();
}