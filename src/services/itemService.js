// src/services/itemService.js
import { db } from "../firebase.js";
import { collection, getDocs, query, where } from "firebase/firestore";

/**
 * getItemsByCategoryAndSearch
 * category: string
 * searchText: partial string (case-insensitive)
 * returns list of items (strings or objects)
 */
export async function getItemsByCategoryAndSearch(category, searchText = "") {
  try {
    // simple implementation: read documents where category == category
    // We expect documents shaped like: { category: "Medicine", items: ["Dolo-650", "Paracetamol"] }
    const q = query(collection(db, "items"), where("category", "==", category));
    const snap = await getDocs(q);
    let results = [];
    snap.forEach(d => {
      const data = d.data();
      if (Array.isArray(data.items)) {
        results = results.concat(data.items);
      }
    });

    if (searchText) {
      const lower = searchText.toLowerCase();
      results = results.filter(item => item.toLowerCase().includes(lower));
    }

    // unique & limit (optional)
    const unique = Array.from(new Set(results)).slice(0, 50);
    return { success: true, items: unique };
  } catch (error) {
    console.error("getItemsByCategoryAndSearch error:", error.message);
    return { success: false, error: error.message };
  }
}
