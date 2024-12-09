import express from "express";
import { seed, destroy } from "../controllers/seed.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    await seed();
    res.send("Products seeded successfully!");
  } catch (error) {
    res.status(500).send("Error seeding products");
  }
});

router.delete("/", async (req, res) => {
  try {
    await destroy();
    res.send("Products destroyed successfully!");
  } catch (error) {
    res.status(500).send("Error destroying products");
  }
});

export default router;
