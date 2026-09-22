// src/components/LocationPreviewMap.jsx
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pinIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// A small, static single-pin preview — "here's where we'll show you as
// being" — as opposed to OrderTrackingMap, which tracks two moving parties.
export default function LocationPreviewMap({ lat, lng, height = 160 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || lat == null) return;

    const map = L.map(containerRef.current, { zoomControl: false, dragging: false, scrollWheelZoom: false });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker([lat, lng], { icon: pinIcon }).addTo(map);
    map.setView([lat, lng], 14);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  if (lat == null) return null;

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full rounded-xl overflow-hidden outline outline-1 outline-line"
    />
  );
}
