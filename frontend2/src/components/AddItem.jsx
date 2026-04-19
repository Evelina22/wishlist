import { useState } from "react";
import { addItem } from "../api";

export default function AddItem({ onClose, onAdded }) {
  // onClose - закрыть окно без сохранения
  // onAdded - закрыть окно И обновить список (вызывается после успешного добавления)

  const [form, setForm] = useState({
    title: "",
    image: "",
    link: "",
    comment: ""
  });
  // Один объект хранит все поля формы сразу
  // Проще чем делать отдельный useState для каждого поля

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    // ...form - копируем все старые поля (spread оператор)
    // [e.target.name] - динамический ключ: берём имя из атрибута name у input
    //   например если меняем <input name="title"> то ключ будет "title"
    // e.target.value - новое значение которое ввёл пользователь
    // Итог: обновляем ТОЛЬКО одно поле, остальные остаются как были
  }

  async function handleSubmit() {
    if (!form.title) return alert("Название обязательно!");
    // Проверяем что хотя бы название заполнено

    await addItem(form);
    // Отправляем весь объект form на сервер

    onAdded();
    // Закрываем окно и обновляем список товаров
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Клик на тёмный фон закрывает окно */}

      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* e.stopPropagation() - останавливает "всплытие" клика
            Без этого клик по окну доходил бы до фона и закрывал окно
            С этим - клик по окну остаётся внутри окна */}

        <h2> Новое желание</h2>

        <input
          name="title"
          // name="title" - handleChange использует это чтобы знать какое поле обновлять
          placeholder="Название товара *"
          value={form.title}
          onChange={handleChange}
        />
        <input
          name="image"
          placeholder="Ссылка на фото (URL)"
          value={form.image}
          onChange={handleChange}
        />
        <input
          name="link"
          placeholder="Ссылка на товар"
          value={form.link}
          onChange={handleChange}
        />
        <textarea
          name="comment"
          placeholder="Комментарий (например: размер, цвет...)"
          value={form.comment}
          onChange={handleChange}
          // textarea работает так же как input с handleChange
        />

        <div className="modal-actions">
          <button className="btn-main" onClick={handleSubmit}>Добавить</button>
          <button className="btn-cancel" onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
}