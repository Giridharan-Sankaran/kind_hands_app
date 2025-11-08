// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUserFrontend } from "../services/authFrontendService";

export default function Register() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!["elder", "volunteer"].includes(role)) {
      setMsg("Please select a role");
      return;
    }
    const res = await registerUserFrontend(name, email, password, role);
    if (res.success) {
      setMsg("Registered. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1000);
    } else {
      setMsg(res.error?.code || res.error?.message || "Registration failed");
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: "24px auto" }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleRegister}>
        <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
        <select value={role} onChange={e => setRole(e.target.value)} required>
          <option value="">Select role</option>
          <option value="elder">Elder</option>
          <option value="volunteer">Volunteer</option>
        </select>
        <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
