// src/pages/Checkout.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Star, ShoppingCart, Store, Globe } from "lucide-react";
import { getCart } from "../services/cartService";
import { listAddresses, createAddress } from "../services/addressService";
import { searchShops, getFavoriteShops, getRecentShops, toggleFavoriteShop } from "../services/shopService";
import { findNearbyShops } from "../services/geocodingService";
import { placeOrder } from "../services/orderService";
import { useCart } from "../context/CartContext";
import AddressForm from "../components/AddressForm";
import { inputClass, labelClass } from "../styles/formClasses";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const EMPTY_ADDRESS = { label: "Home", addressLine1: "", addressLine2: "", landmark: "", city: "", state: "", pincode: "" };

function formatPrice(n) {
  return `₹${n.toFixed(0)}`;
}

function ShopCard({ shop, selected, onSelect, isFavorite, onToggleFavorite }) {
  return (
    <Card className={`p-3 ${selected ? "outline outline-2 outline-pine bg-pine-light" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={() => onSelect(shop)} className="flex-1 text-left">
          <div className="font-semibold text-ink flex items-center gap-1.5">
            {shop.name}
            {shop.isRealPlace && <Globe size={12} className="text-ink-muted" aria-label="From OpenStreetMap" />}
          </div>
          <div className="text-sm text-ink-muted">{shop.type} · {shop.city}</div>
          <div className="text-xs text-ink-muted/80 mt-1">{shop.openingHours}</div>
          {shop.distanceKm != null && (
            <div className="text-xs font-semibold text-pine mt-1">{shop.distanceKm} km away</div>
          )}
        </button>
        {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(shop.id)}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            className={isFavorite ? "text-marigold" : "text-line"}
          >
            <Star size={20} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}
      </div>
    </Card>
  );
}

export default function Checkout({ role }) {
  const navigate = useNavigate();
  const { refreshCount } = useCart();

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addingAddress, setAddingAddress] = useState(false);

  const [favoriteShops, setFavoriteShops] = useState([]);
  const [recentShops, setRecentShops] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [nearbyRealShops, setNearbyRealShops] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShopId, setSelectedShopId] = useState("");
  const [useManualShop, setUseManualShop] = useState(false);
  const [manualShop, setManualShop] = useState({ name: "", address: "", phone: "" });

  const [shoppingNotes, setShoppingNotes] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const favoriteIds = new Set(favoriteShops.map((s) => s.id));
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  useEffect(() => {
    async function load() {
      try {
        const [cartRes, addressesRes, favRes, recentRes] = await Promise.all([
          getCart(),
          listAddresses(),
          getFavoriteShops(),
          getRecentShops(),
        ]);
        setCart(cartRes);
        setAddresses(addressesRes);
        const defaultAddr = addressesRes.find((a) => a.isDefault) || addressesRes[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        setFavoriteShops(favRes);
        setRecentShops(recentRes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const bias = selectedAddress?.location?.lat
        ? { lat: selectedAddress.location.lat, lng: selectedAddress.location.lng }
        : {};
      searchShops({ search: searchQuery, ...bias })
        .then(setSearchResults)
        .catch((err) => setError(err.message));
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedAddress]);

  // Real nearby shops from OpenStreetMap, based on the selected delivery
  // address's coordinates — not the fixed 8-shop demo list. Best-effort:
  // if this fails or the address has no coordinates yet, it just stays
  // empty rather than blocking checkout.
  useEffect(() => {
    const loc = selectedAddress?.location;
    if (!loc?.lat) {
      setNearbyRealShops([]);
      return;
    }
    findNearbyShops(loc.lat, loc.lng)
      .then(setNearbyRealShops)
      .catch(() => setNearbyRealShops([]));
  }, [selectedAddress]);

  const handleAddAddress = async (form) => {
    const created = await createAddress(form);
    const refreshed = await listAddresses();
    setAddresses(refreshed);
    setSelectedAddressId(created.id);
    setAddingAddress(false);
  };

  const handleToggleFavorite = async (shopId) => {
    await toggleFavoriteShop(shopId);
    setFavoriteShops(await getFavoriteShops());
  };

  // Selecting a real (OpenStreetMap) place auto-fills the manual-shop
  // fields instead of making the person retype an address they just saw.
  const handleSelectShop = (shop) => {
    if (shop.isRealPlace) {
      setManualShop({ name: shop.name, address: shop.address || shop.type, phone: "" });
      setUseManualShop(true);
      setSelectedShopId("");
    } else {
      setSelectedShopId(shop.id);
      setUseManualShop(false);
    }
  };

  const handlePlaceOrder = async () => {
    setError("");
    if (!selectedAddressId) {
      setError("Please choose a delivery address.");
      return;
    }
    if (!selectedShopId && !(useManualShop && manualShop.name.trim())) {
      setError("Please choose a shop, or enter one manually.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { addressId: selectedAddressId, shoppingNotes, deliveryInstructions };
      if (useManualShop) {
        payload.manualShop = manualShop;
      } else {
        payload.shopId = selectedShopId;
      }
      const { order, droppedItems } = await placeOrder(payload);
      await refreshCount(); // the cart was cleared server-side once the order was placed
      navigate("/requests", { state: { justPlacedOrderId: order.id, droppedItems } });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (role !== "elder") {
    return <p className="max-w-2xl mx-auto mt-10 text-center text-ink-muted">Only elders can check out.</p>;
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-2 space-y-3">
        <div className="h-24 w-full animate-pulse rounded-2xl bg-line" />
        <div className="h-24 w-full animate-pulse rounded-2xl bg-line" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-10 text-center">
        <ShoppingCart className="mx-auto text-ink-muted" size={28} />
        <p className="mt-2 text-ink-muted">Your cart is empty.</p>
        <Button as={Link} to="/products" size="lg" className="mt-4">Browse the shop</Button>
      </div>
    );
  }

  const shopSections = [
    { title: "Your favorites", shops: favoriteShops, favoritable: true },
    { title: "Recently used", shops: recentShops.filter((s) => !favoriteIds.has(s.id)), favoritable: true },
    { title: searchQuery ? "Search results" : "Saved shops nearby", shops: searchResults, favoritable: true },
    { title: "Real shops near you", shops: nearbyRealShops, favoritable: false },
  ].filter((s) => s.shops.length > 0);

  return (
    <div className="max-w-2xl mx-auto mt-2 pb-16 space-y-8">
      <h1 className="font-display text-2xl font-bold text-ink">Checkout</h1>
      {error && <p className="text-sm text-clay">{error}</p>}

      <div>
        <h2 className="font-display text-lg font-bold text-ink">Delivery address</h2>
        <div className="mt-3 space-y-2">
          {addresses.map((addr) => (
            <label key={addr.id} className={`flex items-start gap-3 rounded-xl p-3 cursor-pointer outline outline-1 ${selectedAddressId === addr.id ? "outline-pine bg-pine-light" : "outline-line bg-surface"}`}>
              <input
                type="radio"
                name="address"
                className="mt-1 h-4 w-4 accent-pine"
                checked={selectedAddressId === addr.id}
                onChange={() => setSelectedAddressId(addr.id)}
              />
              <div>
                <div className="font-medium text-ink">{addr.label}</div>
                <div className="text-sm text-ink-muted">{addr.addressLine1}, {addr.city}, {addr.state} — {addr.pincode}</div>
              </div>
            </label>
          ))}

          {addingAddress ? (
            <AddressForm initial={EMPTY_ADDRESS} onCancel={() => setAddingAddress(false)} onSave={handleAddAddress} />
          ) : (
            <Button variant="secondary" onClick={() => setAddingAddress(true)}>+ Add a new address</Button>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-bold text-ink">Where should the volunteer shop?</h2>

        <input
          type="search"
          placeholder="Search shops by name"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setUseManualShop(false); }}
          className={`${inputClass} mt-3`}
        />

        <div className="mt-3 space-y-4">
          {shopSections.map((section) => (
            <div key={section.title}>
              <div className="text-sm font-semibold text-ink-muted mb-2">{section.title}</div>
              <div className="space-y-2">
                {section.shops.map((shop) => (
                  <ShopCard
                    key={shop.id}
                    shop={shop}
                    selected={
                      shop.isRealPlace
                        ? useManualShop && manualShop.name === shop.name
                        : !useManualShop && selectedShopId === shop.id
                    }
                    onSelect={handleSelectShop}
                    isFavorite={favoriteIds.has(shop.id)}
                    onToggleFavorite={section.favoritable ? handleToggleFavorite : undefined}
                  />
                ))}
              </div>
            </div>
          ))}

          {!selectedAddress?.location?.lat && (
            <p className="text-sm text-ink-muted">
              Add coordinates to your address (search it or use your current location) to see real shops near you.
            </p>
          )}
          {searchQuery && searchResults.length === 0 && (
            <p className="text-sm text-ink-muted">No saved shops found. You can enter one manually below.</p>
          )}
          {nearbyRealShops.length > 0 && (
            <p className="text-xs text-ink-muted">Real shop data © OpenStreetMap contributors.</p>
          )}
        </div>

        <div className="mt-4">
          <Button variant="secondary" onClick={() => { setUseManualShop(true); setSelectedShopId(""); }}>
            <Store size={16} />
            Enter a shop manually
          </Button>
          {useManualShop && (
            <div className="mt-3 space-y-3 rounded-xl bg-paper p-4 outline outline-1 outline-line">
              <div>
                <label className={labelClass}>Shop name</label>
                <input className={inputClass} value={manualShop.name} onChange={(e) => setManualShop({ ...manualShop, name: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Address (optional)</label>
                <input className={inputClass} value={manualShop.address} onChange={(e) => setManualShop({ ...manualShop, address: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Phone (optional)</label>
                <input className={inputClass} value={manualShop.phone} onChange={(e) => setManualShop({ ...manualShop, phone: e.target.value })} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-bold text-ink">Notes for the volunteer (optional)</h2>
        <div className="mt-3 space-y-3">
          <div>
            <label className={labelClass}>Shopping notes — e.g. brand preferences, substitutions</label>
            <textarea className={inputClass} rows={2} value={shoppingNotes} onChange={(e) => setShoppingNotes(e.target.value)} maxLength={500} />
          </div>
          <div>
            <label className={labelClass}>Delivery instructions — e.g. ring the bell twice</label>
            <textarea className={inputClass} rows={2} value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)} maxLength={500} />
          </div>
        </div>
      </div>

      <Card className="p-4">
        <h2 className="font-display text-lg font-bold text-ink mb-2">Order summary</h2>
        {cart.items.map((item) => item.product && (
          <div key={item.product.id} className="py-1">
            <div className="flex justify-between text-sm text-ink">
              <span>{item.product.name} × {item.quantity}</span>
              <span>{formatPrice(item.subtotal)}</span>
            </div>
            {item.note && <div className="text-xs text-ink-muted italic">Note: {item.note}</div>}
          </div>
        ))}
        <div className="flex justify-between font-bold text-ink mt-2 pt-2 border-t border-line">
          <span>Total</span>
          <span>{formatPrice(cart.total)}</span>
        </div>
      </Card>

      <Button onClick={handlePlaceOrder} disabled={submitting} size="lg" className="w-full">
        {submitting ? "Placing order..." : "Place order"}
      </Button>
    </div>
  );
}
