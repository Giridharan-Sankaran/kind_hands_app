const { validationResult } = require("express-validator");
const User = require("../models/User");
const ElderProfile = require("../models/ElderProfile");
const VolunteerProfile = require("../models/VolunteerProfile");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const generateToken = require("../utils/generateToken");

function throwIfInvalid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }
}

// POST /api/auth/register
// Public registration only allows elder/volunteer accounts — admin
// accounts are provisioned separately, never through the public API.
const register = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const { name, email, password, role, phone } = req.body;

  if (!["elder", "volunteer"].includes(role)) {
    throw new ApiError(400, "Please select whether you're registering as an elder or a volunteer.");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const user = await User.create({ name, email, password, role, phone });

  if (role === "elder") {
    await ElderProfile.create({ user: user._id });
  } else {
    await VolunteerProfile.create({ user: user._id });
  }

  const token = generateToken(user._id);
  res.status(201).json({ success: true, token, user });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  const valid = user && (await user.comparePassword(password));

  if (!valid || !user.isActive) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const token = generateToken(user._id);
  user.password = undefined;
  res.json({ success: true, token, user });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = { register, login, me };
