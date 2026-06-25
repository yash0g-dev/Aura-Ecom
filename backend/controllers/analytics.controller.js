import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

export const getAnalyticData = async () => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null, //it groups all doucments together
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);
  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };
  //more analytics can be added later
  return {
    user: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
  };
};

export const dailySalesData = async (startDate, endDate) => {
  try {
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
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

    console.log(dateArray);

    return dateArray.map((date) => {
      const dateSales = dailySalesData.find((data) => data._id === date);
      return {
        date,
        sales: dateSales?.sales || 0,
        revenue: dateSales?.revenue || 0,
      };
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
//mongo db aggregation only returns the days order  were placed
function getDatesToRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
}
