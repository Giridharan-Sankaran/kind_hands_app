const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    subcategory: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    // Product photography isn't available in this environment — image
    // upload/CDN storage gets wired up (via Cloud Storage or similar)
    // once the admin dashboard (Phase 11) can manage it. Empty for now;
    // the frontend falls back to a category icon.
    image: {
      type: String,
      trim: true,
      default: "",
    },
    unit: {
      type: String,
      required: [true, "Unit is required, e.g. '1 kg', '500 ml', '6 pcs'"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    popularity: {
      type: Number,
      default: 0,
    },
    isFrequentlyOrdered: {
      type: Boolean,
      default: false,
    },
    elderFriendlyTags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

productSchema.index({ name: 1 });
productSchema.index({ category: 1, isAvailable: 1 });

productSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Product", productSchema);
