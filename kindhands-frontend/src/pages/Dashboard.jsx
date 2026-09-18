// src/pages/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ShoppingCart, ClipboardList, MapPin, Settings, ChevronRight } from "lucide-react";
import Card from "../components/ui/Card";
import { useCart } from "../context/CartContext";

function ActionCard({ to, icon: Icon, title, description, meta }) {
  return (
    <Card as={Link} to={to} className="flex items-center gap-4 p-4 hover:border-pine/40 transition-colors">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pine-light text-pine">
        <Icon size={20} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-semibold text-ink">{title}</span>
        <span className="block text-sm text-ink-muted mt-0.5">{description}</span>
      </span>
      {meta}
      <ChevronRight size={18} className="text-ink-muted shrink-0" />
    </Card>
  );
}

export default function Dashboard({ user, role }) {
  const { itemCount } = useCart();

  return (
    <div className="max-w-2xl mx-auto mt-2 pb-16">
      <h1 className="font-display text-2xl font-bold text-ink">
        Welcome, {user?.name || user?.email}
      </h1>
      <p className="mt-1 text-ink-muted capitalize">{role} account</p>

      {role === "elder" && (
        <div className="mt-6 space-y-3">
          <ActionCard to="/products" icon={ShoppingBag} title="Browse the shop" description="See groceries and daily items you can order" />
          <ActionCard
            to="/cart"
            icon={ShoppingCart}
            title="View your cart"
            description="Check what you've added before checking out"
            meta={
              itemCount > 0 && (
                <span className="rounded-full bg-marigold px-2.5 py-1 text-xs font-bold text-ink">{itemCount}</span>
              )
            }
          />
          <ActionCard to="/requests" icon={ClipboardList} title="Track your orders" description="See the status of orders you've placed" />
          <ActionCard to="/profile" icon={MapPin} title="Addresses & emergency contacts" description="Update where volunteers deliver, and who to contact" />
        </div>
      )}

      {role === "volunteer" && (
        <div className="mt-6 space-y-3">
          <ActionCard to="/requests" icon={ClipboardList} title="Browse open requests" description="See orders nearby that you can accept" />
          <ActionCard to="/profile" icon={Settings} title="Service settings" description="Set your availability and current location" />
        </div>
      )}
    </div>
  );
}
