const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Shop address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    pincode: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    openingHours: {
      type: String,
      trim: true,
      default: "9:00 AM - 9:00 PM",
    },
    type: {
      type: String,
      trim: true,
      default: "Grocery store",
    },
    // Populated from admin entry or an elder's "use my location" pin —
    // no automatic address-to-coordinates geocoding is wired up (that
    // needs a paid maps API key this environment doesn't have).
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    rating: {
      type: Number,
      default: null,
      min: 0,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

shopSchema.index({ name: 1 });

shopSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Shop", shopSchema);
