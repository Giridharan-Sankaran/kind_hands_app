const { validationResult } = require("express-validator");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Shop = require("../models/Shop");
const Address = require("../models/Address");
const VolunteerProfile = require("../models/VolunteerProfile");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { distanceKm } = require("../utils/geo");
const { assertOrderAccess } = require("../utils/orderAccess");
const { postSystemMessage } = require("../utils/systemMessage");

function throwIfInvalid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }
}

// The forward-only path a volunteer can advance an order through. Skipping
// ahead or moving backward isn't allowed — each step is a distinct real
// action (arriving at the shop, finishing shopping, etc).
const STATUS_SEQUENCE = [
  "volunteer_assigned",
  "going_to_shop",
  "shopping_in_progress",
  "items_purchased",
  "heading_to_elder",
  "arrived",
  "delivered",
];

const STATUS_MESSAGES = {
  going_to_shop: "🏬 Heading to the shop now.",
  shopping_in_progress: "🛒 Shopping for your items.",
  items_purchased: "✅ All items purchased.",
  heading_to_elder: "🚚 On the way to you now — you can follow live location below.",
  arrived: "📍 Arrived at your address.",
  delivered: "🎉 Delivered! Payment received. Thank you.",
};

// POST /api/orders  (elder)
// Converts the elder's current cart into an order. Prices are snapshotted
// at this moment — later catalog price changes never retroactively alter
// a placed order.
const createOrder = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const { addressId, shopId, manualShop, shoppingNotes, deliveryInstructions } = req.body;

  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty.");
  }

  const availableItems = cart.items.filter((i) => i.product && i.product.isAvailable);
  const droppedItems = cart.items
    .filter((i) => !i.product || !i.product.isAvailable)
    .map((i) => (i.product ? i.product.name : "An item that was removed from the catalog"));

  if (availableItems.length === 0) {
    throw new ApiError(400, "None of the items in your cart are available right now.");
  }

  const orderItems = availableItems.map((i) => ({
    product: i.product._id,
    name: i.product.name,
    unit: i.product.unit,
    quantity: i.quantity,
    priceAtOrder: i.product.price,
    note: i.note || "",
  }));
  const itemsTotal = orderItems.reduce((sum, i) => sum + i.priceAtOrder * i.quantity, 0);

  const address = await Address.findOne({ _id: addressId, user: req.user.id });
  if (!address) {
    throw new ApiError(400, "Please choose a valid delivery address.");
  }

  let shopInfo;
  if (shopId) {
    const shop = await Shop.findOne({ _id: shopId, isActive: true });
    if (!shop) {
      throw new ApiError(400, "Please choose a valid shop.");
    }
    shopInfo = { shop: shop._id, name: shop.name, address: shop.address, phone: shop.phone, isManualEntry: false };
  } else if (manualShop && manualShop.name) {
    // Also used for real nearby shops found via OpenStreetMap — those
    // aren't in our Shop collection, so they come through as manual entries.
    shopInfo = {
      shop: null,
      name: manualShop.name,
      address: manualShop.address || "",
      phone: manualShop.phone || "",
      isManualEntry: true,
    };
  } else {
    throw new ApiError(400, "Please choose a shop, or enter one manually.");
  }

  const order = await Order.create({
    elder: req.user.id,
    items: orderItems,
    shop: shopInfo,
    deliveryAddress: {
      label: address.label,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      location: address.location,
    },
    shoppingNotes: shoppingNotes || "",
    deliveryInstructions: deliveryInstructions || "",
    itemsTotal,
    status: "searching_volunteer",
    statusHistory: [{ status: "searching_volunteer", changedBy: req.user.id }],
  });

  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, order, droppedItems });
});

// GET /api/orders  (elder) — the elder's own order history, newest first
const listMyOrders = asyncHandler(async (req, res) => {
  const filter = { elder: req.user.id };
  if (req.query.status) filter.status = req.query.status;
  const orders = await Order.find(filter).sort({ createdAt: -1 }).populate("volunteer", "name phone");
  res.json({ success: true, orders });
});

// GET /api/orders/available  (volunteer) — the marketplace.
//
// Two modes:
//  - City mode (?city=...): a manual override — filter purely by matching
//    the order's delivery city, ignoring GPS entirely. For volunteers who'd
//    rather type a place name than share their location.
//  - Distance mode (default): haversine distance from the volunteer's
//    browser-supplied location. Critically, once the volunteer HAS a
//    location set, an order whose distance we can't compute is EXCLUDED,
//    not shown anyway — showing unmeasured orders as if they were "nearby"
//    is exactly the bug that let a volunteer in one country see an order
//    across the world. Only when the volunteer has no location at all do
//    we fall back to showing everything (with locationEnabled: false so
//    the UI can prompt them to set one).
//
// Privacy: only city/state and computed distance are exposed here — never
// the elder's name, phone, exact street address, landmark, or pincode.
const listAvailableOrders = asyncHandler(async (req, res) => {
  const profile = await VolunteerProfile.findOne({ user: req.user.id });
  if (!profile) {
    throw new ApiError(404, "We couldn't find your volunteer profile.");
  }

  const orders = await Order.find({ status: "searching_volunteer" }).sort({ createdAt: 1 });
  const cityQuery = (req.query.city || "").trim().toLowerCase();

  let results;
  let locationEnabled = true;

  if (cityQuery) {
    results = orders
      .filter((order) => order.deliveryAddress.city.toLowerCase().includes(cityQuery))
      .map((order) => ({ order, distance: null }));
  } else {
    const hasVolunteerLocation = profile.currentLocation?.lat != null && profile.currentLocation?.lng != null;
    locationEnabled = hasVolunteerLocation;

    const withDistance = orders.map((order) => {
      const loc = order.deliveryAddress?.location;
      const hasOrderLocation = loc?.lat != null && loc?.lng != null;
      const distance =
        hasVolunteerLocation && hasOrderLocation
          ? distanceKm(profile.currentLocation.lat, profile.currentLocation.lng, loc.lat, loc.lng)
          : null;
      return { order, distance };
    });

    results = hasVolunteerLocation
      ? withDistance.filter(({ distance }) => distance !== null && distance <= profile.maxDistanceKm)
      : withDistance; // no location set at all — show everything, UI prompts to set one
  }

  results.sort((a, b) => {
    if (a.distance === null && b.distance === null) return 0;
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });

  res.json({
    success: true,
    locationEnabled,
    orders: results.map(({ order, distance }) => ({
      id: order.id,
      items: order.items.map((i) => ({ name: i.name, unit: i.unit, quantity: i.quantity })),
      itemsTotal: order.itemsTotal,
      shop: { name: order.shop.name, address: order.shop.address, isManualEntry: order.shop.isManualEntry },
      deliveryArea: { city: order.deliveryAddress.city, state: order.deliveryAddress.state },
      distanceKm: distance === null ? null : Math.round(distance * 10) / 10,
      createdAt: order.createdAt,
    })),
  });
});

// GET /api/orders/mine  (volunteer) — orders this volunteer has accepted
const listMyAssignedOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ volunteer: req.user.id }).sort({ createdAt: -1 }).populate("elder", "name phone");
  res.json({ success: true, orders });
});

// GET /api/orders/:id — visible to the owning elder, the assigned
// volunteer, or an admin.
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("elder", "name phone")
    .populate("volunteer", "name phone");

  assertOrderAccess(order, req.user);

  res.json({ success: true, order });
});

// POST /api/orders/:id/accept  (volunteer)
// The atomic core of the marketplace: findOneAndUpdate only succeeds if
// the order is STILL unassigned at the moment MongoDB applies the write.
// If two volunteers hit accept at the same instant, MongoDB serializes the
// two writes — the first one through wins, and the second one's filter no
// longer matches, so it gets null back and a clean 409 instead of a silent
// double-assignment.
const acceptOrder = asyncHandler(async (req, res) => {
  const profile = await VolunteerProfile.findOne({ user: req.user.id });
  if (!profile || !profile.isAvailable) {
    throw new ApiError(400, "Set yourself as available before accepting orders.");
  }

  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, status: "searching_volunteer", volunteer: null },
    {
      $set: { volunteer: req.user.id, status: "volunteer_assigned", acceptedAt: new Date() },
      $push: { statusHistory: { status: "volunteer_assigned", changedBy: req.user.id } },
    },
    { new: true }
  );

  if (!order) {
    throw new ApiError(409, "This order was just accepted by another volunteer.");
  }

  await postSystemMessage(order._id, `🙌 ${req.user.name} accepted your order and will start shopping soon.`);

  res.json({ success: true, order });
});

// PATCH /api/orders/:id/status  (volunteer, assigned only)   { status }
// Moves the order exactly one step forward through STATUS_SEQUENCE.
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, "We couldn't find that order.");
  }
  if (!order.volunteer || order.volunteer.toString() !== req.user.id) {
    throw new ApiError(403, "You're not the volunteer assigned to this order.");
  }

  const currentIndex = STATUS_SEQUENCE.indexOf(order.status);
  const nextStatus = STATUS_SEQUENCE[currentIndex + 1];

  if (!nextStatus || req.body.status !== nextStatus) {
    throw new ApiError(400, `This order isn't ready to move to that status yet.`);
  }

  order.status = nextStatus;
  order.statusHistory.push({ status: nextStatus, changedBy: req.user.id });
  await order.save();

  if (STATUS_MESSAGES[nextStatus]) {
    await postSystemMessage(order._id, STATUS_MESSAGES[nextStatus]);
  }

  res.json({ success: true, order });
});

// PATCH /api/orders/:id/location  (volunteer, assigned only)   { lat, lng }
// Only accepted while the order is actively out for delivery — the
// volunteer's live position is not something we store or broadcast outside
// that window.
const updateLiveLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  if (typeof lat !== "number" || typeof lng !== "number") {
    throw new ApiError(400, "Missing location.");
  }

  const order = await Order.findOneAndUpdate(
    {
      _id: req.params.id,
      volunteer: req.user.id,
      status: { $in: ["heading_to_elder", "arrived"] },
    },
    { $set: { volunteerLiveLocation: { lat, lng, updatedAt: new Date() } } },
    { new: true }
  );

  if (!order) {
    throw new ApiError(400, "Live location can only be shared while a delivery is in progress.");
  }

  res.json({ success: true, volunteerLiveLocation: order.volunteerLiveLocation });
});

// POST /api/orders/:id/cancel  (elder)
// Only cancellable before a volunteer has accepted — once assigned,
// cancellation needs to notify the volunteer first, which is future work.
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, elder: req.user.id, status: "searching_volunteer" },
    {
      $set: {
        status: "cancelled",
        cancelledAt: new Date(),
        cancelledBy: "elder",
        cancellationReason: req.body.reason || "",
      },
      $push: { statusHistory: { status: "cancelled", changedBy: req.user.id } },
    },
    { new: true }
  );

  if (!order) {
    throw new ApiError(409, "This order can no longer be cancelled — it may already have a volunteer assigned.");
  }

  res.json({ success: true, order });
});

module.exports = {
  createOrder,
  listMyOrders,
  listAvailableOrders,
  listMyAssignedOrders,
  getOrder,
  acceptOrder,
  updateOrderStatus,
  updateLiveLocation,
  cancelOrder,
};
