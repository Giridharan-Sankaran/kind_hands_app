// Populates Category, Product, and Shop collections with realistic
// starter data for elderly users in India. Safe to re-run — it clears
// and re-inserts all three collections. Product photography and rich
// descriptions get layered on via the admin dashboard (Phase 11); this
// seed exists so the app isn't empty in the meantime.
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Shop = require("../models/Shop");

// Fictional demo shops with real public city-center coordinates, so
// distance matching has something real to compute against. Names,
// addresses, and phone numbers are illustrative placeholders, not real
// businesses — replace with verified partner data before going live.
const SHOPS = [
  { name: "Sri Ganesh Kirana Store", city: "Bengaluru", state: "Karnataka", type: "Kirana store", lat: 12.9716, lng: 77.5946 },
  { name: "Green Valley Supermarket", city: "Bengaluru", state: "Karnataka", type: "Supermarket", lat: 12.9784, lng: 77.6408 },
  { name: "Koramangala Family Store", city: "Bengaluru", state: "Karnataka", type: "Grocery store", lat: 12.9352, lng: 77.6245 },
  { name: "Chennai Departmental Stores", city: "Chennai", state: "Tamil Nadu", type: "Departmental store", lat: 13.0827, lng: 80.2707 },
  { name: "Amma Grocery Mart", city: "Chennai", state: "Tamil Nadu", type: "Kirana store", lat: 13.0569, lng: 80.2425 },
  { name: "Andheri Super Bazaar", city: "Mumbai", state: "Maharashtra", type: "Supermarket", lat: 19.1197, lng: 72.8468 },
  { name: "Everyday Grocery Store", city: "Mumbai", state: "Maharashtra", type: "Grocery store", lat: 19.076, lng: 72.8777 },
  { name: "Delhi Fresh Mart", city: "New Delhi", state: "Delhi", type: "Grocery store", lat: 28.6139, lng: 77.209 },
].map((s, i) => ({
  name: s.name,
  city: s.city,
  state: s.state,
  type: s.type,
  address: `${100 + i}, Main Market Road`,
  pincode: `5600${10 + i}`,
  phone: `+91 90000 000${String(i + 1).padStart(2, "0")}`,
  openingHours: "7:00 AM - 10:00 PM",
  location: { lat: s.lat, lng: s.lng },
}));

const CATALOG = [
  {
    name: "Rice & Grains",
    slug: "rice-grains",
    items: [
      ["Basmati Rice", "1 kg", 120, { frequentlyOrdered: true, tags: ["staple", "no-refrigeration"] }],
      ["Sona Masoori Rice", "5 kg", 340, { tags: ["staple", "no-refrigeration"] }],
      ["Idli Rice", "1 kg", 65],
      ["Poha (Flattened Rice)", "500 g", 45],
      ["Suji / Rava (Semolina)", "500 g", 40],
      ["Broken Wheat (Dalia)", "500 g", 50],
      ["Puffed Rice (Murmura)", "200 g", 30],
    ],
  },
  {
    name: "Dal & Pulses",
    slug: "dal-pulses",
    items: [
      ["Toor Dal (Arhar)", "1 kg", 160, { frequentlyOrdered: true, tags: ["staple"] }],
      ["Moong Dal", "1 kg", 140, { tags: ["staple"] }],
      ["Chana Dal", "1 kg", 110],
      ["Masoor Dal", "1 kg", 120],
      ["Urad Dal", "1 kg", 150],
      ["Rajma (Kidney Beans)", "500 g", 90],
      ["Kabuli Chana (Chickpeas)", "500 g", 80],
    ],
  },
  {
    name: "Flour & Atta",
    slug: "flour",
    items: [
      ["Wheat Atta", "5 kg", 250, { frequentlyOrdered: true, tags: ["staple"] }],
      ["Maida (Refined Flour)", "1 kg", 55],
      ["Besan (Gram Flour)", "500 g", 60],
      ["Rice Flour", "500 g", 45],
      ["Multigrain Atta", "5 kg", 320],
    ],
  },
  {
    name: "Cooking Oil & Ghee",
    slug: "cooking-oil",
    items: [
      ["Sunflower Oil", "1 L", 150, { frequentlyOrdered: true, tags: ["staple"] }],
      ["Groundnut Oil", "1 L", 190],
      ["Mustard Oil", "1 L", 170],
      ["Pure Ghee", "500 ml", 320],
      ["Coconut Oil", "500 ml", 140],
      ["Olive Oil", "500 ml", 450],
    ],
  },
  {
    name: "Spices & Masalas",
    slug: "spices",
    items: [
      ["Turmeric Powder", "200 g", 45],
      ["Red Chilli Powder", "200 g", 55],
      ["Coriander Powder", "200 g", 40],
      ["Garam Masala", "100 g", 65],
      ["Cumin Seeds (Jeera)", "200 g", 80],
      ["Mustard Seeds", "200 g", 35],
      ["Black Pepper", "100 g", 90],
      ["Salt (Iodised)", "1 kg", 22, { frequentlyOrdered: true, tags: ["staple", "no-refrigeration"] }],
      ["Sugar", "1 kg", 48, { frequentlyOrdered: true, tags: ["staple", "no-refrigeration"] }],
    ],
  },
  {
    name: "Vegetables",
    slug: "vegetables",
    items: [
      ["Potato", "1 kg", 28, { frequentlyOrdered: true, tags: ["staple"] }],
      ["Onion", "1 kg", 35, { frequentlyOrdered: true, tags: ["staple"] }],
      ["Tomato", "1 kg", 40, { frequentlyOrdered: true }],
      ["Carrot", "500 g", 30],
      ["Cauliflower", "1 pc", 35],
      ["Spinach (Palak)", "250 g", 20],
      ["Brinjal (Eggplant)", "500 g", 25],
      ["Cucumber", "500 g", 20],
      ["Green Beans", "500 g", 35],
      ["Ladies Finger (Bhindi)", "500 g", 30],
    ],
  },
  {
    name: "Fruits",
    slug: "fruits",
    items: [
      ["Banana", "1 dozen", 55, { frequentlyOrdered: true, tags: ["easy-to-carry"] }],
      ["Apple", "1 kg", 180],
      ["Orange", "1 kg", 90],
      ["Papaya", "1 pc", 40],
      ["Grapes", "500 g", 60],
      ["Pomegranate", "1 kg", 150],
      ["Guava", "500 g", 40],
      ["Mango (seasonal)", "1 kg", 120],
    ],
  },
  {
    name: "Dairy & Eggs",
    slug: "dairy",
    items: [
      ["Milk (Toned)", "1 L", 58, { frequentlyOrdered: true, tags: ["staple"] }],
      ["Curd / Yogurt", "400 g", 45, { frequentlyOrdered: true }],
      ["Paneer", "200 g", 90],
      ["Butter", "100 g", 55],
      ["Cheese Slices", "200 g", 120],
      ["Eggs", "6 pcs", 42, { frequentlyOrdered: true }],
      ["Buttermilk", "500 ml", 25],
    ],
  },
  {
    name: "Bread & Bakery",
    slug: "bakery",
    items: [
      ["White Bread", "400 g", 40, { frequentlyOrdered: true }],
      ["Brown Bread", "400 g", 50],
      ["Rusk", "200 g", 40],
      ["Biscuits (Marie)", "200 g", 30, { frequentlyOrdered: true }],
      ["Bun / Pav", "6 pcs", 35],
    ],
  },
  {
    name: "Packaged & Instant Food",
    slug: "packaged-food",
    items: [
      ["Instant Noodles (4-pack)", "280 g", 56],
      ["Instant Poha Mix", "200 g", 60],
      ["Papad", "200 g", 50],
      ["Pickle (Mango)", "400 g", 85],
      ["Ready-to-eat Khichdi", "300 g", 90, { tags: ["easy-to-cook"] }],
      ["Cornflakes", "500 g", 180],
    ],
  },
  {
    name: "Beverages",
    slug: "beverages",
    items: [
      ["Tea Powder", "250 g", 120, { frequentlyOrdered: true, tags: ["staple"] }],
      ["Coffee Powder", "200 g", 150],
      ["Fruit Juice", "1 L", 110],
      ["Bottled Water", "1 L", 20],
      ["Soft Drink", "750 ml", 45],
      ["Health Drink Powder", "500 g", 220],
    ],
  },
  {
    name: "Household Cleaning",
    slug: "household-cleaning",
    items: [
      ["Detergent Powder", "1 kg", 110, { frequentlyOrdered: true }],
      ["Dish Wash Liquid", "500 ml", 90],
      ["Floor Cleaner", "1 L", 105],
      ["Toilet Cleaner", "500 ml", 85],
      ["Broom", "1 pc", 90],
      ["Scrub Pad (3 pcs)", "3 pcs", 40],
      ["Garbage Bags (30 pcs)", "30 pcs", 95],
    ],
  },
  {
    name: "Personal Care & Toiletries",
    slug: "personal-care",
    items: [
      ["Bathing Soap", "100 g", 40, { frequentlyOrdered: true }],
      ["Toothpaste", "150 g", 95, { frequentlyOrdered: true }],
      ["Toothbrush (Soft)", "1 pc", 35],
      ["Shampoo", "340 ml", 210],
      ["Hair Oil", "200 ml", 90],
      ["Talcum Powder", "400 g", 120],
      ["Hand Sanitizer", "200 ml", 75],
      ["Adult Diapers (10 pcs)", "10 pcs", 450, { tags: ["elder-essential"] }],
    ],
  },
  {
    name: "Kitchen Supplies",
    slug: "kitchen-supplies",
    items: [
      ["Aluminium Foil", "9 m", 95],
      ["Cling Wrap", "15 m", 85],
      ["Matchbox", "1 pc", 2],
      ["Candles (6 pcs)", "6 pcs", 40],
      ["Trash Can Liner (20 pcs)", "20 pcs", 60],
      ["LPG Lighter", "1 pc", 60],
    ],
  },
];

async function seed() {
  await connectDB();

  console.log("Clearing existing categories, products, and shops...");
  await Promise.all([Category.deleteMany({}), Product.deleteMany({}), Shop.deleteMany({})]);

  for (let i = 0; i < CATALOG.length; i += 1) {
    const { name, slug, items } = CATALOG[i];
    const category = await Category.create({ name, slug, displayOrder: i });

    const products = items.map(([itemName, unit, price, extra = {}], index) => ({
      name: itemName,
      category: category._id,
      unit,
      price,
      isFrequentlyOrdered: Boolean(extra.frequentlyOrdered),
      elderFriendlyTags: extra.tags || [],
      // Front-of-catalog items get a higher popularity score so they sort
      // to the top of their category by default.
      popularity: extra.frequentlyOrdered ? 90 - index : 50 - index,
    }));

    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products in "${name}"`);
  }

  await Shop.insertMany(SHOPS);
  console.log(`Seeded ${SHOPS.length} shops`);

  const totalCategories = await Category.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalShops = await Shop.countDocuments();
  console.log(`Done: ${totalCategories} categories, ${totalProducts} products, ${totalShops} shops.`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
