// src/services/profileService.js
import { apiRequest } from "./api";

export async function getMyProfile() {
  const data = await apiRequest("/profile");
  return data.profile;
}

export async function updateMyProfile(fields) {
  const data = await apiRequest("/profile", { method: "PATCH", body: fields });
  return data.profile;
}
