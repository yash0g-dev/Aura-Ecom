export interface IOrderProduct {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
  selectedSize: string;
}

export interface IOrderAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

export interface IOrder {
  _id: string;
  products: IOrderProduct[];
  shippingAddress: IOrderAddress;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  shippingFee: number;
  totalAmount: number;
  status:
    | "processing"
    | "shipped"
    | "out-for-delivery"
    | "delivered"
    | "cancelled";
  createdAt: string;
  updatedAt: string;
}
