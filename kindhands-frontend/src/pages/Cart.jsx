// src/pages/Cart.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X, ShoppingCart, MessageSquarePlus } from "lucide-react";
import { getCart, updateCartItem, removeCartItem, clearCart } from "../services/cartService";
import { useCart } from "../context/CartContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function formatPrice(n) {
  return `₹${n.toFixed(0)}`;
}

function ItemNote({ itemId, note, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note);

  if (!editing && note) {
    return (
      <button onClick={() => { setDraft(note); setEditing(true); }} className="mt-1 text-left text-xs text-ink-muted italic hover:text-pine">
        Note: {note}
      </button>
    );
  }

  if (!editing) {
    return (
      <button onClick={() => { setDraft(""); setEditing(true); }} className="mt-1 flex items-center gap-1 text-xs font-medium text-pine hover:text-pine-deep">
        <MessageSquarePlus size={12} /> Add a note
      </button>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-2">
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="e.g. smaller tomatoes, ripe bananas"
        maxLength={200}
        className="flex-1 rounded-lg bg-surface px-2 py-1 text-xs text-ink outline outline-1 outline-line focus:outline-2 focus:outline-pine"
        onKeyDown={(e) => {
          if (e.key === "Enter") { onSave(itemId, draft); setEditing(false); }
          if (e.key === "Escape") setEditing(false);
        }}
      />
      <button className="text-xs font-semibold text-pine" onClick={() => { onSave(itemId, draft); setEditing(false); }}>
        Save
      </button>
    </div>
  );
}

export default function Cart({ role }) {
  const navigate = useNavigate();
  const { setCountFromCart } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role !== "elder") return;
    getCart()
      .then((c) => { setCart(c); setCountFromCart(c); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [role, setCountFromCart]);

  const handleQuantityChange = async (itemId, quantity) => {
    try {
      const updated = await updateCartItem(itemId, { quantity });
      setCart(updated);
      setCountFromCart(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNoteChange = async (itemId, note) => {
    try {
      const updated = await updateCartItem(itemId, { note });
      setCart(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      const updated = await removeCartItem(itemId);
      setCart(updated);
      setCountFromCart(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClear = async () => {
    try {
      const updated = await clearCart();
      setCart(updated);
      setCountFromCart(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  if (role !== "elder") {
    return <p className="max-w-2xl mx-auto mt-10 text-center text-ink-muted">Only elders have a shopping cart.</p>;
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-2 space-y-3">
        <div className="h-24 w-full animate-pulse rounded-2xl bg-line" />
        <div className="h-24 w-full animate-pulse rounded-2xl bg-line" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-2 pb-16">
      <h1 className="font-display text-2xl font-bold text-ink">Your cart</h1>
      {error && <p className="mt-2 text-sm text-clay">{error}</p>}

      {!cart || cart.items.length === 0 ? (
        <div className="mt-10 text-center">
          <ShoppingCart className="mx-auto text-ink-muted" size={28} />
          <p className="mt-2 text-ink-muted">Your cart is empty.</p>
          <Button as={Link} to="/products" size="lg" className="mt-4">
            Browse the shop
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-3">
            {cart.items.map((item) => (
              <Card key={item.id} className="p-4">
                {item.isCustom ? (
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-ink truncate">{item.name}</div>
                        <div className="text-ink-muted text-sm">{item.unit || "amount not specified"} · priced at pickup</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button aria-label="Decrease quantity" onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper text-ink hover:bg-line transition-colors">
                          <Minus size={16} />
                        </button>
                        <span className="w-7 text-center text-base font-semibold text-ink">{item.quantity}</span>
                        <button aria-label="Increase quantity" onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper text-ink hover:bg-line transition-colors">
                          <Plus size={16} />
                        </button>
                      </div>
                      <button aria-label="Remove item" className="shrink-0 text-ink-muted hover:text-clay transition-colors" onClick={() => handleRemove(item.id)}>
                        <X size={18} />
                      </button>
                    </div>
                    <ItemNote itemId={item.id} note={item.note} onSave={handleNoteChange} />
                  </div>
                ) : item.unavailable || !item.product ? (
                  <div>
                    <div className="font-semibold text-ink-muted line-through">Item no longer available</div>
                    <button className="mt-2 text-sm font-semibold text-clay" onClick={() => handleRemove(item.id)}>Remove</button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-ink truncate">{item.product.name}</div>
                        <div className="text-ink-muted text-sm">{item.product.unit} · ≈{formatPrice(item.product.price)} each</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button aria-label="Decrease quantity" onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper text-ink hover:bg-line transition-colors">
                          <Minus size={16} />
                        </button>
                        <span className="w-7 text-center text-base font-semibold text-ink">{item.quantity}</span>
                        <button aria-label="Increase quantity" onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper text-ink hover:bg-line transition-colors">
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="w-20 shrink-0 text-right font-semibold text-ink">≈{formatPrice(item.subtotal)}</div>
                      <button aria-label="Remove item" className="shrink-0 text-ink-muted hover:text-clay transition-colors" onClick={() => handleRemove(item.id)}>
                        <X size={18} />
                      </button>
                    </div>
                    <ItemNote itemId={item.id} note={item.note} onSave={handleNoteChange} />
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
            <button onClick={handleClear} className="text-sm font-semibold text-ink-muted hover:text-clay transition-colors">Clear cart</button>
            <div className="text-right">
              <div className="text-xl font-bold text-ink">{cart.hasCustomItems ? "Estimated total: " : "Total: "}≈{formatPrice(cart.total)}</div>
              {cart.hasCustomItems && <div className="text-xs text-ink-muted">Custom items priced when the volunteer buys them</div>}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button onClick={() => navigate("/checkout")} size="lg" className="w-full max-w-sm">
              Proceed to checkout
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
