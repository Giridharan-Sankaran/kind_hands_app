const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    senderRole: {
      type: String,
      enum: ["elder", "volunteer", "system"],
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

messageSchema.index({ order: 1, createdAt: 1 });

messageSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Message", messageSchema);
