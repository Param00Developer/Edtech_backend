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
  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
    },
  ],
  price: {
    type: Number,
  },
  thumbnail: {
    type: String,
  },
  tags: {
    type: [String],
    required: true,
  },
  category: {
		type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
	},
  studentEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  instructions: {
    type: [String],
  },
  status: {
    type: String,
    enum: ["Draft", "Published"],
  },
});

export default mongoose.model("Course", courseModelSchema);
