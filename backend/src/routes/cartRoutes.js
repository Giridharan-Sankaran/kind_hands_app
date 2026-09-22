const { Router } = require("express");
const { body } = require("express-validator");
const { getCart, addItem, updateItem, removeItem, clearCart } = require("../controllers/cartController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = Router();

router.use(requireAuth, requireRole("elder"));

router.get("/", getCart);

router.post(
  "/items",
  [
    body("quantity").optional().isInt({ min: 1, max: 99 }).withMessage("Quantity must be between 1 and 99."),
    body("note").optional().isString().isLength({ max: 200 }).withMessage("Note is too long."),
    body("customName").optional().isString().isLength({ max: 120 }).withMessage("Item name is too long."),
    body("customUnit").optional().isString().isLength({ max: 40 }).withMessage("Amount is too long."),
    body().custom((value) => {
      if (!value.productId && !value.customName) {
        throw new Error("Please provide a product or a custom item name.");
      }
      if (value.productId && !value.quantity) {
        throw new Error("Quantity is required.");
      }
      return true;
    }),
  ],
  addItem
);

router.patch(
  "/items/:itemId",
  [
    body("quantity").optional().isInt({ min: 0, max: 99 }).withMessage("Quantity must be between 0 and 99."),
    body("note").optional().isString().isLength({ max: 200 }).withMessage("Note is too long."),
  ],
  updateItem
);

router.delete("/items/:itemId", removeItem);
router.delete("/", clearCart);

module.exports = router;
