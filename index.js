import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import jwt from "jsonwebtoken";
import productRouter from "./routes/productRouter.js";
import verifyJWT from "./middleware/auth.js";
import orderRouter from "./routes/orderRouter.js";
import dotenv from "dotenv";
import cors from "cors";
import reviewRouter from "./routes/reviewRouter.js";
dotenv.config();

const app = express();

app.use(cors());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to the Database");
  })
  .catch(() => {
    console.error("Connection failed");
  });

app.use(bodyParser.json());
app.use(verifyJWT);

app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/order",orderRouter);
app.use("/api/review", reviewRouter);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
