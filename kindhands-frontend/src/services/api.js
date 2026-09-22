// src/services/api.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const TOKEN_KEY = "kh_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error("We couldn't reach the server. Please check your connection and try again.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // No JSON body — fine.
  }

  if (!res.ok) {
    throw new Error(data?.message || "Something went wrong. Please try again.");
  }

  return data;
}
