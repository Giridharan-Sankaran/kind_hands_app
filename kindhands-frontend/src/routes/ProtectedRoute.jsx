import { Navigate, Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";

export default function ProtectedRoute({ user, role }) {
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      {/* Navbar visible ONLY for logged-in users */}
      <NavBar user={user} role={role} />

      {/* Protected children pages */}
      <main class="p-6">
        <Outlet />
      </main>
    </>
  );
}