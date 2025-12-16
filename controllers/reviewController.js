import Review from '../models/review.js';

export async function getAllReviews(req, res) {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

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

export async function updateReview(req, res) {
  const { id } = req.params;
  const { name, rating, comment } = req.body;

  if (!name || !rating || !comment) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.name !== name) {
      return res.status(403).json({ message: "You can only edit your own review" });
    }

    review.rating = rating;
    review.comment = comment;
    const updatedReview = await review.save();
    res.status(200).json(updatedReview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteReview(req, res) {
  const { id } = req.params;

  try {
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    await review.deleteOne();
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
