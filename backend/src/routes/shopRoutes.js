const { Router } = require("express");
const {
  listShops,
  getShop,
  listFavoriteShops,
  toggleFavoriteShop,
  listRecentShops,
} = require("../controllers/shopController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = Router();

router.use(requireAuth);

// Specific routes must come before the /:id catch-all.
router.get("/favorites", requireRole("elder"), listFavoriteShops);
router.get("/recent", requireRole("elder"), listRecentShops);
router.get("/", listShops);
router.get("/:id", getShop);
router.post("/:id/favorite", requireRole("elder"), toggleFavoriteShop);

module.exports = router;
