const { validationResult } = require("express-validator");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

function throwIfInvalid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }
}

async function findOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

// Builds the response shape the frontend renders. Catalog lines get live
// product details and a computed subtotal; custom (free-text) lines have
// no known price yet — priced when the volunteer actually buys them — so
// they're shown with subtotal 0 and flagged hasCustomItems so the UI can
// label the total as an estimate rather than a final figure.
async function serializeCart(cart) {
  const populated = await cart.populate("items.product");
  let total = 0;

  const items = populated.items.map((item) => {
    if (item.isCustom) {
      return {
        id: item._id.toString(),
        isCustom: true,
        name: item.customName,
        unit: item.customUnit,
        quantity: item.quantity,
        note: item.note || "",
        unavailable: false,
        subtotal: 0,
      };
    }

    const product = item.product;
    const unavailable = !product || !product.isAvailable;
    const subtotal = unavailable ? 0 : product.price * item.quantity;
    if (!unavailable) total += subtotal;

    return {
      id: item._id.toString(),
      isCustom: false,
      product: product || null,
      quantity: item.quantity,
      note: item.note || "",
      unavailable,
      subtotal,
    };
  });

  return {
    id: populated.id,
    items,
    total,
    itemCount: items.length,
    hasCustomItems: items.some((i) => i.isCustom),
  };
}

// GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await findOrCreateCart(req.user.id);
  res.json({ success: true, cart: await serializeCart(cart) });
});

// POST /api/cart/items
// Either { productId, quantity, note? } for a catalog item, or
// { customName, customUnit, quantity?, note? } for a free-text item not
// in the catalog. Custom lines are never merged — each one is its own
// entry, since there's no id to match a duplicate against.
const addItem = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const { productId, quantity, note, customName, customUnit } = req.body;
  const cart = await findOrCreateCart(req.user.id);

  if (customName) {
    cart.items.push({
      isCustom: true,
      customName: customName.trim(),
      customUnit: (customUnit || "").trim(),
      quantity: quantity || 1,
      note: note || "",
    });
    await cart.save();
    return res.status(201).json({ success: true, cart: await serializeCart(cart) });
  }

  const product = await Product.findById(productId);
  if (!product || !product.isAvailable) {
    throw new ApiError(404, "That item isn't available right now.");
  }

  const existing = cart.items.find((i) => !i.isCustom && i.product && i.product.toString() === productId);
  if (existing) {
    existing.quantity = Math.min(99, existing.quantity + quantity);
    if (note !== undefined) existing.note = note;
  } else {
    cart.items.push({ product: productId, quantity, note: note || "" });
  }

  await cart.save();
  res.status(201).json({ success: true, cart: await serializeCart(cart) });
});

// PATCH /api/cart/items/:itemId  { quantity?, note? }
// Quantity of 0 removes the line. Works for both catalog and custom items.
const updateItem = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const { quantity, note } = req.body;
  const cart = await findOrCreateCart(req.user.id);
  const item = cart.items.id(req.params.itemId);

  if (!item) {
    throw new ApiError(404, "That item isn't in your cart.");
  }

  if (quantity !== undefined && quantity <= 0) {
    cart.items.pull({ _id: req.params.itemId });
  } else {
    if (quantity !== undefined) item.quantity = quantity;
    if (note !== undefined) item.note = note;
  }

  await cart.save();
  res.json({ success: true, cart: await serializeCart(cart) });
});

// DELETE /api/cart/items/:itemId
const removeItem = asyncHandler(async (req, res) => {
  const cart = await findOrCreateCart(req.user.id);
  cart.items.pull({ _id: req.params.itemId });
  await cart.save();
  res.json({ success: true, cart: await serializeCart(cart) });
});

// DELETE /api/cart
const clearCart = asyncHandler(async (req, res) => {
  const cart = await findOrCreateCart(req.user.id);
  cart.items = [];
  await cart.save();
  res.json({ success: true, cart: await serializeCart(cart) });
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
