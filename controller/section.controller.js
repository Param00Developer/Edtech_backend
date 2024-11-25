import Course from "../models/courseModel.js";
import Section from "../models/section.js";
import SubSection from "../models/subSection.js";

export default class SectionController {
  constructor() {
    this.repoCourse = Course;
    this.repoSection = Section;
    this.repoSubSection = SubSection;
  }

  static createInstance() {
    return new SectionController();
  }
  /**
   * Create a new section
   * @param {Object} req - Express request object containing section details (sectionName, courseId)
   * @param {Object} res - Express response object
   * @description This function creates a new section by validating the request data,
   * adding the section to the course's content, and returning the updated course.
   */
  createSection = async (req, res) => {
    try {
      const { sectionName, courseId } = req.body;
      if (!sectionName || !courseId) {
        return res.status(400).json({
          success: false,
          message: "Please fill all the fields",
        });
      }
      const newSection = await this.repoSection.create({
        sectionName,
      });

      const updatedCourse = await this.repoCourse
        .findOneAndUpdate(
          { courseId },
          {
            $push: { courseContent: newSection._id },
          },
          { new: true }
        )
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec();

      return res.status(200).json({
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
  };

  /**
   * Update an existing section
   * @param {Object} req - Express request object containing section details (sectionName, sectionId, courseId)
   * @param {Object} res - Express response object
   * @description This function updates the name of an existing section by validating the request data,
   * updating the section information, and returning the updated course data.
   */
  updateSection = async (req, res) => {
    try {
      const { sectionName, sectionId, courseId } = req.body;
      //vlidationg data
      if (!sectionName || !sectionId) {
        return res.status(400).json({
          success: false,
          message: "Please fill all the fields",
        });
      }

      //updating section data
      const newSection = await this.repoSection.findByIdAndUpdate(
        sectionId,
        { sectionName },
        { new: true }
      );
      const course = await this.repoCourse
        .findById(courseId)
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec();

      return res.status(200).json({
        success: true,
        message: newSection,
        data: course,
      });
    } catch (err) {
      console.log(`Error inside section update :${err}`);
      return res.status(500).json({
        success: false,
        message: "Unable to update section",
        error: err.message,
      });
    }
  };

  /**
   * Delete an existing section
   * @param {Object} req - Express request object containing section details (sectionId, courseId)
   * @param {Object} res - Express response object
   * @description This function deletes an existing section by removing it from the course's content,
   * deleting associated subsections, and returning the updated course data.
   */
  deleteSection = async (req, res) => {
    try {
      const { sectionId, courseId } = req.body;
      await this.repoCourse.findByIdAndUpdate(courseId, {
        $pull: {
          courseContent: sectionId,
        },
      });

      const section = await this.repoSection.findById(sectionId);
      if (!section) {
        return res.status(404).json({
          success: false,
          message: "Section not Found",
        });
      }
      //delete sub section
      await this.repoSubSection.deleteMany({
        _id: { $in: section.subSection },
      });

      await this.repoSection.findByIdAndDelete(sectionId);
      //find the updated course and return
      const course = await this.repoCourse
        .findById(courseId)
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec();
      res.status(200).json({
        success: true,
        message: "Section deleted successfully.",
      });
    } catch (err) {
      console.log(`Error inside section delete :${err}`);
      return res.status(500).json({
        success: false,
        message: "Unable to delete section",
        error: err.message,
      });
    }
  };
}
