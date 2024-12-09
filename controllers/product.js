import Product from "../models/Product.js";

export const listTransactions = async (req, res) => {
  const { month, year, search, page = 1, perPage = 10 } = req.query;

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  const query = {
    ...(month &&
      year && {
        dateOfSale: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      }),
    ...(search && {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { price: Number(search) },
      ],
    }),
  };

  try {
    const transactions = await Product.find(query)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));
    const total = await Product.countDocuments(query);
    res.status(200).json({ transactions, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getStatistics = async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ error: "Month is required" });
  }

  const monthNumber = parseInt(month, 10);

  if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return res.status(400).json({ error: "Invalid month" });
  }

  try {
    const dateQuery = {
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
    };

    // Total sold products
    const totalSold = await Product.countDocuments({
      ...dateQuery,
      isSold: true,
    });

    // Total not sold products
    const totalNotSold = await Product.countDocuments({
      ...dateQuery,
      isSold: false,
    });

    // Total sales amount for sold products
    const totalSales = await Product.aggregate([
      { $match: { ...dateQuery, isSold: true } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    res.status(200).json({
      totalSales: totalSales[0]?.total || 0,
      totalSold,
      totalNotSold,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getBarChart = async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ error: "Month is required" });
  }

  const monthNumber = parseInt(month, 10);

  if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return res.status(400).json({ error: "Invalid month" });
  }

  try {
    const dateQuery = {
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
    };

    const priceRanges = [
      { range: "0-100", min: 0, max: 100 },
      { range: "101-200", min: 101, max: 200 },
    ];

    const data = await Promise.all(
      priceRanges.map(async ({ range, min, max }) => {
        const count = await Product.countDocuments({
          ...dateQuery,
          price: { $gte: min, $lte: max },
        });
        return { range, count };
      })
    );

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getPieChart = async (req, res) => {
  const { month } = req.query;
  const query = { dateOfSale: { $regex: `-${month}-`, $options: "i" } };

  try {
    const data = await Product.aggregate([
      { $match: query },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
