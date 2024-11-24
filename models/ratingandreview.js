import mongoose, { mongo } from "mongoose";

const ratingAndReview = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  rating: {
    type: Number,
  },
  review: {
    type: String,
    trim: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Course",
    index: true,
  },
});

export default mongoose.model("RatingAndReview", ratingAndReview);
