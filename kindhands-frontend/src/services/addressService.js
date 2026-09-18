// src/services/addressService.js
import { apiRequest } from "./api";

export async function listAddresses() {
  const data = await apiRequest("/addresses");
  return data.addresses;
}

export async function createAddress(address) {
  const data = await apiRequest("/addresses", { method: "POST", body: address });
  return data.address;
}

export async function updateAddress(id, address) {
  const data = await apiRequest(`/addresses/${id}`, { method: "PUT", body: address });
  return data.address;
}

export async function setDefaultAddress(id) {
  const data = await apiRequest(`/addresses/${id}/default`, { method: "PATCH" });
  return data.address;
}

export async function deleteAddress(id) {
  await apiRequest(`/addresses/${id}`, { method: "DELETE" });
}
