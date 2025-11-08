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
    <div style={{ maxWidth: 700, margin: "24px auto" }}>
      <h2>Create Request</h2>
      <form onSubmit={handleSubmit}>
        <label>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option>Medicine</option>
          <option>Grocery</option>
          <option>Household</option>
          <option>Other</option>
        </select>

        <label>Items (comma separated)</label>
        <input value={itemsText} onChange={e => setItemsText(e.target.value)} placeholder="e.g. Dolo-650, Paracetamol" />

        <label>Location</label>
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Address or postal code" />

        <label>Date & time</label>
        <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} />

        <button type="submit">Create Request</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
