import { useState, useEffect } from "react";
import Login from "./components/Login";
import WishList from "./components/WishList";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const isOwner = localStorage.getItem("isOwner") === "true";
    if (token && username) setUser({ username, isOwner });
  }, []);

  function handleLogin(userData) {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("username", userData.username);
    localStorage.setItem("isOwner", userData.isOwner);
    setUser({ username: userData.username, isOwner: userData.isOwner });
  }

  function handleLogout() {
    localStorage.clear();
    setUser(null);
  }

  return (
    <div className="app">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <WishList user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}