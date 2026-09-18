// src/pages/OrderDetail.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Phone, Store, MapPin, UserRound } from "lucide-react";
import { getOrder, updateOrderStatus, updateLiveLocation, cancelOrder } from "../services/orderService";
import { STATUS_LABELS, STATUS_TONES, STATUS_FLOW } from "../constants/orderStatus";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import OrderTrackingMap from "../components/OrderTrackingMap";
import MessageThread from "../components/MessageThread";

const POLL_MS = 8000;
const LOCATION_SEND_THROTTLE_MS = 8000;
const TRACKING_STATUSES = ["heading_to_elder", "arrived"];

function formatPrice(n) {
  return `₹${Number(n).toFixed(0)}`;
}

export default function OrderDetail({ user, role }) {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [advancing, setAdvancing] = useState(false);
  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      getOrder(id)
        .then((o) => !cancelled && setOrder(o))
        .catch((err) => !cancelled && setError(err.message))
        .finally(() => !cancelled && setLoading(false));
    };
    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id]);

  const isMyOrderAsVolunteer = role === "volunteer" && order?.volunteer?.id === user.id;
  const isMyOrderAsElder = role === "elder" && order?.elder?.id === user.id;

  // Share live location via the browser's continuous GPS watch, only while
  // this volunteer's own delivery is actively out for delivery — not
  // before, not after, and not for anyone else's order.
  useEffect(() => {
    const shouldTrack = isMyOrderAsVolunteer && order && TRACKING_STATUSES.includes(order.status);

    if (!shouldTrack || !navigator.geolocation) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (watchIdRef.current !== null) return; // already watching

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastSentRef.current < LOCATION_SEND_THROTTLE_MS) return;
        lastSentRef.current = now;
        updateLiveLocation(id, pos.coords.latitude, pos.coords.longitude).catch(() => {
          // Non-fatal — the next watchPosition tick will retry.
        });
      },
      () => {
        // Permission denied or unavailable — tracking simply won't update;
        // the rest of the order flow still works without it.
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isMyOrderAsVolunteer, order, id]);

  const handleAdvance = async (nextStatus) => {
    setAdvancing(true);
    setError("");
    try {
      setOrder(await updateOrderStatus(id, nextStatus));
    } catch (err) {
      setError(err.message);
    } finally {
      setAdvancing(false);
    }
  };

  const handleCancel = async () => {
    try {
      setOrder(await cancelOrder(id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto mt-2 h-64 animate-pulse rounded-2xl bg-line" />;
  }

  if (!order) {
    return <p className="max-w-2xl mx-auto mt-10 text-center text-clay">{error || "We couldn't find that order."}</p>;
  }

  const flowStep = STATUS_FLOW.find((s) => s.from === order.status);
  const isTracking = TRACKING_STATUSES.includes(order.status);
  const otherParty = role === "elder" ? order.volunteer : order.elder;

  return (
    <div className="max-w-2xl mx-auto mt-2 pb-16">
      <Link to="/requests" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-ink">
        <ArrowLeft size={16} /> Back to orders
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Order details</h1>
        <Badge tone={STATUS_TONES[order.status] || "neutral"}>{STATUS_LABELS[order.status] || order.status}</Badge>
      </div>

      {error && <p className="mt-2 text-sm text-clay">{error}</p>}

      {isTracking && (
        <Card className="mt-4 p-3">
          <OrderTrackingMap
            homeLocation={order.deliveryAddress?.location?.lat != null ? order.deliveryAddress.location : null}
            volunteerLocation={order.volunteerLiveLocation?.lat != null ? order.volunteerLiveLocation : null}
          />
          {!order.volunteerLiveLocation?.lat && (
            <p className="mt-2 text-xs text-ink-muted text-center">Waiting for live location to update...</p>
          )}
        </Card>
      )}

      <Card className="mt-4 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-ink">
          <Store size={16} className="text-ink-muted" />
          <span className="font-medium">{order.shop.name}</span>
          {order.shop.address && <span className="text-ink-muted">· {order.shop.address}</span>}
        </div>
        {order.deliveryAddress && (isMyOrderAsElder || isMyOrderAsVolunteer) && (
          <div className="flex items-start gap-2 text-sm text-ink">
            <MapPin size={16} className="text-ink-muted mt-0.5 shrink-0" />
            <span>
              {order.deliveryAddress.addressLine1}
              {order.deliveryAddress.landmark ? `, near ${order.deliveryAddress.landmark}` : ""}, {order.deliveryAddress.city}, {order.deliveryAddress.state} — {order.deliveryAddress.pincode}
            </span>
          </div>
        )}
        {order.deliveryInstructions && (
          <p className="text-sm text-ink-muted italic">Delivery note: {order.deliveryInstructions}</p>
        )}
      </Card>

      {otherParty && (
        <Card className="mt-4 p-4 flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pine-light text-pine">
            <UserRound size={20} />
          </span>
          <div className="flex-1">
            <div className="font-semibold text-ink">{otherParty.name}</div>
            <div className="text-sm text-ink-muted capitalize">{role === "elder" ? "Volunteer" : "Elder"}</div>
          </div>
          {otherParty.phone && (
            <Button as="a" href={`tel:${otherParty.phone}`} variant="secondary">
              <Phone size={16} /> Call
            </Button>
          )}
        </Card>
      )}

      <Card className="mt-4 p-4">
        <h2 className="font-display text-lg font-bold text-ink mb-2">Items</h2>
        {order.items.map((item) => (
          <div key={item._id || item.name} className="py-1.5 border-b border-line last:border-0">
            <div className="flex justify-between text-sm text-ink">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatPrice(item.priceAtOrder * item.quantity)}</span>
            </div>
            {item.note && <div className="text-xs text-ink-muted italic mt-0.5">Note: {item.note}</div>}
          </div>
        ))}
        <div className="flex justify-between font-bold text-ink mt-3 pt-2 border-t border-line">
          <span>Total</span>
          <span>{formatPrice(order.itemsTotal)}</span>
        </div>
        {order.shoppingNotes && (
          <p className="mt-2 text-sm text-ink-muted italic">Shopping notes: {order.shoppingNotes}</p>
        )}
      </Card>

      {isMyOrderAsVolunteer && flowStep && (
        <Button onClick={() => handleAdvance(flowStep.next)} disabled={advancing} size="lg" className="w-full mt-4">
          {advancing ? "Updating..." : flowStep.label}
        </Button>
      )}

      {isMyOrderAsElder && order.status === "searching_volunteer" && (
        <button className="mt-4 text-sm font-semibold text-clay hover:text-clay/80" onClick={handleCancel}>
          Cancel order
        </button>
      )}

      {order.volunteer && (
        <div className="mt-6">
          <h2 className="font-display text-lg font-bold text-ink mb-2">Messages</h2>
          <MessageThread orderId={id} myRole={role} />
        </div>
      )}
    </div>
  );
}
