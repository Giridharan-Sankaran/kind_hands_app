// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUserFrontend } from "../services/authFrontendService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await loginUserFrontend(email, password);
    if (res.success) {
      setMsg("Login successful");
      navigate("/dashboard");
    } else {
      setMsg(res.error?.code || res.error?.message || "Login failed");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "24px auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
