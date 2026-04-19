import { deleteItem, reserveItem } from "../api";
import "../styles/WishCard.css";

export default function WishCard({ item, isOwner, currentUser, onUpdate }) {
  // item - данные товара (title, image, link, comment, reserved_by)
  // isOwner - владелица или нет
  // currentUser - имя текущего пользователя
  // onUpdate - функция для обновления списка после действия

  const isReservedByMe = item.reserved_by === currentUser;
  // true если именно ТЫ забронировала этот товар

  const isReserved = !!item.reserved_by;
  // !! - двойное отрицание, превращает любое значение в true/false
  // "nastya" → true, null → false
  // true если товар забронирован хоть кем-то

  async function handleReserve() {
    await reserveItem(item.id);
    // Отправляем запрос на сервер (поставить или снять бронь)

    onUpdate();
    // Перезагружаем список чтобы увидеть изменения
  }

  async function handleDelete() {
    if (window.confirm("Удалить этот товар?")) {
      // Показываем диалог подтверждения - на случай если нажала случайно
      await deleteItem(item.id);
      onUpdate();
    }
  }

  return (
    <div className={`wish-card ${isReserved ? "reserved" : ""}`}>
      {/* Если забронировано - добавляем класс "reserved" (зелёная рамка в CSS) */}

      {item.image && (
        // Показываем фото только если ссылка на фото есть
        <div className="card-img-wrap">
          <img src={item.image} alt={item.title} />
          {/* alt - текст для скринридеров и если фото не загрузилось */}
        </div>
      )}

      <div className="card-body">
        <h3>{item.title}</h3>

        {item.comment && <p className="card-comment">{item.comment}</p>}
        {/* Комментарий показываем только если он есть */}

        {item.link && (
          <a href={item.link} target="_blank" rel="noreferrer" className="card-link">
            {/* target="_blank" - открывает ссылку в новой вкладке */}
            {/* rel="noreferrer" - безопасность: новая вкладка не знает откуда пришла */}
            Посмотреть товар →
          </a>
        )}

        <div className="card-actions">
          {!isOwner && (
            // Кнопку бронирования видят все КРОМЕ владелицы
            <button
              className={`btn-reserve ${isReservedByMe ? "reserved-me" : isReserved ? "reserved-other" : ""}`}
              // Класс меняется динамически:
              // "reserved-me" - ты забронировала (зелёная обводка)
              // "reserved-other" - кто-то другой забронировал (серая, неактивная)
              // "" - никто не бронировал (обычная зелёная кнопка)

              onClick={handleReserve}
              disabled={isReserved && !isReservedByMe}
              // disabled - кнопка некликабельна если кто-то другой уже забронировал
            >
              {isReservedByMe
                ? " Я куплю (отменить)"      // ты забронировала
                : isReserved
                ? " Уже забронировано"        // кто-то другой забронировал
                : " Куплю это!"}              // никто не бронировал
              {/* Три разных текста кнопки в зависимости от состояния */}
            </button>
          )}

          {isOwner && (
            // Владелица видит статус и кнопку удаления (вместо бронирования)
            <>
              {/* <> - это React Fragment, позволяет вернуть несколько элементов */}
              <span className="owner-badge">
                {isReserved ? " Кто-то покупает!" : " Никто не бронировал"}
                {/* Имя покупателя скрыто (сервер заменил его на ***) */}
              </span>
              <button className="btn-delete" onClick={handleDelete}>
                 Удалить
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}