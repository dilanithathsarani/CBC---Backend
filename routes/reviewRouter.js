import express from "express";
import { createReview, getAllReviews } from "../controllers/reviewController";

const reviewRouter = express.Router();

reviewRouter.get("/", getAllReviews);
reviewRouter.post("/", createReview);
export default reviewRouter;
