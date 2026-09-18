const { Router } = require("express");
const { getMyProfile, updateMyProfile } = require("../controllers/profileController");
const { requireAuth } = require("../middleware/auth");

const router = Router();

router.get("/", requireAuth, getMyProfile);
router.patch("/", requireAuth, updateMyProfile);

module.exports = router;
