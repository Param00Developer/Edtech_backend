import mongoose from "mongoose";
import Course from "../models/courseModel.js";
import Ratingandreview from "../models/ratingandreview.js";
import User from "../models/user.js";

async function createRating(req, res) {
  try {
    const { rating, review, courseId } = req.body;
    const userId = req.user.id || "";
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid user credentials",
      });
    }
    //checking user is enrolled int he course or not
    const isEnrolled = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }
    //checking already reviewed
    const alreadyReviewed = await Ratingandreview.findOne({
      user: userId,
      course: courseId,
    });
    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Already reviewed course. ",
      });
    }
    //create rating
    const rate = await Ratingandreview.create({
      user: userId,
      rating,
      review,
      course: courseId,
    });

    //updating course details
    await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: { ratingAndReview: rate._id },
      }
    );
    res.status(200).json({
      success: true,
      message: "Rating created successfully",
      rate,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

async function getRating() {
  try {
    return await Ratingandreview.find({}, "rating");
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// async function getAllRatings(req, res) {
//   try {
//     const ratings = await getRatings();
//     res.status(200).json({
//       success: true,
//       data: ratings,
//     });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// }
//

//
async function getAllRatings(req, res) {
  try {
    const allRatings = await Ratingandreview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec()

      //return response
      .res.status(200)
      .json({
        success: true,
        data: allRatings,
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// async function getAvgRatings(req, res) {
//   try {
//     const ratings = await getRating();
//     const avgRating =
//       ratings.redunce((acc, rating) => {
//         acc += rating;
//       }, 0) / ratings.length;

//     return res.status(200).json({
//       success: true,
//       message: "Average rating calculation successful",
//       data: {
//         avgRating,
//       },
//     });
//   } catch (err) {
//     console.error(err); // Log the error for debugging purposes
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// }
//implementing avrating only with query
async function getAvgRatings(req, res) {
  try {
    const courseId = req.body.courseId;
    const avgRating = await Ratingandreview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);
    if (avgRating.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Average rating calculation successful",
        avgRating: avgRating[0].avgRating,
      });
    }

    //0 rating for a new course
    return res.status(200).json({
      success: true,
      message: "Average rating is 0 , no rating given till now .",
      avgRating: 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
export { createRating, getAllRatings, getAvgRatings };
