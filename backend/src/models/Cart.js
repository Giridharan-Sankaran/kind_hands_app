const mongoose = require("mongoose");

// Prices are intentionally NOT snapshotted here — the cart always reflects
// live catalog prices. Order creation (Phase 5) is where a price gets
// locked in for a placed order.
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      max: [99, "Quantity can't exceed 99"],
    },
    // e.g. "smaller tomatoes please" / "Aashirvaad brand only"
    note: {
      type: String,
      default: "",
      maxlength: 200,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

cartSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Cart", cartSchema);
