// src/services/geocodingService.js
//
// Uses OpenStreetMap's public services instead of Google Maps, since
// those need a paid API key that isn't configured in this environment.
// Nominatim (geocoding) and Overpass (place search) are free but rate
// limited and request attribution — see the usage notes on each function.
// https://operations.osmfoundation.org/policies/nominatim/

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const OVERPASS_BASE = "https://overpass-api.de/api/interpreter";

function parseNominatimAddress(item) {
  const a = item.address || {};
  const line1 = [a.house_number, a.road].filter(Boolean).join(" ") || item.display_name.split(",")[0];
  return {
    label: item.display_name,
    addressLine1: line1,
    city: a.city || a.town || a.village || a.county || "",
    state: a.state || "",
    pincode: a.postcode || "",
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  };
}

// Forward geocoding: turns typed text into address suggestions, the way
// Google Places Autocomplete would. Call this debounced as the person types.
export async function searchAddress(query) {
  if (!query || query.trim().length < 3) return [];
  const params = new URLSearchParams({
    format: "jsonv2",
    q: query,
    addressdetails: "1",
    limit: "5",
  });
  const res = await fetch(`${NOMINATIM_BASE}/search?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Address search isn't available right now.");
  const data = await res.json();
  return data.map(parseNominatimAddress);
}

// Reverse geocoding: turns a GPS pin into a fillable address — this is
// what makes "use my current location" actually populate the form fields
// instead of just silently storing a lat/lng nobody can see.
export async function reverseGeocode(lat, lng) {
  const params = new URLSearchParams({ format: "jsonv2", lat, lon: lng, addressdetails: "1" });
  const res = await fetch(`${NOMINATIM_BASE}/reverse?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("We couldn't look up that location.");
  const data = await res.json();
  if (!data || data.error) throw new Error("We couldn't find an address for that location.");
  return parseNominatimAddress(data);
}

// Real nearby shops via Overpass (OpenStreetMap's map-data query API) —
// actual grocery/convenience stores near a coordinate, not a fixed demo
// list. Best-effort: sparser in areas with less OSM mapping coverage.
export async function findNearbyShops(lat, lng, radiusMeters = 3000) {
  const query = `[out:json][timeout:15];(
    node["shop"~"^(supermarket|convenience|grocery|greengrocer|general)$"](around:${radiusMeters},${lat},${lng});
  );out body 20;`;

  const res = await fetch(OVERPASS_BASE, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: query,
  });
  if (!res.ok) throw new Error("Nearby shop search isn't available right now.");
  const data = await res.json();

  return (data.elements || [])
    .filter((el) => el.tags?.name)
    .map((el) => ({
      id: `osm-${el.id}`,
      name: el.tags.name,
      type: (el.tags.shop || "shop").replace(/_/g, " "),
      address: [el.tags["addr:housenumber"], el.tags["addr:street"], el.tags["addr:city"]].filter(Boolean).join(", "),
      city: el.tags["addr:city"] || "",
      openingHours: el.tags.opening_hours || "Hours not listed",
      lat: el.lat,
      lng: el.lon,
      isRealPlace: true,
    }));
}
