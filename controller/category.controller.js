import errorConstants from "../constants/error.constants.js";
import Category from "../models/category.js";
import Course from "../models/courseModel.js";
import AppError from "../utils/appError.utils.js";
import { SuccessResponse , ErrorResponse} from "../utils/response.utils.js";

export default class CategoryController {
  constructor() {
    this.repoCourse = Course;
    this.repoCategory = Category;
  }

  static createInstance() {
    return new CategoryController();
  }

  /**
   * Create a new category
   * @param {Object} req - Express request object containing category details
   * @param {Object} res - Express response object
   * @description This function creates a new category by validating the request data
   * and saving the category details in the database.
   */
  createCategory = async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name || !description) {
        throw new AppError(errorConstants.BAD_REQUEST,{
          message: `Missing required field :${!name ? "name" : "description"}`,
        })
      }
      const CategorysDetails = await this.repoCategory.create({
        name: name,
        description: description,
      });
      SuccessResponse(req, res, {
        message: CategorysDetails,
      });
    } catch (err) {
      ErrorResponse(req,res,err)
    }
  };

  /**
   * Retrieve all categories
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @description Fetches all categories from the database and returns them.
   */
  showAllCategory = async (req, res) => {
    try {
      const categories = await this.repoCategory.find({});
      SuccessResponse(req, res, {
        message: "All category received",
        data: categories,
      });
    } catch (err) {
      ErrorResponse(req,res,err)
    }
  };

  /**
   * Get category page details
   * @param {Object} req - Express request object containing category ID
   * @param {Object} res - Express response object
   * @description Fetches details of a specific category along with suggested
   * and popular courses.
   */
  categoryPageDetails = async (req, res) => {
    try {
      const catId = req.body.categoryId || "";

      const courses = await this.repoCategory
        .findById({ _id: catId })
        .populate("courses")
        .exec();

      if (!courses) {
        throw new AppError(errorConstants.RESOURCE_NOT_FOUND,{
          message: "Course not found .",
        })
      }
      //getting different suggestion for courses
      const differentSuggestion = await this.repoCategory
        .find({ _id: { $ne: catId } })
        .populate("courses")
        .exec();

      //getting popular suggestions
      const popularSuggestion = await this.repoCourse
        .findOne()
        .sort({ studentsEnrolled: -1 })
        .limit(5);
      SuccessResponse(req, res, {
        data: {
          suggestion: differentSuggestion,
          popularSuggestion: popularSuggestion,
        },
      });
    } catch (err) {
      ErrorResponse(req,res,err)
    }
  };
}
