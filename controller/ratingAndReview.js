import Ratingandreview from "../models/ratingandreview.js";
import User from "../models/user.js";

async function createRating(req, res) {
  try {
    const { rating, review } = req.body;
    const userId = req.user.id || "";
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid user credentials",
      });
    }
    //create rating
    const rate = await Ratingandreview.create({ user: userId, rating, review });

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

async function getAllRatings(req, res) {
  try {
    const ratings = await getRatings();
    res.status(200).json({
      success: true,
      data: ratings,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

async function getAvgRatings(req, res) {
  try {
    const ratings = await getRating();
    const avgRating =
      ratings.redunce((acc, rating) => {
        acc += rating;
      }, 0) / ratings.length;

    return res.status(200).json({
      success: true,
      message: "Average rating calculation successful",
      data: {
        avgRating,
      },
    });
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
export { createRating, getAllRatings, getAvgRatings };
