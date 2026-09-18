// src/services/orderService.js
import { apiRequest } from "./api";

export async function placeOrder(payload) {
  return apiRequest("/orders", { method: "POST", body: payload }); // { order, droppedItems }
}

export async function listMyOrders(status) {
  const params = status ? `?status=${status}` : "";
  const data = await apiRequest(`/orders${params}`);
  return data.orders;
}

export async function listAvailableOrders(city) {
  const params = city ? `?city=${encodeURIComponent(city)}` : "";
  return apiRequest(`/orders/available${params}`); // { orders, locationEnabled }
}

export async function listMyAssignedOrders() {
  const data = await apiRequest("/orders/mine");
  return data.orders;
}

export async function getOrder(id) {
  const data = await apiRequest(`/orders/${id}`);
  return data.order;
}

export async function acceptOrder(id) {
  const data = await apiRequest(`/orders/${id}/accept`, { method: "POST" });
  return data.order;
}

export async function updateOrderStatus(id, status) {
  const data = await apiRequest(`/orders/${id}/status`, { method: "PATCH", body: { status } });
  return data.order;
}

export async function updateLiveLocation(id, lat, lng) {
  const data = await apiRequest(`/orders/${id}/location`, { method: "PATCH", body: { lat, lng } });
  return data.volunteerLiveLocation;
}

export async function cancelOrder(id, reason) {
  const data = await apiRequest(`/orders/${id}/cancel`, { method: "POST", body: { reason } });
  return data.order;
}

export async function listMessages(id) {
  const data = await apiRequest(`/orders/${id}/messages`);
  return data.messages;
}

export async function sendMessage(id, body) {
  const data = await apiRequest(`/orders/${id}/messages`, { method: "POST", body: { body } });
  return data.message;
}
