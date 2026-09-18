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
    body("productId").notEmpty().withMessage("Missing product."),
    body("quantity").isInt({ min: 1, max: 99 }).withMessage("Quantity must be between 1 and 99."),
    body("note").optional().isString().isLength({ max: 200 }).withMessage("Note is too long."),
  ],
  addItem
);

router.patch(
  "/items/:productId",
  [
    body("quantity").optional().isInt({ min: 0, max: 99 }).withMessage("Quantity must be between 0 and 99."),
    body("note").optional().isString().isLength({ max: 200 }).withMessage("Note is too long."),
  ],
  updateItem
);

router.delete("/items/:productId", removeItem);
router.delete("/", clearCart);

module.exports = router;
