const mongoose = require("mongoose");

const volunteerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    maxDistanceKm: {
      type: Number,
      enum: [5, 10, 15, 20],
      default: 10,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    // Set from the browser's Geolocation API (device GPS/Wi-Fi — no
    // server-side maps key needed) whenever the volunteer updates their
    // location. Used for haversine distance matching in the marketplace.
    currentLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date, default: null },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    completedDeliveries: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

volunteerProfileSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("VolunteerProfile", volunteerProfileSchema);
