const { Router } = require("express");
const { body } = require("express-validator");
const {
  listAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} = require("../controllers/addressController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = Router();

router.use(requireAuth, requireRole("elder"));

// Creation requires the full address. Updates allow partial bodies — the
// controller only touches fields actually present, which is what lets the
// "pin my current location" quick-action send just { location } without
// having to resend the whole address.
const createValidation = [
  body("addressLine1").trim().notEmpty().withMessage("Please enter the address."),
  body("city").trim().notEmpty().withMessage("Please enter the city."),
  body("state").trim().notEmpty().withMessage("Please enter the state."),
  body("pincode").matches(/^\d{6}$/).withMessage("Please enter a valid 6-digit pincode."),
];

const updateValidation = [
  body("addressLine1").optional().trim().notEmpty().withMessage("Please enter the address."),
  body("city").optional().trim().notEmpty().withMessage("Please enter the city."),
  body("state").optional().trim().notEmpty().withMessage("Please enter the state."),
  body("pincode").optional().matches(/^\d{6}$/).withMessage("Please enter a valid 6-digit pincode."),
];

router.get("/", listAddresses);
router.post("/", createValidation, createAddress);
router.put("/:id", updateValidation, updateAddress);
router.patch("/:id/default", setDefaultAddress);
router.delete("/:id", deleteAddress);

module.exports = router;
