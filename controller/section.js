import Course from "../models/courseModel.js";
import Section from "../models/section.js";

export async function createSection(req, res) {
  try {
    const { sectionName, courseId } = req.body;
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }
    const newSection = await Section.create({
      sectionName,
    });

    const updatedCourse = await Course.findOneAndUpdate(
      { courseId },
      {
        $push: { sections: newSection._id },
      },
      { new: true }
    );

    return res.status(400).json({
      success: true,
      message: "Section created successfully.",
      updatedCourse,
    });
  } catch (err) {
    console.log(`Error inside section Creation :${err}`);
    return res.status(400).json({
      success: false,
      message: "Unable to create section",
      error: err.message,
    });
  }
}

export async function updateSection(req, res) {
  try {
    const { sectionName, sectionId } = req.body;
    //vlidationg data
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    //updating section data
    const newSection = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Section updated successfully.",
    });
  } catch (err) {
    console.log(`Error inside section update :${err}`);
    return res.status(400).json({
      success: false,
      message: "Unable to update section",
      error: err.message,
    });
  }
}

export async function deleteSection(req, res) {
  try {
    const sectionId = req.params;
    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: "Section Id is not provided",
      });
    }
    //delete section from db
    const section = await Section.findByIdAndDelete(sectionId);
    await Course.findByIdAndUpdate();
    res.status(200).json({
      success: true,
      message: "Section deleted successfully.",
    });
  } catch (err) {
    console.log(`Error inside section delete :${err}`);
    return res.status(400).json({
      success: false,
      message: "Unable to delete section",
      error: err.message,
    });
  }
}
