// src/pages/RequestsList.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ClipboardList, Store, MapPin, Search, CheckCircle2, ChevronRight } from "lucide-react";
import { listMyOrders, listAvailableOrders, listMyAssignedOrders, acceptOrder } from "../services/orderService";
import { STATUS_LABELS, STATUS_TONES } from "../constants/orderStatus";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

function StatusBadge({ status }) {
  return <Badge tone={STATUS_TONES[status] || "neutral"}>{STATUS_LABELS[status] || status}</Badge>;
}

function formatPrice(n) {
  return `₹${Number(n).toFixed(0)}`;
}

function ElderOrders() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState(location.state?.justPlacedOrderId ? location.state : null);

  useEffect(() => {
    listMyOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-24 animate-pulse rounded-2xl bg-line" />;
  }

  return (
    <div className="space-y-4">
      {banner && (
        <Card className="p-4 bg-moss-light border-none flex gap-3">
          <CheckCircle2 className="text-moss shrink-0 mt-0.5" size={20} />
          <div>
            <div className="text-moss font-semibold">Order placed! We're searching for a volunteer nearby.</div>
            {banner.droppedItems?.length > 0 && (
              <div className="mt-1 text-sm text-ink-muted">
                Note: {banner.droppedItems.join(", ")} {banner.droppedItems.length === 1 ? "was" : "were"} removed — no longer available.
              </div>
            )}
            <button className="mt-2 text-sm font-semibold text-moss underline" onClick={() => setBanner(null)}>Dismiss</button>
          </div>
        </Card>
      )}
      {error && <p className="text-sm text-clay">{error}</p>}

      {orders.length === 0 ? (
        <div className="text-center py-10">
          <ClipboardList className="mx-auto text-ink-muted" size={28} />
          <p className="mt-2 text-ink-muted">You haven't placed any orders yet.</p>
        </div>
      ) : (
        orders.map((order) => (
          <Card as={Link} to={`/orders/${order.id}`} key={order.id} className="p-4 flex items-center gap-3 hover:border-pine/40 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <StatusBadge status={order.status} />
                <span className="text-sm text-ink-muted">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-ink">
                <Store size={14} className="text-ink-muted shrink-0" />
                <span className="truncate">{order.items.length} item{order.items.length !== 1 ? "s" : ""} from {order.shop.name}</span>
              </div>
              <div className="text-sm text-ink-muted">Total: {formatPrice(order.itemsTotal)}</div>
              {order.volunteer && <div className="text-sm text-pine font-medium mt-1">Volunteer: {order.volunteer.name}</div>}
            </div>
            <ChevronRight size={18} className="text-ink-muted shrink-0" />
          </Card>
        ))
      )}
    </div>
  );
}

function VolunteerOrders() {
  const [tab, setTab] = useState("available");
  const [available, setAvailable] = useState([]);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(null);

  const loadAvailable = async (city) => {
    const data = await listAvailableOrders(city);
    setAvailable(data.orders);
    setLocationEnabled(data.locationEnabled);
  };

  const loadAssigned = async () => {
    setAssigned(await listMyAssignedOrders());
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    const task = tab === "available" ? loadAvailable(cityFilter) : loadAssigned();
    task.catch((err) => setError(err.message)).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleCitySearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loadAvailable(cityFilter);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    setAccepting(id);
    setError("");
    try {
      await acceptOrder(id);
      await loadAvailable(cityFilter);
      setTab("mine");
    } catch (err) {
      setError(err.message);
      await loadAvailable(cityFilter);
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("available")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tab === "available" ? "bg-pine text-white" : "bg-surface text-ink-muted outline outline-1 outline-line"}`}
        >
          Available near you
        </button>
        <button
          onClick={() => setTab("mine")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tab === "mine" ? "bg-pine text-white" : "bg-surface text-ink-muted outline outline-1 outline-line"}`}
        >
          My orders
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-clay">{error}</p>}

      {tab === "available" && (
        <form onSubmit={handleCitySearch} className="mb-3 flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Or type a city to search manually"
              className="w-full rounded-xl bg-surface pl-9 pr-3 py-2.5 text-sm text-ink outline outline-1 outline-line focus:outline-2 focus:outline-pine"
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      )}

      {loading ? (
        <div className="h-24 animate-pulse rounded-2xl bg-line" />
      ) : tab === "available" ? (
        <div className="space-y-3">
          {!locationEnabled && !cityFilter && (
            <Card className="p-3 bg-marigold-light border-none">
              <p className="text-sm text-marigold-deep">Set your location in your profile, or search a city above, to see nearby orders.</p>
            </Card>
          )}
          {available.length === 0 ? (
            <div className="text-center py-10">
              <ClipboardList className="mx-auto text-ink-muted" size={28} />
              <p className="mt-2 text-ink-muted">No open orders right now. Check back soon.</p>
            </div>
          ) : (
            available.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">{order.shop.name}</span>
                  {order.distanceKm != null && <Badge tone="pine">{order.distanceKm} km away</Badge>}
                </div>
                <div className="text-sm text-ink-muted mt-1 flex items-center gap-1">
                  <MapPin size={14} />
                  {order.deliveryArea.city}, {order.deliveryArea.state}
                </div>
                <div className="text-sm text-ink mt-2">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {formatPrice(order.itemsTotal)}
                </div>
                <Button onClick={() => handleAccept(order.id)} disabled={accepting === order.id} className="mt-3">
                  {accepting === order.id ? "Accepting..." : "Accept order"}
                </Button>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {assigned.length === 0 ? (
            <div className="text-center py-10">
              <ClipboardList className="mx-auto text-ink-muted" size={28} />
              <p className="mt-2 text-ink-muted">You haven't accepted any orders yet.</p>
            </div>
          ) : (
            assigned.map((order) => (
              <Card as={Link} to={`/orders/${order.id}`} key={order.id} className="p-4 flex items-center gap-3 hover:border-pine/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={order.status} />
                    <span className="text-sm text-ink-muted">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-ink">
                    <Store size={14} className="text-ink-muted shrink-0" />
                    <span className="truncate">{order.items.length} item{order.items.length !== 1 ? "s" : ""} from {order.shop.name}</span>
                  </div>
                  <div className="text-sm text-ink-muted flex items-center gap-1">
                    <MapPin size={14} /> {order.deliveryAddress.city}, {order.deliveryAddress.state}
                  </div>
                </div>
                <ChevronRight size={18} className="text-ink-muted shrink-0" />
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function RequestsList({ role }) {
  return (
    <div className="max-w-2xl mx-auto mt-2 pb-16">
      <h1 className="font-display text-2xl font-bold text-ink mb-4">{role === "volunteer" ? "Orders" : "Your orders"}</h1>
      {role === "volunteer" ? <VolunteerOrders /> : <ElderOrders />}
    </div>
  );
}
