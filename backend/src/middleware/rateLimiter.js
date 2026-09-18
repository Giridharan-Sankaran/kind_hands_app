const rateLimit = require("express-rate-limit");

// Applied to /api/auth/* only. Generous enough for normal use, tight enough
// to slow down credential-stuffing / brute-force attempts against login.
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please wait a few minutes and try again.",
  },
});

module.exports = { authRateLimiter };
