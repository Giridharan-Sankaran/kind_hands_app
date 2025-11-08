// src/services/requestService.js
import { db } from "../firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDoc
} from "firebase/firestore";

/**
 * createRequest
 * elderId: uid string of elder (should match auth.uid at frontend)
 * category: string e.g. "medicine"
 * items: array of { name: "Dolo-650", quantity: "2 strips" } OR simple strings
 * location: string
 * dateTime: ISO string or timestamp
 */
export async function createRequest(elderId, category, items, location, dateTime) {
  try {
    const ref = await addDoc(collection(db, "requests"), {
      elderId,
      category,
      items,
      location,
      dateTime,
      status: "open",       // open -> accepted -> completed -> cancelled
      volunteerId: null,
      createdAt: serverTimestamp()
    });
    return { success: true, id: ref.id };
  } catch (error) {
    console.error("createRequest error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * getRequests
 * filters may include: { status, category, elderId, volunteerId, limit }
 * returns array of requests
 */
export async function getRequests(filters = {}) {
  try {
    let q = collection(db, "requests");

    const conditions = [];
    if (filters.status) conditions.push(where("status", "==", filters.status));
    if (filters.category) conditions.push(where("category", "==", filters.category));
    if (filters.elderId) conditions.push(where("elderId", "==", filters.elderId));
    if (filters.volunteerId) conditions.push(where("volunteerId", "==", filters.volunteerId));

    if (conditions.length > 0) q = query(q, ...conditions);

    const snap = await getDocs(q);
    const results = [];
    snap.forEach(d => results.push({ id: d.id, ...d.data() }));
    return { success: true, requests: results };
  } catch (error) {
    console.error("getRequests error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * acceptRequest
 * volunteerId accepts request -> set volunteerId and status to "accepted"
 * Does NOT check authorization here; frontend should ensure volunteer.
 */
export async function acceptRequest(volunteerId, requestId) {
  try {
    const ref = doc(db, "requests", requestId);
    await updateDoc(ref, {
      volunteerId,
      status: "accepted",
      acceptedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("acceptRequest error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * completeRequest
 * mark as completed by volunteer (or elder after verification)
 */
export async function completeRequest(requestId) {
  try {
    const ref = doc(db, "requests", requestId);
    await updateDoc(ref, {
      status: "completed",
      completedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("completeRequest error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * updateRequest - generic partial update
 * updateData is an object with fields to update
 */
export async function updateRequest(requestId, updateData) {
  try {
    const ref = doc(db, "requests", requestId);
    await updateDoc(ref, updateData);
    return { success: true };
  } catch (error) {
    console.error("updateRequest error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * deleteRequest
 */
export async function deleteRequest(requestId) {
  try {
    await deleteDoc(doc(db, "requests", requestId));
    return { success: true };
  } catch (error) {
    console.error("deleteRequest error:", error.message);
    return { success: false, error: error.message };
  }
}
