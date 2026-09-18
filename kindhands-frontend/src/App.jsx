import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RequestsList from "./pages/RequestsList";
import Profile from "./pages/Profile";
import ProductCatalog from "./pages/ProductCatalog";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderDetail from "./pages/OrderDetail";
import ProtectedRoute from "./routes/ProtectedRoute";
import { CartProvider } from "./context/CartContext";
import { getCurrentUserFrontend } from "./services/authFrontendService";
import { getToken } from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      const res = await getCurrentUserFrontend();
      if (res.success) {
        setUser(res.user);
        setRole(res.role);
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-paper text-lg font-semibold text-ink-muted">
        Loading...
      </div>
    );
  }

  return (
    <CartProvider role={role}>
      <div>
        <main>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

            <Route path="/login" element={<Login onLogin={(u, r) => { setUser(u); setRole(r); }} />} />
            <Route path="/register" element={<Register onLogin={(u, r) => { setUser(u); setRole(r); }} />} />

            <Route element={<ProtectedRoute user={user} role={role} loading={loading} />}>
              <Route path="/dashboard" element={<Dashboard user={user} role={role} />} />
              <Route path="/products" element={<ProductCatalog role={role} />} />
              <Route path="/cart" element={<Cart role={role} />} />
              <Route path="/checkout" element={<Checkout role={role} />} />
              <Route path="/requests" element={<RequestsList user={user} role={role} />} />
              <Route path="/orders/:id" element={<OrderDetail user={user} role={role} />} />
              <Route path="/profile" element={<Profile user={user} role={role} />} />
            </Route>

            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </CartProvider>
  );
}

export default App;
