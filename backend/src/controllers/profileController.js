const ElderProfile = require("../models/ElderProfile");
const VolunteerProfile = require("../models/VolunteerProfile");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// GET /api/profile
const getMyProfile = asyncHandler(async (req, res) => {
  const { role, id } = req.user;

  let roleProfile = null;
  if (role === "elder") {
    roleProfile = await ElderProfile.findOne({ user: id });
  } else if (role === "volunteer") {
    roleProfile = await VolunteerProfile.findOne({ user: id });
  }

  if ((role === "elder" || role === "volunteer") && !roleProfile) {
    throw new ApiError(404, "We couldn't find your profile. Please contact support.");
  }

  res.json({ success: true, user: req.user, profile: roleProfile });
});

// PATCH /api/profile
// Updates only the fields that belong to the caller's own role profile —
// the target document is looked up by req.user.id, not a body param, so
// an elder can never touch volunteer-only fields or anyone else's data.
const updateMyProfile = asyncHandler(async (req, res) => {
  const { role, id } = req.user;

  if (role === "elder") {
    const { preferredLanguage } = req.body;
    if (preferredLanguage && !["en", "hi", "ta"].includes(preferredLanguage)) {
      throw new ApiError(400, "Please choose a supported language.");
    }
    const profile = await ElderProfile.findOneAndUpdate(
      { user: id },
      { ...(preferredLanguage && { preferredLanguage }) },
      { new: true }
    );
    return res.json({ success: true, profile });
  }

  if (role === "volunteer") {
    const { maxDistanceKm, isAvailable, currentLocation } = req.body;
    if (maxDistanceKm !== undefined && ![5, 10, 15, 20].includes(Number(maxDistanceKm))) {
      throw new ApiError(400, "Please choose a valid maximum distance.");
    }
    const update = {};
    if (maxDistanceKm !== undefined) update.maxDistanceKm = Number(maxDistanceKm);
    if (isAvailable !== undefined) update.isAvailable = Boolean(isAvailable);
    if (
      currentLocation &&
      typeof currentLocation.lat === "number" &&
      typeof currentLocation.lng === "number"
    ) {
      update.currentLocation = { lat: currentLocation.lat, lng: currentLocation.lng, updatedAt: new Date() };
    }

    const profile = await VolunteerProfile.findOneAndUpdate({ user: id }, update, { new: true });
    return res.json({ success: true, profile });
  }

  throw new ApiError(400, "This account type doesn't have an editable profile here.");
});

module.exports = { getMyProfile, updateMyProfile };
