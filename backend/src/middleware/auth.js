const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

// Verifies the JWT from the Authorization header and attaches the current
// user to req.user. Never trusts a role or id sent by the client directly.
const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, "You need to be logged in to do that.");
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, "Your session has expired. Please log in again.");
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw new ApiError(401, "Your session is no longer valid. Please log in again.");
  }

  req.user = user;
  next();
});

// Usage: requireRole("admin") or requireRole("elder", "volunteer")
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "You don't have permission to do that."));
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
