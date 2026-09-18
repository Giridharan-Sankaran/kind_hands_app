// src/services/emergencyContactService.js
import { apiRequest } from "./api";

export async function listContacts() {
  const data = await apiRequest("/emergency-contacts");
  return data.contacts;
}

export async function createContact(contact) {
  const data = await apiRequest("/emergency-contacts", { method: "POST", body: contact });
  return data.contact;
}

export async function updateContact(id, contact) {
  const data = await apiRequest(`/emergency-contacts/${id}`, { method: "PUT", body: contact });
  return data.contact;
}

export async function deleteContact(id) {
  await apiRequest(`/emergency-contacts/${id}`, { method: "DELETE" });
}
