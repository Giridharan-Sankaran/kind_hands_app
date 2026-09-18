const { validationResult } = require("express-validator");
const EmergencyContact = require("../models/EmergencyContact");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

function throwIfInvalid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }
}

const listContacts = asyncHandler(async (req, res) => {
  const contacts = await EmergencyContact.find({ user: req.user.id }).sort({ isPrimary: -1, createdAt: -1 });
  res.json({ success: true, contacts });
});

const createContact = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const { name, relationship, phone, isPrimary } = req.body;

  if (isPrimary) {
    await EmergencyContact.updateMany({ user: req.user.id }, { isPrimary: false });
  }

  const existingCount = await EmergencyContact.countDocuments({ user: req.user.id });
  const contact = await EmergencyContact.create({
    user: req.user.id,
    name,
    relationship,
    phone,
    isPrimary: isPrimary || existingCount === 0,
  });

  res.status(201).json({ success: true, contact });
});

const updateContact = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const contact = await EmergencyContact.findOne({ _id: req.params.id, user: req.user.id });
  if (!contact) {
    throw new ApiError(404, "We couldn't find that contact.");
  }

  ["name", "relationship", "phone"].forEach((field) => {
    if (req.body[field] !== undefined) contact[field] = req.body[field];
  });

  if (req.body.isPrimary) {
    await EmergencyContact.updateMany({ user: req.user.id }, { isPrimary: false });
    contact.isPrimary = true;
  }

  await contact.save();
  res.json({ success: true, contact });
});

const deleteContact = asyncHandler(async (req, res) => {
  const contact = await EmergencyContact.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!contact) {
    throw new ApiError(404, "We couldn't find that contact.");
  }
  res.json({ success: true });
});

module.exports = { listContacts, createContact, updateContact, deleteContact };
