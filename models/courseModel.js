import mongoose, { mongo } from "mongoose";

const courseModelSchema = mongoose.Schema({
  courseName: {
    type: String,
  },
  courseDescription: {
    type: String,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  whatYouWillLearn: {
    type: String,
  },
  courseContent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
  },
  ratingAndReviews: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RatingAndReview",
  },
  price: {
    type: Number,
  },
  thumbnail: {
    type: String,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tag",
  },
  tags: {
    type: string,
  },
  studentEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

export default mongoose.Schema("Course", courseModelSchema);
