const { Router } = require("express");
const { listProducts, getProduct } = require("../controllers/productController");
const { requireAuth } = require("../middleware/auth");

const router = Router();

router.get("/", requireAuth, listProducts);
router.get("/:id", requireAuth, getProduct);

module.exports = router;
