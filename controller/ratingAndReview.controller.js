import mongoose from "mongoose";
import Course from "../models/courseModel.js";
import Ratingandreview from "../models/ratingandreview.js";
import { ErrorResponse, SuccessResponse } from "../utils/response.utils.js";
import AppError from "../utils/appError.utils.js";
import errorConstants from "../constants/error.constants.js";


export default class RatingAndReviewController {
  constructor() {
    this.repoCourse = Course;
    this.repoRatingAndReview = Ratingandreview;
  }

  static createInstance() {
    return new RatingAndReviewController();
  }

  /**
   * Create a new rating and review for a course
   * @param {Object} req - Express request object containing rating, review, and courseId
   * @param {Object} res - Express response object
   * @description This function validates if the user is enrolled in the course and checks if the user has already reviewed the course.
   * If valid, it creates a new rating and review and updates the course with the new review details.
   */
  createRating = async (req, res) => {
    try {
      const { rating, review, courseId } = req.body;
      const userId = req.user.id || "";

      //checking user is enrolled int he course or not
      const isEnrolled = await  this.repoCourse.findOne({
        _id: courseId,
        studentsEnrolled: { $elemMatch: { $eq: userId } },
      });
      if (!isEnrolled) {
        throw new AppError(errorConstants.NOT_AUTHORIZED,{
          message: "You are not enrolled in this course",
        })
      }
      //checking already reviewed
      const alreadyReviewed = await  this.repoRatingAndReview.findOne({
        user: userId,
        course: courseId,
      });
      if (alreadyReviewed) {
        throw new AppError(errorConstants.BAD_REQUEST,{
          message: "You have already reviewed this course"
        })
      }
      //create rating
      const rate = await  this.repoRatingAndReview.create({
        user: userId,
        rating,
        review,
        course: courseId,
      });

      //updating course details
      await  this.repoCourse.findByIdAndUpdate(
        { _id: courseId },
        {
          $push: { ratingAndReview: rate._id },
        }
      );
      SuccessResponse(req, res, {
        message: "Rating created successfully",
        rate,
      });
    } catch (err) {
      console.log(err);
      ErrorResponse(req, res, err);
    }
  };

  /**
   * Fetch all ratings and reviews
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @description This function retrieves all ratings and reviews from the database, sorts them in descending order
   * of ratings, and populates related user and course details for each review.
   */
  getAllRatings = async (req, res) => {
    try {
      const allRatings = await  this.repoRatingAndReview.find({})
        .sort({ rating: "desc" })
        .populate({
          path: "user",
          select: "firstName lastName email image",
        })
        .populate({
          path: "course",
          select: "courseName",
        })
        .exec();

      SuccessResponse(req, res, {
        message: "All reviews fetched successfully",
        data: allRatings,
      });
    } catch (err) {
      ErrorResponse(req,res,err)
    }
  };

  /**
   * Calculate the average rating for a course
   * @param {Object} req - Express request object containing courseId
   * @param {Object} res - Express response object
   * @description This function calculates the average rating for a course using MongoDB aggregation.
   * If no ratings exist, it returns an average rating of 0.
   */
  //implementing avrating only with query
  getAvgRatings = async (req, res) => {
    try {
      const courseId = req.body.courseId;
      const avgRating = await  this.repoRatingAndReview.aggregate([
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
        return SuccessResponse(req, res, {
          message: "Average rating calculation successful",
          avgRating: avgRating[0].avgRating,
        });
      }

      //0 rating for a new course
      SuccessResponse(req, res, {
        message: "Average rating is 0 , no rating given till now .",
        avgRating: 0,
      });
    } catch (err) {
      ErrorResponse(req,res,err)
    }
  };
}
