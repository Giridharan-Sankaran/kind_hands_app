const Category = require("../models/Category");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// GET /api/categories
const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
  res.json({ success: true, categories });
});

// GET /api/products?category=<id>&search=<text>&frequentlyOrdered=true&page=1&limit=24
const listProducts = asyncHandler(async (req, res) => {
  const { category, search, frequentlyOrdered } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(60, Math.max(1, parseInt(req.query.limit, 10) || 24));

  const filter = { isAvailable: true };
  if (category) filter.category = category;
  if (frequentlyOrdered === "true") filter.isFrequentlyOrdered = true;
  if (search) {
    // Case-insensitive partial match, so an elder typing "ric" still finds "Rice".
    filter.name = { $regex: search.trim(), $options: "i" };
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug icon")
      .sort({ popularity: -1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name slug icon");
  if (!product) {
    throw new ApiError(404, "We couldn't find that product.");
  }
  res.json({ success: true, product });
});

module.exports = { listCategories, listProducts, getProduct };
