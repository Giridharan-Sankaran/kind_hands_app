# Kind Hands

Kind Hands connects elderly users in India who need groceries or daily-use items with
volunteers willing to shop for and deliver them. This repo is being rebuilt in phases
into a production-quality platform — see [Project status](#project-status) below for
where things currently stand.

## Architecture

- **Backend** (`backend/`) — Node.js, Express, MongoDB (Mongoose), JWT authentication.
- **Frontend** (`kindhands-frontend/`) — React 19, Vite, Tailwind CSS, React Router.

The frontend talks to the backend exclusively over a REST API (`/api/...`). There is no
direct database access from the browser — all authentication, authorization, and business
logic live on the server, where they can actually be trusted.

## Getting started

You'll need Node.js 18+ and a MongoDB instance (local, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI to your database, and JWT_SECRET to a long random string
npm run dev
```

The API starts on `http://localhost:5000` by default. Check `http://localhost:5000/api/health`
to confirm it's running and connected.

Once it's running, seed the product catalog and demo shops:

```bash
npm run seed
```

This populates 14 categories, 97 products, and 8 demo shops (fictional names/addresses,
real city coordinates) so the catalog and shop-selection screens aren't empty.

### 2. Frontend

```bash
cd kindhands-frontend
npm install
cp .env.example .env
# edit .env if your backend isn't running on the default URL
npm run dev
```

The app starts on `http://localhost:5175` by default (Vite's default port).

## Project status

This project is being rebuilt in phases (architecture, auth, elder experience, catalog,
shops/orders, volunteer matching, tracking, OTP, payments, notifications, admin,
accessibility, testing, production readiness). Each phase is built, checked, and reported
on before moving to the next.

**Completed:**
- Phase 1 — Architecture & cleanup: removed the old Firebase-only client, removed dead
  duplicate code that existed at the repo root, replaced it with a proper Express +
  MongoDB backend and a documented REST API.
- Phase 2 — Authentication & roles: registration, login, JWT-based sessions, password
  hashing, rate-limited auth endpoints, role-based route protection (elder / volunteer;
  admin accounts are provisioned separately, not through public registration).
- Phase 3 — Elder experience: saved addresses (with an optional real GPS pin via the
  browser's Geolocation API), emergency contacts, and role-specific profile settings.
- Phase 4 — Product catalog & cart: a dynamic, database-backed catalog (14 categories,
  97 products seeded via `npm run seed`), search/filter/pagination, and a server-computed
  cart (prices are never trusted from the client).
- Phase 5 — Shop & order creation: shop search with favorites/recently-used/manual entry,
  a full checkout flow, and an Order model that snapshots prices, shop, and delivery
  address at the moment of purchase so later edits never rewrite order history.
- Phase 6 — Volunteer marketplace & matching: real distance-based matching using the
  haversine formula fed by the browser's Geolocation API (no paid maps API key needed),
  and a race-condition-safe accept flow — two volunteers hitting "Accept" on the same
  order at the same instant can't both win; MongoDB's atomic `findOneAndUpdate` ensures
  only one succeeds.
- UI/UX design pass: a real design system instead of default Tailwind — a pine-green
  and marigold palette grounded in the doorstep-handoff concept at the center of the
  product, Bricolage Grotesque + Public Sans typography (the latter designed by the
  US government specifically for accessibility), a signature tote-bag mark, and a small
  reusable component kit (`Button`, `Card`, `Badge`). Also fixed two real bugs found in
  the process: the cart item count wasn't showing anywhere because there was no shared
  cart state (`CartContext` now updates the nav badge live from every add/update/remove
  API response), and a leftover global CSS reset from Phase 1 was silently overriding
  every form/button's own sizing.
- Full delivery experience: per-item cart notes; real address autocomplete and
  reverse-geocoding via OpenStreetMap's free Nominatim service (no paid Google Maps key
  needed) so addresses actually get coordinates instead of staying blank; real nearby
  shop discovery via OpenStreetMap's Overpass API, blended into shop selection alongside
  saved/favorite shops; a volunteer-side status flow (heading to shop → shopping →
  purchased → out for delivery → arrived → delivered) with a live GPS tracking map
  (Leaflet + OpenStreetMap tiles, updated via the browser's `watchPosition`, visible to
  the elder only while a delivery is actually in progress); in-app order-scoped
  messaging between elder and volunteer, with automatic system messages posted at each
  status change; and a call button once a volunteer is assigned. All of this lives on a
  new `/orders/:id` detail page.
- **Bug fix — volunteer distance matching**: found and fixed the root cause of
  volunteers seeing orders from anywhere in the world regardless of their own location.
  The marketplace filter had a "show it anyway if we can't measure distance" fallback
  that was meant to degrade gracefully, but because addresses never reliably got real
  coordinates before this pass, every order fell into that fallback and got shown to
  every volunteer. Fixed by (a) wiring in real geocoding so addresses actually get
  coordinates, and (b) tightening the filter so an order with unmeasured distance is
  excluded once a volunteer has set their own location, rather than shown as if it were
  nearby. Also added a manual city-search fallback for volunteers who'd rather type a
  place name than share GPS location.

**Not yet built:** OTP delivery verification, the UPI payment workflow (payment is
currently a manual "payment received" confirmation by the volunteer — no real gateway),
push/SMS/email notifications (status updates currently show up as in-app system
messages, not a phone notification), the admin dashboard, and the automated test suite.

## Free map services — what they are and their limits

Google Maps needs a paid API key that isn't configured in this environment, so this
project uses OpenStreetMap's free, keyless alternatives instead:

- **Nominatim** (address search & reverse geocoding) — used in the address form for
  autocomplete and "use my current location."
- **Overpass API** (real-world place data) — used in checkout to find actual nearby
  shops, not a fixed demo list.
- **Leaflet + OSM tile server** — the live delivery-tracking map.

All three are genuinely free and require no signup, but they're rate-limited and meant
for light/fair use, not production traffic at scale (see
[Nominatim's usage policy](https://operations.osmfoundation.org/policies/nominatim/)).
For a real production deployment with meaningful traffic, plan to either self-host these
services or move to a commercial provider (Google Maps, Mapbox, etc.) with a paid key.

## Security notes

- Passwords are hashed with bcrypt; the backend never stores or logs plaintext passwords.
- JWTs are verified server-side on every request — the client's claimed role is never
  trusted directly.
- `.env` files are gitignored in both `backend/` and `kindhands-frontend/`; only the
  `.env.example` templates are committed. Never commit real secrets.
- Volunteers can only see an order's city/state and computed distance before accepting —
  the elder's name, phone, and exact street address are withheld until the volunteer is
  actually the assigned volunteer on that order.
- Volunteer-order matching uses the browser's native Geolocation API (device GPS/Wi-Fi)
  rather than a paid geocoding service, so distance matching works with zero API keys
  configured. Reverse-geocoding a *typed* address into coordinates would need a real
  maps provider — that's not wired up, so addresses only get coordinates if the person
  explicitly uses "use my current location."
