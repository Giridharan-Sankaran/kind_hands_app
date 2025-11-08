// seedItems.js
import { db } from "./src/firebase.js";
import { collection, setDoc, doc } from "firebase/firestore";

const itemsData = [
  { category: "Grocery", items: ["Rice","Wheat Flour","Cooking Oil","Sugar","Salt","Milk","Bread","Eggs","Tea"] },
  { category: "Fruits", items: ["Apple","Banana","Orange","Grapes","Mango","Pineapple"] },
  { category: "Vegetables", items: ["Potato","Tomato","Onion","Carrot","Spinach","Cabbage"] },
  { category: "Medicine", items: ["Dolo-650","Paracetamol","Ibuprofen","Cough Syrup","Vitamin C","Cetirizine"] },
  { category: "Household", items: ["Detergent","Dish Soap","Toothpaste","Toothbrush","Shampoo","Soap"] }
];

async function seed() {
  try {
    for (const item of itemsData) {
      const ref = doc(collection(db, "items"), item.category); // document id = category
      await setDoc(ref, item);
      console.log("Seeded:", item.category);
    }
    console.log("Seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
