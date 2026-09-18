const mongoose = require("mongoose");

// Full 14-stage lifecycle from the product spec. Only 'searching_volunteer',
// 'volunteer_assigned', and 'cancelled' are reachable through code right
// now (Phase 5/6). The rest are reserved for the shopping-progress
// controls (Phase 7), OTP delivery (Phase 8), and payment (Phase 9), so
// the schema doesn't need another migration when those land.
const ORDER_STATUSES = [
  "placed",
  "searching_volunteer",
  "volunteer_assigned",
  "going_to_shop",
  "shopping_in_progress",
  "items_purchased",
  "heading_to_elder",
  "near_destination",
  "arrived",
  "otp_verification",
  "delivered",
  "payment_completed",
  "completed",
  "cancelled",
];

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  // Snapshotted at order time so a later catalog edit never rewrites history.
  name: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceAtOrder: { type: Number, required: true, min: 0 },
  // e.g. "smaller tomatoes please" / "Aashirvaad brand only" — carried over from the cart.
  note: { type: String, default: "", maxlength: 200 },
  // Filled in by the volunteer while shopping — not used until Phase 8.
  actualPrice: { type: Number, default: null },
  itemStatus: {
    type: String,
    enum: ["pending", "purchased", "unavailable", "substituted"],
    default: "pending",
  },
});

const statusHistoryEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    elder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "An order needs at least one item.",
      },
    },
    shop: {
      shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", default: null },
      name: { type: String, required: true },
      address: { type: String, default: "" },
      phone: { type: String, default: "" },
      isManualEntry: { type: Boolean, default: false },
    },
    // Snapshotted from the elder's saved Address, so editing/deleting the
    // saved address later never changes a placed order's delivery details.
    deliveryAddress: {
      label: { type: String, default: "" },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: "" },
      landmark: { type: String, default: "" },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      location: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
      },
    },
    shoppingNotes: { type: String, default: "", maxlength: 500 },
    deliveryInstructions: { type: String, default: "", maxlength: 500 },
    itemsTotal: { type: Number, required: true, min: 0 },
    // Set once the volunteer records real purchase prices (Phase 8).
    actualTotal: { type: Number, default: null },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "searching_volunteer",
      index: true,
    },
    statusHistory: {
      type: [statusHistoryEntrySchema],
      default: [],
    },
    acceptedAt: { type: Date, default: null },
    // Pushed by the volunteer's device while status is heading_to_elder /
    // arrived, via watchPosition — real device GPS, not simulated. The
    // elder's order-tracking view polls the order and renders this on a map.
    volunteerLiveLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date, default: null },
    },
    cancelledAt: { type: Date, default: null },
    cancelledBy: { type: String, enum: ["elder", "volunteer", "admin", null], default: null },
    cancellationReason: { type: String, default: "" },
  },
  { timestamps: true }
);

orderSchema.index({ status: 1, createdAt: -1 });

orderSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Order", orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
