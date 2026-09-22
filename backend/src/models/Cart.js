const mongoose = require("mongoose");

// Prices are intentionally NOT snapshotted here — the cart always reflects
// live catalog prices. Order creation (Phase 5) is where a price gets
// locked in for a placed order.
//
// An item is either a catalog Product (product set, isCustom false) or a
// free-text item the elder typed themselves (isCustom true, product null,
// customName/customUnit hold what they typed) — since there's no free API
// for a specific shop's real inventory or pricing, letting the elder
// write "2 kg tomatoes" for anything not in the catalog is more honest
// than pretending our fixed catalog covers every real shop.
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    customName: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },
    // Free text, e.g. "2 kg", "1 packet", "500 ml" — deliberately not a
    // number+unit dropdown, since that's how someone would actually write
    // it on a paper shopping list.
    customUnit: {
      type: String,
      trim: true,
      default: "",
      maxlength: 40,
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
  }
  // Each line gets a real auto-generated _id (not disabled here) — catalog
  // items can be addressed by product id, but custom items have no
  // product, so every line needs its own stable identifier for
  // update/remove to target the right one.
);

cartItemSchema.pre("validate", function validateItemShape(next) {
  if (this.isCustom && !this.customName.trim()) {
    return next(new Error("A custom item needs a name."));
  }
  if (!this.isCustom && !this.product) {
    return next(new Error("Item is missing a product."));
  }
  next();
});

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
