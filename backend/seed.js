// 📁 seed.js
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import Product from "./models/product.model.js";
import dotenv from "dotenv";

dotenv.config();

console.log("Connecting to database:", process.env.DATABASE_URI);
await mongoose.connect(process.env.DATABASE_URI);

const catalog = {
  clothing: [
    "t-shirts",
    "hoodies",
    "shorts",
    "joggers",
    "leggings",
    "tank-tops",
    "jackets",
  ],
  shoes: ["running-shoes", "training-shoes", "lifestyle-shoes"],
  accessories: ["caps", "bags", "socks", "water-bottles", "gym-gloves"],
};

const departments = ["men", "women", "unisex"];
const brands = ["Gymshark", "Nike", "Adidas", "Under Armour", "Puma"];
const tags = [
  "new",
  "sale",
  "training",
  "running",
  "gym",
  "performance",
  "premium",
  "bestseller",
];

const imagePools = {
  clothing: [
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571242756303-c1517789c56f?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=600&auto=format&fit=crop",
  ],
  shoes: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop",
  ],
  accessories: [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=600&auto=format&fit=crop",
  ],
};

const products = [];

for (let i = 0; i < 100; i++) {
  const category = faker.helpers.arrayElement(Object.keys(catalog));
  const subCategory = faker.helpers.arrayElement(catalog[category]);
  const department = faker.helpers.arrayElement(departments);

  const adjective = faker.helpers.arrayElement([
    "Essential",
    "Performance",
    "Core",
    "Premium",
    "Elite",
    "Everyday",
    "Training",
    "Active",
  ]);

  const name = `${adjective} ${subCategory.replace(/-/g, " ")}`;

  // 🛠️ FIX: Generate a unique URL slug for the Mongoose schema requirements
  // Ensures strings are lowercase, spaces become dashes, and values stay distinct
  const baseSlug = name.toLowerCase().replace(/\s+/g, "-");
  const slug = `${baseSlug}-${faker.string.alphanumeric(5)}`;

  const currentCategoryPool = imagePools[category] || imagePools.clothing;
  const shuffledImages = faker.helpers.shuffle([...currentCategoryPool]);
  const numImages = faker.number.int({ min: 2, max: 4 });
  const selectedImages = shuffledImages.slice(0, numImages);

  products.push({
    name,
    slug, // 👈 Injected into payload securely
    description: faker.commerce.productDescription(),
    price: faker.number.int({ min: 499, max: 7999 }),
    images: selectedImages,
    department,
    category,
    subCategory,
    brand: faker.helpers.arrayElement(brands),
    stock: faker.number.int({ min: 0, max: 100 }),
    discount: faker.number.int({ min: 0, max: 50 }),
    rating: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
    numReviews: faker.number.int({ min: 0, max: 100 }),
    isFeatured: faker.datatype.boolean(),
    tags: faker.helpers.arrayElements(
      tags,
      faker.number.int({ min: 1, max: 4 }),
    ),
    isActive: true,
  });
}

try {
  console.log("🧹 Purging old data clusters from database...");
  await Product.deleteMany({});

  console.log("🚀 Injecting new contexts into matching models...");
  await Product.insertMany(products);

  console.log(
    "✅ Seeded 100 products with contextually matched high-res aesthetics!",
  );
} catch (error) {
  console.error("❌ Data injection pipeline halted:", error);
} finally {
  mongoose.connection.close();
  process.exit();
}
