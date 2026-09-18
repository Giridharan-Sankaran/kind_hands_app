// src/services/shopService.js
import { apiRequest } from "./api";

export async function searchShops({ search, city, lat, lng } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (city) params.set("city", city);
  if (lat != null && lng != null) {
    params.set("lat", lat);
    params.set("lng", lng);
  }
  const data = await apiRequest(`/shops?${params.toString()}`);
  return data.shops;
}

export async function getFavoriteShops() {
  const data = await apiRequest("/shops/favorites");
  return data.shops;
}

export async function getRecentShops() {
  const data = await apiRequest("/shops/recent");
  return data.shops;
}

export async function toggleFavoriteShop(shopId) {
  const data = await apiRequest(`/shops/${shopId}/favorite`, { method: "POST" });
  return data.favorited;
}
