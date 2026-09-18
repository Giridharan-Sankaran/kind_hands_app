const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Contact name is required"],
      trim: true,
    },
    relationship: {
      type: String,
      trim: true,
      default: "",
      maxlength: 40,
    },
    phone: {
      type: String,
      required: [true, "Contact phone number is required"],
      trim: true,
      match: [/^[+]?[\d\s-]{7,15}$/, "Please enter a valid phone number"],
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

emergencyContactSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("EmergencyContact", emergencyContactSchema);
