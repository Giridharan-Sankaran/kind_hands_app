// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, Users, Check } from "lucide-react";
import { registerUserFrontend } from "../services/authFrontendService";
import ToteMark from "../components/illustrations/ToteMark";
import Button from "../components/ui/Button";
import { inputClass, labelClass } from "../styles/formClasses";

const ROLES = [
  {
    value: "elder",
    title: "I need groceries",
    description: "Order what you need and have a volunteer shop and deliver it.",
    icon: ShoppingBag,
  },
  {
    value: "volunteer",
    title: "I want to volunteer",
    description: "Shop and deliver for elders near you, on your own schedule.",
    icon: Users,
  },
];

export default function Register({ onLogin }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!["elder", "volunteer"].includes(role)) {
      setMsg("Please choose whether you need groceries or want to volunteer.");
      return;
    }
    if (password.length < 8) {
      setMsg("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    setMsg("");
    const res = await registerUserFrontend(name, email, password, role);
    setSubmitting(false);
    if (res.success) {
      onLogin?.(res.user, res.user.role);
      navigate("/dashboard");
    } else {
      setMsg(res.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Brand panel */}
      <div className="bg-pine-deep text-white px-8 py-12 md:w-1/2 md:flex md:flex-col md:justify-center">
        <div className="max-w-sm mx-auto md:mx-0">
          <div className="flex items-center gap-3">
            <ToteMark size={44} />
            <span className="font-display text-2xl font-bold">Kind Hands</span>
          </div>
          <h1 className="font-display mt-8 text-3xl md:text-4xl font-bold leading-tight">
            Everyone here is glad you came.
          </h1>
          <p className="mt-4 text-white/75 text-base leading-relaxed">
            Whether you need a hand with groceries or you're ready to lend one, it takes two minutes to get started.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-paper">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-bold text-ink">Create your account</h2>

          <form onSubmit={handleRegister} className="mt-6 space-y-5">
            <div>
              <label className={labelClass}>I am here to...</label>
              <div className="mt-1 space-y-2">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const selected = role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`w-full flex items-start gap-3 rounded-xl p-3.5 text-left transition-colors outline outline-1 ${
                        selected ? "bg-pine-light outline-pine" : "bg-surface outline-line hover:bg-paper"
                      }`}
                    >
                      <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-pine text-white" : "bg-paper text-ink-muted"}`}>
                        <Icon size={18} />
                      </span>
                      <span className="flex-1">
                        <span className="block font-semibold text-ink">{r.title}</span>
                        <span className="block text-sm text-ink-muted mt-0.5">{r.description}</span>
                      </span>
                      {selected && <Check size={18} className="mt-1.5 text-pine shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="name" className={labelClass}>Full name</label>
              <input id="name" type="text" required autoComplete="name" placeholder="Your name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>Email address</label>
              <input id="email" type="email" required autoComplete="email" placeholder="you@example.com" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>Password</label>
              <input id="password" type="password" required autoComplete="new-password" placeholder="At least 8 characters" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <Button type="submit" disabled={submitting} size="lg" className="w-full">
              {submitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          {msg && <p className="mt-4 text-sm text-clay">{msg}</p>}

          <p className="mt-8 text-sm text-ink-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-pine hover:text-pine-deep">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
