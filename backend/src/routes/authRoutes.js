const { Router } = require("express");
const { body } = require("express-validator");
const { register, login, me } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const { authRateLimiter } = require("../middleware/rateLimiter");

const router = Router();

router.use(authRateLimiter);

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Please enter your name."),
    body("email").isEmail().withMessage("Please enter a valid email address.").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
    body("role").isIn(["elder", "volunteer"]).withMessage("Please select a role."),
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email address.").normalizeEmail(),
    body("password").notEmpty().withMessage("Please enter your password."),
  ],
  login
);

router.get("/me", requireAuth, me);

module.exports = router;
