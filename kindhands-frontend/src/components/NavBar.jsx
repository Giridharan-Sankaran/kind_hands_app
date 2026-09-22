// src/components/NavBar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutGrid, ShoppingBag, ShoppingCart, ClipboardList, UserRound, LogOut, Menu, X } from "lucide-react";
import { logoutUserFrontend } from "../services/authFrontendService";
import ToteMark from "./illustrations/ToteMark";
import { useCart } from "../context/CartContext";

function NavItem({ to, icon: Icon, label, badge, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
          isActive ? "bg-pine text-white" : "text-white/85 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      <Icon size={18} strokeWidth={2.25} />
      <span>{label}</span>
      {badge > 0 && (
        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-marigold px-1.5 text-xs font-bold text-ink">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default function NavBar({ user, role }) {
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUserFrontend();
    window.location.href = "/login";
  };

  const closeMobile = () => setMobileOpen(false);

  const items = [
    { to: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
    ...(role === "elder"
      ? [
          { to: "/products", icon: ShoppingBag, label: "Shop" },
          { to: "/cart", icon: ShoppingCart, label: "Cart", badge: itemCount },
        ]
      : []),
    { to: "/requests", icon: ClipboardList, label: role === "volunteer" ? "Orders" : "Your orders" },
    { to: "/profile", icon: UserRound, label: "Profile" },
  ];

  return (
    <nav className="bg-pine-deep px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2">
          <ToteMark size={30} />
          <span className="font-display text-lg font-bold text-white">Kind Hands</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5">
          {items.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user && (
            <div className="text-right leading-tight">
              <div className="text-sm font-semibold text-white">{user.name || user.email}</div>
              <div className="text-xs capitalize text-white/60">{role}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden mt-3 space-y-1 border-t border-white/10 pt-3">
          {items.map((item) => (
            <NavItem key={item.to} {...item} onClick={closeMobile} />
          ))}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            <LogOut size={18} strokeWidth={2.25} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
