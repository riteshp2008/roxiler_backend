import express from "express";
import {
  listTransactions,
  getBarChart,
  getPieChart,
  getStatistics,
} from "../controllers/product.js";

const router = express.Router();

router.get("/transactions", listTransactions);

router.get("/barchart", getBarChart);

router.get("/piechart", getPieChart);

router.get("/statistics", getStatistics);

export default router;
