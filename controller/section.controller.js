import errorConstants from "../constants/error.constants.js";
import Course from "../models/courseModel.js";
import Section from "../models/section.js";
import SubSection from "../models/subSection.js";
import AppError from "../utils/appError.utils.js";
import { SuccessResponse } from "../utils/response.utils.js";

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
        throw new AppError(errorConstants.BAD_REQUEST,{
          message: "Please fill all the fields",
        })
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

      SuccessResponse(req,res,{
        message: "Section created successfully.",
        updatedCourse,
      })
    } catch (err) {
      ErrorResponse(req,res,err)
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
        throw new AppError(errorConstants.BAD_REQUEST,{
          message: "Please fill all the fields",
        })
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

      SuccessResponse(req,res,{
        message: newSection,
        data: course,
      })
    } catch (err) {
      ErrorResponse(req,res,err)
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
        throw new AppError(errorConstants.RESOURCE_NOT_FOUND, {
          message: "Section not found",
        })
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

      SuccessResponse(req,res,{
        message: "Section deleted successfully.",
      })
    } catch (err) {
      ErrorResponse(req,res,err)
    }
  };
}
