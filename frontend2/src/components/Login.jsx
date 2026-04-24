import { useState } from "react";
import { login, register } from "../api";
import "../styles/Login.css";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    const fn = mode === "login" ? login : register;
    const data = await fn(username, password);

    if (data.error) return setError(data.error);

    if (mode === "register") {
      setMode("login");
      setError("Аккаунт создан! Теперь войди.");
      return;
    }

    onLogin(data);
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-leaf">😋</div>
        <h1>Вишлист Айжамал</h1>
        <p className="login-sub">
          {mode === "login" ? "Войди чтобы посмотреть" : "Создай аккаунт"}
        </p>

        <input
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        {error && <p className="login-error">{error}</p>}

        <button className="btn-main" onClick={handleSubmit}>
          {mode === "login" ? "Войти" : "Зарегистрироваться"}
        </button>

        <button
          className="btn-link"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "Нет аккаунта? Зарегистрироваться"
            : "Уже есть аккаунт? Войти"}
        </button>
      </div>
    </div>
  );
}