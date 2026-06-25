export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];

  department: "men" | "women" | "unisex" | string;
  category: "clothing" | "shoes" | "accessories" | string;
  subCategory: string;
  brand: string;
  stock: number;

  discount?: number;
  rating?: number;
  numReviews?: number;
  isFeatured?: boolean;
  tags?: string[];
  isActive?: boolean;

  createdAt?: string;
  updatedAt?: string;
}
