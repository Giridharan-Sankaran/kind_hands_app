const mongoose = require("mongoose");

// Full addresses and emergency contacts live in their own collections
// (Address, EmergencyContact) since they're managed independently.
const elderProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    preferredLanguage: {
      type: String,
      enum: ["en", "hi", "ta"],
      default: "en",
    },
    favoriteShops: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Shop" }],
      default: [],
    },
  },
  { timestamps: true }
);

elderProfileSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("ElderProfile", elderProfileSchema);
