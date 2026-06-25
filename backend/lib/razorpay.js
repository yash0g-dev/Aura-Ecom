import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const razorpay_id = process.env.RAZORPAY_KEY_ID;
const razorpay_secret = process.env.RAZORPAY_KEY_SECRET;

export const razorpay = new Razorpay({
  key_id: razorpay_id,
  key_secret: razorpay_secret,
});
