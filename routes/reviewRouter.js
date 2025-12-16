import express from "express";
import { createReview, getAllReviews } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.get("/", getAllReviews);
reviewRouter.post("/", createReview);
export default reviewRouter;
