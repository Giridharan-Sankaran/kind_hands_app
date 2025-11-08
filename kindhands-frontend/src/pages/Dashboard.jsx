// src/pages/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard({ user, role }) {
  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <h2>Dashboard</h2>
      <p>Welcome, {user?.email} — role: {role || "unknown"}</p>

      {role === "elder" && (
        <>
          <h3>Your actions</h3>
          <ul>
            <li><Link to="/create-request">Create a new help request</Link></li>
            <li><Link to="/requests">View your requests</Link></li>
          </ul>
        </>
      )}

      {role === "volunteer" && (
        <>
          <h3>Volunteer actions</h3>
          <ul>
            <li><Link to="/requests">Browse open requests</Link></li>
          </ul>
        </>
      )}
    </div>
  );
}
