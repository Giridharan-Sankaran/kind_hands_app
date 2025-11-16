// src/pages/CreateRequest.jsx
import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { useNavigate } from "react-router-dom";

export default function CreateRequest({ user, role }) {
  const [category, setCategory] = useState("Medicine");
  const [itemsText, setItemsText] = useState(""); // comma separated items for simple UI
  const [location, setLocation] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  if (role !== "elder") {
    return <p>Only elders can create requests.</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const items = itemsText.split(",").map(s => ({ name: s.trim() })).filter(i => i.name);
    try {
      const ref = await addDoc(collection(db, "requests"), {
        elderId: user.uid,
        category,
        items,
        location,
        dateTime,
        status: "open",
        volunteerId: null,
        createdAt: serverTimestamp()
      });
      setMsg("Request created: " + ref.id);
      setTimeout(() => navigate("/requests"), 800);
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  };

  return (
    <div class="flex min-h-full flex-col justify-center px-6 py-12">
      <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Create Request</h2>
      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} class="space-y-6">
          <div>
            <label class="block text-sm/6 font-medium text-gray-900">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" placeholder="Select Category">
              <option>Medicine</option>
              <option>Grocery</option>
              <option>Household</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label>Items (comma separated)</label>
            <textarea value={itemsText} onChange={e => setItemsText(e.target.value)} placeholder="e.g. Dolo-650, Paracetamol" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
          </div>

          <div>
            <label>Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Address or postal code" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
          </div>

          <div>
            <label>Date & time</label>
            <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
          </div>

          <div>
            <button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Create Request</button>
          </div>
        </form>
      </div>
    </div>
  );
}
