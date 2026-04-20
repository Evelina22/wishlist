import { deleteItem, reserveItem } from "../api";
import "../styles/WishCard.css";

export default function WishCard({ item, isOwner, currentUser, onUpdate }) {
  const isReservedByMe = item.reserved_by === currentUser;
  const isReserved = !!item.reserved_by;

  async function handleReserve() {
    await reserveItem(item.id);
    onUpdate();
  }

  async function handleDelete() {
    if (window.confirm("Удалить этот товар?")) {
      await deleteItem(item.id);
      onUpdate();
    }
  }

  return (
    <div className={`wish-card ${isReserved ? "reserved" : ""}`}>
      {item.image && (
        <div className="card-img-wrap">
          <img src={item.image} alt={item.title} />
        </div>
      )}

      <div className="card-body">
        <h3>{item.title}</h3>

        {item.comment && <p className="card-comment">{item.comment}</p>}

        {item.link && (
          <a href={item.link} target="_blank" rel="noreferrer" className="card-link">
            Посмотреть товар →
          </a>
        )}

        <div className="card-actions">
          {!isOwner && (
            <button
              className={`btn-reserve ${isReservedByMe ? "reserved-me" : isReserved ? "reserved-other" : ""}`}
              onClick={handleReserve}
              disabled={isReserved && !isReservedByMe}
            >
              {isReservedByMe
                ? " Я куплю (отменить)"
                : isReserved
                ? " Уже забронировано"
                : " Куплю это!"}
            </button>
          )}

          {isOwner && (
            <>
              <span className="owner-badge">
                {isReserved ? " Кто-то покупает!" : " Никто не бронировал"}
              </span>
              <button className="btn-delete" onClick={handleDelete}>
                🗑 Удалить
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

