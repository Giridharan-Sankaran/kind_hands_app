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

// Builds the response shape the frontend renders: each line with live
// product details and a computed subtotal, plus a cart-wide total. Any
// item whose product was deleted or made unavailable is dropped from the
// totals (and flagged) rather than silently priced at zero.
async function serializeCart(cart) {
  const populated = await cart.populate("items.product");
  let total = 0;
  const items = populated.items.map((item) => {
    const product = item.product;
    const unavailable = !product || !product.isAvailable;
    const subtotal = unavailable ? 0 : product.price * item.quantity;
    if (!unavailable) total += subtotal;
    return {
      product: product || null,
      quantity: item.quantity,
      note: item.note || "",
      unavailable,
      subtotal,
    };
  });

  return { id: populated.id, items, total, itemCount: items.length };
}

// GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await findOrCreateCart(req.user.id);
  res.json({ success: true, cart: await serializeCart(cart) });
});

// POST /api/cart/items  { productId, quantity, note? }
const addItem = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const { productId, quantity, note } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isAvailable) {
    throw new ApiError(404, "That item isn't available right now.");
  }

  const cart = await findOrCreateCart(req.user.id);
  const existing = cart.items.find((i) => i.product.toString() === productId);

  if (existing) {
    existing.quantity = Math.min(99, existing.quantity + quantity);
    if (note !== undefined) existing.note = note;
  } else {
    cart.items.push({ product: productId, quantity, note: note || "" });
  }

  await cart.save();
  res.status(201).json({ success: true, cart: await serializeCart(cart) });
});

// PATCH /api/cart/items/:productId  { quantity?, note? }
// Quantity of 0 removes the item. Either field can be sent alone — e.g.
// just adding a note without changing quantity.
const updateItem = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const { quantity, note } = req.body;
  const cart = await findOrCreateCart(req.user.id);
  const item = cart.items.find((i) => i.product.toString() === req.params.productId);

  if (!item) {
    throw new ApiError(404, "That item isn't in your cart.");
  }

  if (quantity !== undefined && quantity <= 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  } else {
    if (quantity !== undefined) item.quantity = quantity;
    if (note !== undefined) item.note = note;
  }

  await cart.save();
  res.json({ success: true, cart: await serializeCart(cart) });
});

// DELETE /api/cart/items/:productId
const removeItem = asyncHandler(async (req, res) => {
  const cart = await findOrCreateCart(req.user.id);
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
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
