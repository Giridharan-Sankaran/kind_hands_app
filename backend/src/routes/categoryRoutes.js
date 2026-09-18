const { Router } = require("express");
const { listCategories } = require("../controllers/productController");
const { requireAuth } = require("../middleware/auth");

const router = Router();

router.get("/", requireAuth, listCategories);

module.exports = router;
