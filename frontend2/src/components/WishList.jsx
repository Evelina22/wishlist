import { useState, useEffect } from "react";
import { getItems } from "../api";
import WishCard from "./WishCard";
import AddItem from "./AddItem";
import "../styles/WishList.css";

export default function WishList({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    const data = await getItems();
    if (Array.isArray(data)) setItems(data);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="wishlist-page">
      <header className="wishlist-header">
        <div className="header-left">
          <span className="logo">Вишлист</span>
          <span className="header-user">Привет, {user.username}!</span>
        </div>
        <div className="header-right">
          {user.isOwner && (
            <button className="btn-add" onClick={() => setShowAdd(true)}>
              + Добавить желание
            </button>
          )}
          <button className="btn-logout" onClick={onLogout}>Выйти</button>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="empty">
          <p>Пока здесь пусто</p>
        </div>
      ) : (
        <div className="cards-grid">
          {items.map((item) => (
            <WishCard
              key={item.id}
              item={item}
              isOwner={user.isOwner}
              currentUser={user.username}
              onUpdate={load}
            />
          ))}
        </div>
      )}

      {showAdd && (
        <AddItem
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); load(); }}
        />
      )}
    </div>
  );
}