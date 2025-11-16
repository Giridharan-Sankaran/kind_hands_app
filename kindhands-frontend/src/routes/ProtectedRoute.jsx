import { Navigate, Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";

export default function ProtectedRoute({ user, role, loading }) {
  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <NavBar user={user} role={role} />
      <main className="p-6">
        <Outlet />
      </main>
    </>
  );
}
