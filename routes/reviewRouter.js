import express from "express";
import { createReview, deleteReview, getAllReviews, updateReview } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.get("/", getAllReviews);
reviewRouter.post("/", createReview);
reviewRouter.put("/:id", updateReview);
reviewRouter.delete("/:id", deleteReview);
export default reviewRouter;
