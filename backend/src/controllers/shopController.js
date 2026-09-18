const Shop = require("../models/Shop");
const ElderProfile = require("../models/ElderProfile");
const Order = require("../models/Order");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { distanceKm } = require("../utils/geo");

function sortByDistanceNullsLast(a, b) {
  if (a.distance === null && b.distance === null) return 0;
  if (a.distance === null) return 1;
  if (b.distance === null) return -1;
  return a.distance - b.distance;
}

// GET /api/shops?search=&city=&lat=&lng=
const listShops = asyncHandler(async (req, res) => {
  const { search, city, lat, lng } = req.query;
  const filter = { isActive: true };
  if (search) filter.name = { $regex: search.trim(), $options: "i" };
  if (city) filter.city = { $regex: city.trim(), $options: "i" };

  const rawShops = await Shop.find(filter).limit(50);
  const hasCoords = lat !== undefined && lng !== undefined && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng));

  let shops;
  if (hasCoords) {
    shops = rawShops
      .map((s) => ({
        shop: s,
        distance:
          s.location?.lat != null ? distanceKm(Number(lat), Number(lng), s.location.lat, s.location.lng) : null,
      }))
      .sort(sortByDistanceNullsLast)
      .map(({ shop, distance }) => ({
        ...shop.toJSON(),
        distanceKm: distance === null ? null : Math.round(distance * 10) / 10,
      }));
  } else {
    shops = rawShops.slice().sort((a, b) => a.name.localeCompare(b.name)).map((s) => s.toJSON());
  }

  res.json({ success: true, shops });
});

// GET /api/shops/favorites  (elder)
const listFavoriteShops = asyncHandler(async (req, res) => {
  const profile = await ElderProfile.findOne({ user: req.user.id }).populate("favoriteShops");
  res.json({ success: true, shops: profile?.favoriteShops || [] });
});

// GET /api/shops/recent  (elder) — derived from order history, not a stored list
const listRecentShops = asyncHandler(async (req, res) => {
  const orders = await Order.find({ elder: req.user.id, "shop.shop": { $ne: null } })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("shop.shop");

  const seen = new Set();
  const ids = [];
  orders.forEach((o) => {
    const id = o.shop.shop?.toString();
    if (id && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  });

  const topIds = ids.slice(0, 5);
  const shops = await Shop.find({ _id: { $in: topIds } });
  const ordered = topIds.map((id) => shops.find((s) => s._id.toString() === id)).filter(Boolean);

  res.json({ success: true, shops: ordered });
});

// GET /api/shops/:id
const getShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) {
    throw new ApiError(404, "We couldn't find that shop.");
  }
  res.json({ success: true, shop });
});

// POST /api/shops/:id/favorite  (elder) — toggles on/off
const toggleFavoriteShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) {
    throw new ApiError(404, "We couldn't find that shop.");
  }

  const profile = await ElderProfile.findOne({ user: req.user.id });
  const idx = profile.favoriteShops.findIndex((id) => id.toString() === req.params.id);

  let favorited;
  if (idx >= 0) {
    profile.favoriteShops.splice(idx, 1);
    favorited = false;
  } else {
    profile.favoriteShops.push(shop._id);
    favorited = true;
  }
  await profile.save();

  res.json({ success: true, favorited });
});

module.exports = { listShops, getShop, listFavoriteShops, toggleFavoriteShop, listRecentShops };
