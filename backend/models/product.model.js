import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
      max: [1000000, "Price is too large"],
      validate: {
        validator: Number.isFinite,
        message: "Price must be a valid number",
      },
      required: true,
    },
    images: {
      type: [String],
      required: true,
      validate: [
        {
          validator: (arr) => arr.length > 0,
          message: "At least one image is required",
        },
        {
          validator: (arr) =>
            arr.every((url) => {
              try {
                const parsed = new URL(url);
                return ["http:", "https:"].includes(parsed.protocol);
              } catch {
                return false;
              }
            }),
          message: "One or more image URLs are invalid",
        },
      ],
    },
    department: {
      type: String,
      required: true,
      enum: ["men", "women", "unisex"],
      index: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["clothing", "shoes", "accessories"],
      index: true,
    },

    subCategory: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      min: [0, "Stock cannot be negative"],
      max: [100, "Stock is too large"],
    },
    discount: {
      type: Number,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount is too large"],
    },
    rating: {
      type: Number,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating is too large"],
    },
    numReviews: {
      type: Number,
      min: [0, "Number of reviews cannot be negative"],
      max: [100, "Number of reviews is too large"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);
// compound index fast + sort
productSchema.index({ department: 1, category: 1, subCategory: 1 });
productSchema.index({ category: 1, price: 1 });
// text index fast search by name
productSchema.index({ name: "text", description: "text" });

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
productSchema.pre("save", async function () {
  if (!this.isModified("name") && this.slug) return;

  const baseSlug = slugify(this.name);

  const regex = new RegExp(`^${baseSlug}(-\\d+)?$`, "i");

  const existing = await mongoose.models.Product.find({ slug: regex });

  if (existing.length === 0) {
    this.slug = baseSlug;
  } else {
    const slugs = existing.map((p) => p.slug);

    const numbers = slugs.map((s) => {
      const match = s.match(/-(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    });

    const max = Math.max(...numbers);

    this.slug = `${baseSlug}-${max + 1}`;
  }
});
const Product = mongoose.model("Product", productSchema);
export default Product;
