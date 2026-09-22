# Kind Hands

Kind Hands connects elderly users in India who need groceries or daily-use items with
volunteers willing to shop for and deliver them, for free — a social-service delivery
platform, not a commercial one.

## Architecture

- **Backend** (`backend/`) — Node.js, Express, MongoDB (Mongoose), JWT authentication.
- **Frontend** (`kindhands-frontend/`) — React 19, Vite, Tailwind CSS, React Router.

The frontend talks to the backend exclusively over a REST API (`/api/...`). No direct
database access from the browser — all authentication, authorization, and business
logic live on the server.

## Getting started

You'll need Node.js 18+ and a MongoDB instance. The included `docker-compose.yml` is
the easiest way to get one running locally without installing MongoDB directly:

```bash
docker compose up -d
```

This starts MongoDB on `127.0.0.1:27018` (not the default 27017, to avoid clashing with
a local Mongo install if you have one) with data persisted in a Docker volume. See
`backend/.env.example` for the matching connection string.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set JWT_SECRET to a long random string (MONGO_URI already points at
# the Docker container above — change it if you're using Atlas or a different setup)
npm run dev
```

The API starts on `http://localhost:5000`. Check `http://localhost:5000/api/health` to
confirm it's running and connected.

Once it's running, seed the product catalog and demo shops:

```bash
npm run seed
```

This populates 14 categories, 97 products, and 8 demo shops.

### 2. Frontend

```bash
cd kindhands-frontend
npm install
cp .env.example .env
npm run dev
```

The app starts on `http://localhost:5173` (Vite's default port).

## Project status

**Built so far:**
- Authentication & roles — registration, login, JWT sessions, password hashing,
  rate-limited auth endpoints, role-based route protection.
- Elder experience — saved addresses (with real address autocomplete and reverse
  geocoding via OpenStreetMap, not just typed text), emergency contacts.
- Product catalog & cart — a dynamic, database-backed catalog (seeded via `npm run
  seed`) with approximate reference prices, plus free-text custom items for anything
  not in the catalog (no free API exists for a specific shop's real inventory or
  pricing, so letting the elder type "2 kg tomatoes" is more honest than pretending the
  catalog covers everything).
- Shop selection — search saved shops, favorites, recently-used, real nearby shops via
  OpenStreetMap's Overpass API, and search by any city name — not just a fixed demo
  list.
- Volunteer marketplace & matching — real distance-based matching via the haversine
  formula fed by the browser's Geolocation API (no paid maps key needed), a
  race-condition-safe accept flow (atomic `findOneAndUpdate`, so two volunteers can't
  both win the same order), and a manual city-search fallback.
- Full delivery flow — a volunteer-side status pipeline (heading to shop → shopping →
  purchased → out for delivery → arrived → delivered) with live GPS tracking (Leaflet +
  OpenStreetMap tiles) visible to the elder while a delivery is in progress, in-app
  order-scoped messaging with automatic system messages at each status change, a call
  button, a "Get directions" deep link for volunteers (free Google Maps link, no API
  key), and a completed-deliveries counter shown as a trust signal.
- A real design system — pine green + marigold palette grounded in the doorstep-handoff
  concept, Bricolage Grotesque + Public Sans typography, a signature tote-bag mark, and
  a small reusable component kit (`Button`, `Card`, `Badge`).

**Not yet built:** OTP delivery verification, a real UPI/payment-gateway workflow
(currently a manual "payment received" confirmation by the volunteer), push/SMS/email
notifications (status updates currently show as in-app messages only), the admin
dashboard, and an automated test suite.

## Free map & geocoding services — what they are and their limits

Google Maps needs a paid API key that isn't configured in this environment, so this
project uses OpenStreetMap's free, keyless alternatives instead:

- **Nominatim** — address autocomplete & reverse geocoding.
- **Overpass API** — real-world nearby shop discovery.
- **Leaflet + OSM tile server** — the live delivery-tracking map.

All three are genuinely free and require no signup, but they're rate-limited and meant
for light/fair use, not production traffic at scale (see
[Nominatim's usage policy](https://operations.osmfoundation.org/policies/nominatim/)).
For real production traffic, plan to self-host these services or move to a commercial
provider with a paid key.

## Security notes

- Passwords are hashed with bcrypt; plaintext is never stored or logged.
- JWTs are verified server-side on every request — the client's claimed role is never
  trusted directly.
- `.env` files are gitignored in both `backend/` and `kindhands-frontend/`; only the
  `.env.example` templates are committed.
- Volunteers can only see an order's city/state and computed distance before accepting
  — the elder's name, phone, and exact street address are withheld until the volunteer
  is actually assigned to that order.
- Live tracking has no public/unauthenticated link — it's only visible on the same
  authenticated order page both parties already use, to avoid exposing a volunteer's
  live location to anyone who obtains a URL.
