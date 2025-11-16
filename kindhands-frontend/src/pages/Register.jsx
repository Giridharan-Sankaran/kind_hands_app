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
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Sign up to your account</h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleRegister} class="space-y-6">
          <div>
            <label for="name" class="block text-sm/6 font-medium text-gray-900">User name</label>
            <div class="mt-2">
              <input id="name" type="text" name="name" required autocomplete="name" placeholder="Full name" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" value={name} onChange={e => setName(e.target.value)} />
            </div>
          </div>

          <div>
            <label for="role" class="block text-sm/6 font-medium text-gray-900">User role</label>
            <select value={role} onChange={e => setRole(e.target.value)} required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
              <option value="">Select role</option>
              <option value="elder">Elder</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </div>

          <div>
            <label for="email" class="block text-sm/6 font-medium text-gray-900">Email address</label>
            <div class="mt-2">
              <input id="email" type="email" name="email" required autocomplete="email" placeholder="Email" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm/6 font-medium text-gray-900">Password</label>
            <div class="mt-2">
              <input id="password" type="password" name="password" required autocomplete="current-password" placeholder="Password" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          <div>
            <button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign up</button>
          </div>
        </form>

        <p class="mt-10 text-center text-sm/6 text-gray-500">
          Already have an account?
          <a href="/login" class="font-semibold text-indigo-600 hover:text-indigo-500"> &nbsp; Login </a>
        </p>
      </div>
    </div>
  );
}
