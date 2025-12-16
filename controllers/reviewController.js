import { Review } from "../models/review";

// GET all reviews
export async function getAllReviews(req, res) {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// POST a new review
export async function createReview(req, res) {
  const { name, rating, comment } = req.body;

  if (!name || !rating || !comment) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const review = new Review({ name, rating, comment });
    const savedReview = await review.save();
    res.status(201).json(savedReview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
