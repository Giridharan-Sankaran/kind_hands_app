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

// A free-text item not in the catalog — e.g. "Tomatoes", amount "2 kg".
export async function addCustomItem({ customName, customUnit, quantity = 1, note }) {
  const data = await apiRequest("/cart/items", { method: "POST", body: { customName, customUnit, quantity, note } });
  return data.cart;
}

// itemId is the cart line's own id (item.id from getCart), not a product id
// — custom items have no product to key off of.
export async function updateCartItem(itemId, fields) {
  const data = await apiRequest(`/cart/items/${itemId}`, { method: "PATCH", body: fields });
  return data.cart;
}

export async function removeCartItem(itemId) {
  const data = await apiRequest(`/cart/items/${itemId}`, { method: "DELETE" });
  return data.cart;
}

export async function clearCart() {
  const data = await apiRequest("/cart", { method: "DELETE" });
  return data.cart;
}
