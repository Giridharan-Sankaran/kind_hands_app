const Order = require("../models/Order");
const Message = require("../models/Message");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { assertOrderAccess } = require("../utils/orderAccess");

// GET /api/orders/:id/messages
const listMessages = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  assertOrderAccess(order, req.user);

  const messages = await Message.find({ order: order._id }).sort({ createdAt: 1 });
  res.json({ success: true, messages });
});

// POST /api/orders/:id/messages   { body }
// Messaging only opens once a volunteer has accepted — there's no one on
// the other end to message before that.
const sendMessage = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  const { isOwnerElder, isAssignedVolunteer } = assertOrderAccess(order, req.user);

  const body = (req.body.body || "").trim();
  if (!body) {
    throw new ApiError(400, "Message can't be empty.");
  }
  if (!order.volunteer) {
    throw new ApiError(400, "Messaging opens once a volunteer accepts this order.");
  }

  const senderRole = isOwnerElder ? "elder" : isAssignedVolunteer ? "volunteer" : "system";
  const message = await Message.create({ order: order._id, sender: req.user.id, senderRole, body });
  res.status(201).json({ success: true, message });
});

module.exports = { listMessages, sendMessage };
