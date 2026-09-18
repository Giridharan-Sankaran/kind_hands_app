// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { MapPin, Phone, Star, Navigation, UserRound } from "lucide-react";
import { getMyProfile, updateMyProfile } from "../services/profileService";
import {
  listAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from "../services/addressService";
import {
  listContacts,
  createContact,
  updateContact,
  deleteContact,
} from "../services/emergencyContactService";
import AddressForm from "../components/AddressForm";
import { getCurrentPosition } from "../services/geolocation";
import { inputClass, labelClass, dangerBtn } from "../styles/formClasses";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

const EMPTY_ADDRESS = { label: "Home", addressLine1: "", addressLine2: "", landmark: "", city: "", state: "", pincode: "" };
const EMPTY_CONTACT = { name: "", relationship: "", phone: "" };

function ContactForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

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
      <div>
        <label className={labelClass}>Name</label>
        <input className={inputClass} required value={form.name} onChange={set("name")} />
      </div>
      <div>
        <label className={labelClass}>Relationship (e.g. Son, Daughter, Neighbor)</label>
        <input className={inputClass} value={form.relationship} onChange={set("relationship")} maxLength={40} />
      </div>
      <div>
        <label className={labelClass}>Phone number</label>
        <input className={inputClass} required value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" />
      </div>
      {error && <p className="text-sm text-clay">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save contact"}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function SectionHeading({ children, action }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-display text-lg font-bold text-ink">{children}</h3>
      {action}
    </div>
  );
}

export default function Profile({ user, role }) {
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addingAddress, setAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addingContact, setAddingContact] = useState(false);
  const [editingContactId, setEditingContactId] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const tasks = [getMyProfile()];
        if (role === "elder") {
          tasks.push(listAddresses(), listContacts());
        }
        const [profileRes, addressesRes, contactsRes] = await Promise.all(tasks);
        setProfile(profileRes);
        if (role === "elder") {
          setAddresses(addressesRes || []);
          setContacts(contactsRes || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [role]);

  const handleSaveAddress = async (form) => {
    if (editingAddressId) {
      await updateAddress(editingAddressId, form);
      setEditingAddressId(null);
    } else {
      await createAddress(form);
      setAddingAddress(false);
    }
    setAddresses(await listAddresses());
  };

  const handleSetDefault = async (id) => {
    await setDefaultAddress(id);
    setAddresses(await listAddresses());
  };

  const handleDeleteAddress = async (id) => {
    await deleteAddress(id);
    setAddresses(await listAddresses());
  };

  const handleSaveContact = async (form) => {
    if (editingContactId) {
      await updateContact(editingContactId, form);
      setEditingContactId(null);
    } else {
      await createContact(form);
      setAddingContact(false);
    }
    setContacts(await listContacts());
  };

  const handleDeleteContact = async (id) => {
    await deleteContact(id);
    setContacts(await listContacts());
  };

  const handleLanguageChange = async (e) => {
    const updated = await updateMyProfile({ preferredLanguage: e.target.value });
    setProfile(updated);
  };

  const handleVolunteerChange = async (field, value) => {
    const updated = await updateMyProfile({ [field]: value });
    setProfile(updated);
  };

  const handleUpdateLocation = async () => {
    setLocating(true);
    setLocationError("");
    try {
      const location = await getCurrentPosition();
      const updated = await updateMyProfile({ currentLocation: location });
      setProfile(updated);
    } catch (err) {
      setLocationError(err.message);
    } finally {
      setLocating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-2 space-y-3">
        <div className="h-6 w-40 animate-pulse rounded bg-line" />
        <div className="h-24 w-full animate-pulse rounded-2xl bg-line" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-2 space-y-8 pb-16">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Profile</h1>
        <Card className="mt-3 p-4 flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pine-light text-pine">
            <UserRound size={22} />
          </span>
          <div>
            <div className="font-semibold text-ink">{user.name}</div>
            <div className="text-sm text-ink-muted">{user.email}</div>
            <Badge tone="pine" className="mt-1 capitalize">{role}</Badge>
          </div>
        </Card>
      </div>

      {error && <p className="text-sm text-clay">{error}</p>}

      {role === "elder" && (
        <>
          <div>
            <SectionHeading>Preferred language</SectionHeading>
            <select
              className={`${inputClass} mt-2 max-w-xs`}
              value={profile?.preferredLanguage || "en"}
              onChange={handleLanguageChange}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>

          <div>
            <SectionHeading
              action={
                !addingAddress && (
                  <Button variant="secondary" onClick={() => { setAddingAddress(true); setEditingAddressId(null); }}>
                    + Add address
                  </Button>
                )
              }
            >
              Your addresses
            </SectionHeading>

            <div className="mt-3 space-y-3">
              {addingAddress && (
                <AddressForm initial={EMPTY_ADDRESS} onCancel={() => setAddingAddress(false)} onSave={handleSaveAddress} />
              )}

              {addresses.length === 0 && !addingAddress && (
                <Card className="p-6 text-center">
                  <MapPin className="mx-auto text-ink-muted" size={24} />
                  <p className="mt-2 text-ink-muted">No addresses yet. Add one so volunteers know where to deliver.</p>
                </Card>
              )}

              {addresses.map((addr) =>
                editingAddressId === addr.id ? (
                  <AddressForm
                    key={addr.id}
                    initial={addr}
                    onCancel={() => setEditingAddressId(null)}
                    onSave={handleSaveAddress}
                  />
                ) : (
                  <Card key={addr.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pine-light text-pine">
                        <MapPin size={16} />
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-ink flex items-center gap-2">
                          {addr.label}
                          {addr.isDefault && <Badge tone="marigold">Default</Badge>}
                        </div>
                        <div className="text-ink-muted text-sm mt-1">
                          {addr.addressLine1}{addr.landmark ? `, near ${addr.landmark}` : ""}<br />
                          {addr.city}, {addr.state} — {addr.pincode}
                        </div>
                        <div className="mt-3 flex gap-4 text-sm">
                          <button className="font-semibold text-pine hover:text-pine-deep" onClick={() => { setEditingAddressId(addr.id); setAddingAddress(false); }}>Edit</button>
                          {!addr.isDefault && (
                            <button className="font-semibold text-pine hover:text-pine-deep" onClick={() => handleSetDefault(addr.id)}>Set as default</button>
                          )}
                          <button className={dangerBtn} onClick={() => handleDeleteAddress(addr.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              )}
            </div>
          </div>

          <div>
            <SectionHeading
              action={
                !addingContact && (
                  <Button variant="secondary" onClick={() => { setAddingContact(true); setEditingContactId(null); }}>
                    + Add contact
                  </Button>
                )
              }
            >
              Emergency contacts
            </SectionHeading>

            <div className="mt-3 space-y-3">
              {addingContact && (
                <ContactForm initial={EMPTY_CONTACT} onCancel={() => setAddingContact(false)} onSave={handleSaveContact} />
              )}

              {contacts.length === 0 && !addingContact && (
                <Card className="p-6 text-center">
                  <Phone className="mx-auto text-ink-muted" size={24} />
                  <p className="mt-2 text-ink-muted">No emergency contacts yet. Add a family member we can reach if needed.</p>
                </Card>
              )}

              {contacts.map((c) =>
                editingContactId === c.id ? (
                  <ContactForm
                    key={c.id}
                    initial={c}
                    onCancel={() => setEditingContactId(null)}
                    onSave={handleSaveContact}
                  />
                ) : (
                  <Card key={c.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pine-light text-pine">
                        <Phone size={16} />
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-ink flex items-center gap-2">
                          {c.name}
                          {c.isPrimary && <Badge tone="marigold">Primary</Badge>}
                        </div>
                        <div className="text-ink-muted text-sm mt-1">
                          {c.relationship && `${c.relationship} · `}{c.phone}
                        </div>
                        <div className="mt-3 flex gap-4 text-sm">
                          <button className="font-semibold text-pine hover:text-pine-deep" onClick={() => { setEditingContactId(c.id); setAddingContact(false); }}>Edit</button>
                          <button className={dangerBtn} onClick={() => handleDeleteContact(c.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              )}
            </div>
          </div>
        </>
      )}

      {role === "volunteer" && (
        <div>
          <SectionHeading>Service settings</SectionHeading>
          <Card className="mt-3 p-4 space-y-5">
            <div>
              <label className={labelClass}>Maximum distance you're willing to travel</label>
              <select
                className={`${inputClass} max-w-xs`}
                value={profile?.maxDistanceKm || 10}
                onChange={(e) => handleVolunteerChange("maxDistanceKm", Number(e.target.value))}
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={15}>15 km</option>
                <option value={20}>20 km</option>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                id="available"
                type="checkbox"
                className="h-5 w-5 accent-pine"
                checked={!!profile?.isAvailable}
                onChange={(e) => handleVolunteerChange("isAvailable", e.target.checked)}
              />
              <span className="text-ink">I'm currently available to accept orders</span>
              {profile?.isAvailable && <Badge tone="moss" className="ml-auto">Available</Badge>}
            </label>

            <div className="pt-1 border-t border-line">
              <Button variant="secondary" onClick={handleUpdateLocation} disabled={locating} className="mt-4">
                <Navigation size={16} />
                {locating ? "Getting your location..." : "Update my current location"}
              </Button>
              <p className="mt-2 text-xs text-ink-muted flex items-center gap-1">
                <Star size={12} className="shrink-0" />
                {profile?.currentLocation?.lat != null
                  ? "We'll use this to show you nearby orders first."
                  : "Set your location so nearby orders can find you."}
              </p>
              {locationError && <p className="mt-1 text-sm text-clay">{locationError}</p>}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
