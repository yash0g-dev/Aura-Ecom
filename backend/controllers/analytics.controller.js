import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

// 1. Enhanced Core Analytics Compiler
export const getAnalyticData = async () => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);

  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };

  // Essential Metric Injection: Average Order Value (AOV)
  const averageOrderValue =
    totalSales > 0 ? Number((totalRevenue / totalSales).toFixed(2)) : 0;

  return {
    user: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
    averageOrderValue, // Packed cleanly for frontend cards
  };
};

// 2. Optimized Daily Performance Metrics
export const dailySalesData = async (startDate, endDate) => {
  try {
    const dailyData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dateArray = getDatesToRange(startDate, endDate);

    return dateArray.map((date) => {
      const dateSales = dailyData.find((data) => data._id === date);
      return {
        date,
        sales: dateSales?.sales || 0,
        revenue: dateSales?.revenue || 0,
      };
    });
  } catch (error) {
    console.error("Aggregation engine error:", error);
    throw error;
  }
};

// 3. Robust Date Array Generator
function getDatesToRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  const targetEndDate = new Date(endDate);

  while (currentDate <= targetEndDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates; // 🔥 FIXED: Returns the completed timeline array safely
}
