import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import "./styles/App.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
// Находим элемент <div id="root"> в public/index.html
// React будет рендерить всё приложение внутри него

root.render(<App />);
// Вставляем компонент App как первый (корневой) компонент
// Всё остальное будет вложено внутрь App