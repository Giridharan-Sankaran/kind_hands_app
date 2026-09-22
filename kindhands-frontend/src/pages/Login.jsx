// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUserFrontend } from "../services/authFrontendService";
import { getToken } from "../services/api";
import ToteMark from "../components/illustrations/ToteMark";
import Button from "../components/ui/Button";
import { inputClass, labelClass } from "../styles/formClasses";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getToken()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");
    const res = await loginUserFrontend(email, password);
    setSubmitting(false);
    if (res.success) {
      onLogin?.(res.user, res.role);
      navigate("/dashboard");
    } else {
      setMsg(res.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="bg-pine-deep text-white px-8 py-12 md:w-1/2 md:flex md:flex-col md:justify-center">
        <div className="max-w-sm mx-auto md:mx-0">
          <div className="flex items-center gap-3">
            <ToteMark size={44} />
            <span className="font-display text-2xl font-bold">Kind Hands</span>
          </div>
          <h1 className="font-display mt-8 text-3xl md:text-4xl font-bold leading-tight">
            Neighbors helping neighbors shop.
          </h1>
          <p className="mt-4 text-white/75 text-base leading-relaxed">
            Kind Hands connects elders who need groceries with volunteers nearby who are glad to help —
            from picking the items to delivering them to your door.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-paper">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-bold text-ink">Welcome back</h2>
          <p className="mt-1 text-ink-muted">Log in to your account.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className={labelClass}>Email address</label>
              <input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>Password</label>
              <input
                id="password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="Password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={submitting} size="lg" className="w-full">
              {submitting ? "Logging in..." : "Log in"}
            </Button>
          </form>

          {msg && <p className="mt-4 text-sm text-clay">{msg}</p>}

          <p className="mt-8 text-sm text-ink-muted">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-pine hover:text-pine-deep">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
