// src/pages/Profile.jsx
import React from "react";

export default function Profile({ user, role }) {
  return (
    <div style={{ maxWidth: 700, margin: "20px auto" }}>
      <h2>Profile</h2>
      <div>Email: {user.email}</div>
      <div>UID: {user.uid}</div>
      <div>Role: {role}</div>
    </div>
  );
}
