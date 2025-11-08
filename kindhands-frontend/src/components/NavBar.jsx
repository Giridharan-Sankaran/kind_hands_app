// src/components/NavBar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { logoutUserFrontend } from "../services/authFrontendService";

export default function NavBar({ user, role }) {
  const handleLogout = async () => {
    await logoutUserFrontend();
    window.location.href = "/login";
  };

  return (
    <nav style={{ padding: 12, background: "#f5f5f5", display: "flex", gap: 12 }}>
      <Link to="/">Home</Link>
      {user && <Link to="/dashboard">Dashboard</Link>}
      {user && <Link to="/requests">Requests</Link>}
      {user && role === "elder" && <Link to="/create-request">Create Request</Link>}
      {user ? (
        <>
          <Link to="/profile">Profile</Link>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Sign Up</Link>
        </>
      )}
    </nav>
  );
}
