import Category from "../models/category.js";

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
      message: `Tag :${tag}`,
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
