// src/pages/RequestsList.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase.js";

export default function RequestsList({ user, role }) {
  const [requests, setRequests] = useState([]);
  const [msg, setMsg] = useState("");

  async function fetchRequests() {
    try {
      // For volunteers: show open requests
      // For elders: show their requests
      let q;
      if (role === "volunteer") {
        q = query(collection(db, "requests"), where("status", "==", "open"));
      } else if (role === "elder") {
        q = query(collection(db, "requests"), where("elderId", "==", user.uid));
      } else {
        q = query(collection(db, "requests"));
      }
      const snap = await getDocs(q);
      const arr = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setRequests(arr);
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      const ref = doc(db, "requests", requestId);
      await updateDoc(ref, {
        volunteerId: user.uid,
        status: "accepted"
      });
      setMsg("Accepted");
      await fetchRequests();
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  };

  const handleComplete = async (requestId) => {
    try {
      const ref = doc(db, "requests", requestId);
      await updateDoc(ref, { status: "completed" });
      setMsg("Marked completed");
      await fetchRequests();
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <h2>Requests</h2>
      <p>{msg}</p>
      {requests.length === 0 && <p>No requests found</p>}
      <div style={{ display: "grid", gap: 12 }}>
        {requests.map(r => (
          <div key={r.id} style={{ border: "1px solid #ddd", padding: 12 }}>
            <strong>{r.category}</strong> — {r.status}
            <div>Items: {Array.isArray(r.items) ? r.items.map(i => i.name || i).join(", ") : String(r.items)}</div>
            <div>Location: {r.location}</div>
            <div>Date: {r.dateTime}</div>
            <div>Created: {r.createdAt?.toDate ? r.createdAt.toDate().toString() : r.createdAt}</div>

            {role === "volunteer" && r.status === "open" && (
              <button onClick={() => handleAccept(r.id)}>Accept</button>
            )}

            {role === "volunteer" && r.status === "accepted" && r.volunteerId === user.uid && (
              <button onClick={() => handleComplete(r.id)}>Mark Completed</button>
            )}

            {role === "elder" && r.status === "accepted" && (
              <div>Accepted by: {r.volunteerId}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
