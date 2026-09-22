const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    label: {
      type: String,
      trim: true,
      default: "Home",
      maxlength: 40,
    },
    addressLine1: {
      type: String,
      required: [true, "Address line 1 is required"],
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
      default: "",
    },
    landmark: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      trim: true,
      match: [/^\d{6}$/, "Please enter a valid 6-digit pincode"],
    },
    // Populated via reverse geocoding (OpenStreetMap Nominatim) or the
    // browser's "use my location" — optional, but strongly encouraged:
    // without it, a volunteer can't be matched to this address by distance.
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

addressSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Address", addressSchema);
