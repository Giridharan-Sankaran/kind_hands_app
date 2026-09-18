// src/services/cartService.js
import { apiRequest } from "./api";

export async function getCart() {
  const data = await apiRequest("/cart");
  return data.cart;
}

export async function addToCart(productId, quantity = 1, note) {
  const data = await apiRequest("/cart/items", { method: "POST", body: { productId, quantity, note } });
  return data.cart;
}

export async function updateCartItem(productId, fields) {
  // fields: { quantity?, note? }
  const data = await apiRequest(`/cart/items/${productId}`, { method: "PATCH", body: fields });
  return data.cart;
}

export async function removeCartItem(productId) {
  const data = await apiRequest(`/cart/items/${productId}`, { method: "DELETE" });
  return data.cart;
}

export async function clearCart() {
  const data = await apiRequest("/cart", { method: "DELETE" });
  return data.cart;
}
