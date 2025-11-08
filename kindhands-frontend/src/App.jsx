// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateRequest from "./pages/CreateRequest";
import RequestsList from "./pages/RequestsList";
import Profile from "./pages/Profile";
import NavBar from "./components/NavBar";

import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase.js";

function App() {
  const [user, setUser] = useState(null); // firebase user
  const [role, setRole] = useState(null); // elder | volunteer
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        // fetch role from users collection
        try {
          const docSnap = await getDoc(doc(db, "users", u.uid));
          setRole(docSnap.exists() ? docSnap.data().role : null);
        } catch (err) {
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });
    return () => unsub();
  }, []);

  return (
    <div>
      <NavBar user={user} role={role} />
      <main style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={user ? <Dashboard user={user} role={role} /> : <Navigate to="/login" />} />
          <Route path="/create-request" element={user ? <CreateRequest user={user} role={role} /> : <Navigate to="/login" />} />
          <Route path="/requests" element={user ? <RequestsList user={user} role={role} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile user={user} role={role} /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
