// src/services/authFrontendService.js
import { apiRequest, setToken, clearToken } from "./api";

export async function registerUserFrontend(name, email, password, role) {
  try {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: { name, email, password, role },
      auth: false,
    });
    setToken(data.token);
    return { success: true, user: data.user };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function loginUserFrontend(email, password) {
  try {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    setToken(data.token);
    return { success: true, user: data.user, role: data.user.role };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Restores a session from a previously-stored JWT, verifying it against
// the backend rather than trusting whatever is in localStorage.
export async function getCurrentUserFrontend() {
  try {
    const data = await apiRequest("/auth/me", { method: "GET" });
    return { success: true, user: data.user, role: data.user.role };
  } catch (err) {
    clearToken();
    return { success: false, error: err.message };
  }
}

export async function logoutUserFrontend() {
  clearToken();
  return { success: true };
}
