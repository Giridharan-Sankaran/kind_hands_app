const { Router } = require("express");
const { body } = require("express-validator");
const {
  listContacts,
  createContact,
  updateContact,
  deleteContact,
} = require("../controllers/emergencyContactController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = Router();

router.use(requireAuth, requireRole("elder"));

const contactValidation = [
  body("name").trim().notEmpty().withMessage("Please enter the contact's name."),
  body("phone")
    .trim()
    .matches(/^[+]?[\d\s-]{7,15}$/)
    .withMessage("Please enter a valid phone number."),
];

router.get("/", listContacts);
router.post("/", contactValidation, createContact);
router.put("/:id", contactValidation, updateContact);
router.delete("/:id", deleteContact);

module.exports = router;
