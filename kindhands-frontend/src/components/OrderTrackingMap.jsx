// src/components/OrderTrackingMap.jsx
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet's default marker icons resolve to bundled image paths that
// break under Vite — point them at the CDN copies instead.
const homeIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const volunteerIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:9999px;background:#E2A63B;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function OrderTrackingMap({ homeLocation, volunteerLocation, height = 260 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const homeMarkerRef = useRef(null);
  const volunteerMarkerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const center = homeLocation || volunteerLocation || { lat: 20.5937, lng: 78.9629 };
    map.setView([center.lat, center.lng], homeLocation ? 15 : 5);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (homeLocation) {
      if (!homeMarkerRef.current) {
        homeMarkerRef.current = L.marker([homeLocation.lat, homeLocation.lng], { icon: homeIcon })
          .addTo(map)
          .bindPopup("Delivery address");
      } else {
        homeMarkerRef.current.setLatLng([homeLocation.lat, homeLocation.lng]);
      }
    }

    if (volunteerLocation) {
      if (!volunteerMarkerRef.current) {
        volunteerMarkerRef.current = L.marker([volunteerLocation.lat, volunteerLocation.lng], { icon: volunteerIcon })
          .addTo(map)
          .bindPopup("Volunteer");
      } else {
        volunteerMarkerRef.current.setLatLng([volunteerLocation.lat, volunteerLocation.lng]);
      }
    }

    if (homeLocation && volunteerLocation) {
      map.fitBounds(
        L.latLngBounds([
          [homeLocation.lat, homeLocation.lng],
          [volunteerLocation.lat, volunteerLocation.lng],
        ]),
        { padding: [40, 40] }
      );
    }
  }, [homeLocation, volunteerLocation]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full rounded-xl overflow-hidden outline outline-1 outline-line"
    />
  );
}
