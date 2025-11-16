import React from "react";
import { Link } from "react-router-dom";
import { logoutUserFrontend } from "../services/authFrontendService";

export default function NavBar({ user, role }) {
  const handleLogout = async () => {
    await logoutUserFrontend();
    window.location.href = "/login";
  };

  return (
    <nav className="w-full bg-gray-900 text-white border-b px-6 py-3 flex items-center justify-between">

      {/* LEFT MENU */}
      <div className="flex items-center space-x-10">
        <Link to="/dashboard" className="border-none rounded-md border-solid p-2 text-gray-100 hover:bg-gray-500 font-medium">
          Dashboard
        </Link>
        <Link to="/create-request" className="border-none rounded-md border-solid p-2 text-gray-100 hover:bg-gray-500 font-medium">
          Create Request
        </Link>
        <Link to="/requests" className="border-none rounded-md border-solid p-2 text-gray-100 hover:bg-gray-500 font-medium">
          Requests
        </Link>
        <Link to="/profile" className="border-none rounded-md border-solid p-2 text-gray-100 hover:bg-gray-500 font-medium">
          Profile
        </Link>
      </div>

      <div className="flex items-center space-x-4">

        {user && (
          <div className="flex flex-col text-right leading-tight">
            <span className="text-white font-semibold text-sm">
              {user.email}
            </span>
            <span className="text-gray-500 text-xs capitalize">{role}</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="px-4 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}