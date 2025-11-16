// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateRequest from "./pages/CreateRequest";
import RequestsList from "./pages/RequestsList";
import Profile from "./pages/Profile";
import ProtectedRoute from "./routes/ProtectedRoute";

import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase.js";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);

        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          setRole(snap.exists() ? snap.data().role : null);
        } catch (err) {
          console.error("Error fetching role", err);
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
      <main>
        <Routes>
          {/* Redirect root */}
          <Route
            path="/"
            element={
              user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            }
          />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute user={user} />}>
            <Route
              path="/dashboard"
              element={<Dashboard user={user} role={role} />}
            />
            <Route
              path="/create-request"
              element={<CreateRequest user={user} role={role} />}
            />
            <Route
              path="/requests"
              element={<RequestsList user={user} role={role} />}
            />
            <Route
              path="/profile"
              element={<Profile user={user} role={role} />}
            />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
