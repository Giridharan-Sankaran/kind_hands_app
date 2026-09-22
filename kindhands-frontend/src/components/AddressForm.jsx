// src/components/AddressForm.jsx
import React, { useEffect, useRef, useState } from "react";
import { Navigation, Check, Search } from "lucide-react";
import { inputClass, labelClass } from "../styles/formClasses";
import { getCurrentPosition } from "../services/geolocation";
import { searchAddress, reverseGeocode } from "../services/geocodingService";
import Button from "./ui/Button";

export default function AddressForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationSet, setLocationSet] = useState(Boolean(initial.location?.lat));

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const boxRef = useRef(null);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(() => {
      searchAddress(query)
        .then(setSuggestions)
        .catch(() => setSuggestions([]))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const applySuggestion = (s) => {
    setForm((f) => ({
      ...f,
      addressLine1: s.addressLine1,
      city: s.city,
      state: s.state,
      pincode: s.pincode,
      location: { lat: s.lat, lng: s.lng },
    }));
    setLocationSet(true);
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleUseLocation = async () => {
    setLocating(true);
    setError("");
    try {
      const { lat, lng } = await getCurrentPosition();
      const result = await reverseGeocode(lat, lng);
      setForm((f) => ({
        ...f,
        addressLine1: result.addressLine1,
        city: result.city,
        state: result.state,
        pincode: result.pincode,
        location: { lat, lng },
      }));
      setLocationSet(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLocating(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl bg-paper p-4 outline outline-1 outline-line">
      <div ref={boxRef} className="relative">
        <label className={labelClass}>Search for your address</label>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            className={`${inputClass} pl-9`}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Start typing an address..."
          />
        </div>
        {showSuggestions && (searching || suggestions.length > 0) && (
          <div className="absolute z-10 mt-1 w-full rounded-xl bg-surface shadow-lg outline outline-1 outline-line overflow-hidden">
            {searching && <div className="px-3.5 py-2.5 text-sm text-ink-muted">Searching...</div>}
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applySuggestion(s)}
                className="block w-full text-left px-3.5 py-2.5 text-sm text-ink hover:bg-paper border-b border-line last:border-0"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
        <p className="mt-1 text-xs text-ink-muted">Powered by OpenStreetMap — pick a result to fill the fields below.</p>
      </div>

      <div>
        <label className={labelClass}>Label (e.g. Home, Son's place)</label>
        <input className={inputClass} value={form.label} onChange={set("label")} maxLength={40} />
      </div>
      <div>
        <label className={labelClass}>Address</label>
        <input className={inputClass} required value={form.addressLine1} onChange={set("addressLine1")} placeholder="House no., street" />
      </div>
      <div>
        <label className={labelClass}>Landmark (optional)</label>
        <input className={inputClass} value={form.landmark} onChange={set("landmark")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>City</label>
          <input className={inputClass} required value={form.city} onChange={set("city")} />
        </div>
        <div>
          <label className={labelClass}>State</label>
          <input className={inputClass} required value={form.state} onChange={set("state")} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Pincode</label>
        <input className={inputClass} required value={form.pincode} onChange={set("pincode")} maxLength={6} placeholder="6 digits" />
      </div>

      <div>
        <Button type="button" variant="secondary" onClick={handleUseLocation} disabled={locating}>
          {locationSet ? <Check size={16} /> : <Navigation size={16} />}
          {locating ? "Getting your location..." : locationSet ? "Location added" : "Use my current location"}
        </Button>
        <p className="mt-1 text-xs text-ink-muted">
          Fills in the address automatically and helps volunteers near you see this order first.
        </p>
      </div>

      {error && <p className="text-sm text-clay">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save address"}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
