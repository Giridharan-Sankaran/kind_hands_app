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

const addressValidation = [
  body("addressLine1").trim().notEmpty().withMessage("Please enter the address."),
  body("city").trim().notEmpty().withMessage("Please enter the city."),
  body("state").trim().notEmpty().withMessage("Please enter the state."),
  body("pincode").matches(/^\d{6}$/).withMessage("Please enter a valid 6-digit pincode."),
];

router.get("/", listAddresses);
router.post("/", addressValidation, createAddress);
router.put("/:id", addressValidation, updateAddress);
router.patch("/:id/default", setDefaultAddress);
router.delete("/:id", deleteAddress);

module.exports = router;
