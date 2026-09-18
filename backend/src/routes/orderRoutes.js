const { Router } = require("express");
const { body } = require("express-validator");
const {
  createOrder,
  listMyOrders,
  listAvailableOrders,
  listMyAssignedOrders,
  getOrder,
  acceptOrder,
  updateOrderStatus,
  updateLiveLocation,
  cancelOrder,
} = require("../controllers/orderController");
const { listMessages, sendMessage } = require("../controllers/messageController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  requireRole("elder"),
  [body("addressId").notEmpty().withMessage("Please choose a delivery address.")],
  createOrder
);

router.get("/", requireRole("elder"), listMyOrders);

// Specific routes must come before the /:id catch-all.
router.get("/available", requireRole("volunteer"), listAvailableOrders);
router.get("/mine", requireRole("volunteer"), listMyAssignedOrders);
router.get("/:id", getOrder);
router.post("/:id/accept", requireRole("volunteer"), acceptOrder);
router.patch(
  "/:id/status",
  requireRole("volunteer"),
  [body("status").notEmpty().withMessage("Missing status.")],
  updateOrderStatus
);
router.patch(
  "/:id/location",
  requireRole("volunteer"),
  [body("lat").isFloat().withMessage("Missing latitude."), body("lng").isFloat().withMessage("Missing longitude.")],
  updateLiveLocation
);
router.post("/:id/cancel", requireRole("elder"), cancelOrder);

router.get("/:id/messages", listMessages);
router.post(
  "/:id/messages",
  [body("body").trim().notEmpty().withMessage("Message can't be empty.").isLength({ max: 1000 })],
  sendMessage
);

module.exports = router;
