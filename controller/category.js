import Category from "../models/category.js";
import Course from "../models/courseModel.js";

export async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      res.status(400).json({
        success: false,
        message: `Missing required field :${!name ? "name" : "description"}`,
      });
    }
    const tag = await Category.create({ name, description });
    return res.status(200).json({
      success: true,
      message: tag,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Error in category :${err}`,
    });
  }
}

export async function showAllCategory(req, res) {
  try {
    const category = await Category.find({}, { name: true, description: true });
    return res.status(400).json({
      success: true,
      message: "All category received",
      category,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Error in while fetching category :${err}`,
    });
  }
}

export async function categoryPageDetails(req, res) {
  try {
    const catId = req.body.categoryId || "";

    const courses = await Category.findById({ _id: catId })
      .populate("courses")
      .exec();

    if (!courses) {
      return res.status(404).json({
        success: false,
        message: "Course not found .",
      });
    }
    //getting different suggestion for courses
    const differentSuggestion = await Category.find({ _id: { $ne: catId } })
      .populate("courses")
      .exec();

    //getting popular suggestions
    //TO DO - find famous category
    const popularSuggestion = await Course.findOne()
      .sort({ studentsEnrolled: -1 })
      .limit(5);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Error in while fetching category details :${err}`,
    });
  }
}
