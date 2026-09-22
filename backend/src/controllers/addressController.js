const { validationResult } = require("express-validator");
const Address = require("../models/Address");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

function throwIfInvalid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }
}

const listAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
  res.json({ success: true, addresses });
});

const createAddress = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const { label, addressLine1, addressLine2, landmark, city, state, pincode, isDefault, location } = req.body;

  if (isDefault) {
    await Address.updateMany({ user: req.user.id }, { isDefault: false });
  }

  const existingCount = await Address.countDocuments({ user: req.user.id });
  const address = await Address.create({
    user: req.user.id,
    label,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    pincode,
    ...(location && typeof location.lat === "number" && typeof location.lng === "number" && { location }),
    isDefault: isDefault || existingCount === 0,
  });

  res.status(201).json({ success: true, address });
});

const updateAddress = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
  if (!address) {
    throw new ApiError(404, "We couldn't find that address.");
  }

  const fields = ["label", "addressLine1", "addressLine2", "landmark", "city", "state", "pincode"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) address[field] = req.body[field];
  });

  if (req.body.location && typeof req.body.location.lat === "number" && typeof req.body.location.lng === "number") {
    address.location = req.body.location;
  }

  if (req.body.isDefault) {
    await Address.updateMany({ user: req.user.id }, { isDefault: false });
    address.isDefault = true;
  }

  await address.save();
  res.json({ success: true, address });
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
  if (!address) {
    throw new ApiError(404, "We couldn't find that address.");
  }
  await Address.updateMany({ user: req.user.id }, { isDefault: false });
  address.isDefault = true;
  await address.save();
  res.json({ success: true, address });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!address) {
    throw new ApiError(404, "We couldn't find that address.");
  }

  if (address.isDefault) {
    const next = await Address.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }

  res.json({ success: true });
});

module.exports = { listAddresses, createAddress, updateAddress, setDefaultAddress, deleteAddress };
