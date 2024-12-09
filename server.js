import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import seedRouter from "./routes/seed.js";
import connectDB from "./config/db.js";

dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/seed", seedRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
