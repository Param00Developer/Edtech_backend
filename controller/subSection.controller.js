import SubSection from "../models/subSection.js";
import Section from "../models/section.js";
import { uploadImage } from "../utils/imageUploader.js";
import { SuccessResponse } from "../utils/response.utils.js";
import AppError from "../utils/appError.utils.js";
import errorConstants from "../constants/error.constants.js";
export default class SubSectionController {
  constructor() {
    this.repoSection = Section;
    this.repoSubSection = SubSection;
  }

  static createInstance() {
    return new SubSectionController();
  }

  /**
   * Create a new subsection
   * @param {Object} req - Express request object containing subsection details (sectionId, title, description, videoFile)
   * @param {Object} res - Express response object
   * @description This function creates a new subsection by validating the request data,
   * uploading the video file, saving the subsection details in the database, and associating
   * it with the respective section.
   */
  createSubSection = async (req, res) => {
    try {
      const { sectionId, title, description } = req.body;
      const video = req.files.videoFile;
      if (!sectionId || !title || !description) {
        throw new AppError(errorConstants.BAD_REQUEST,{
          message: "Please fill all the fields",
        })
      }
      const uploadDetails = await uploadImage(video, process.env.FOLDER);

      //create a subSection
      const subSection = await this.repoSubSection.create({
        title,
        timeDuration: `${uploadDetails.duration}`,
        description,
        videoUrl: uploadDetails.secure_url,
      });
      //add subSection to section
      const section = await this.repoSection
        .findByIdAndUpdate(
          { _id: sectionId },
          {
            $push: { subSection: subSection._id },
          },
          { new: true }
        )
        .populate("subSection");

      SuccessResponse(req, res, {
        message: "SubSection created successfully",
        data: section,
      });
    } catch (err) {
      ErrorResponse(req, res, err);
    }
  };

  /**
   * Update an existing subsection
   * @param {Object} req - Express request object containing subsection details (sectionId, subSectionId, title, description, video)
   * @param {Object} res - Express response object
   * @description This function updates the details of an existing subsection, including its title,
   * description, and video, and returns the updated section.
   */
  updateSubSection = async (req, res) => {
    try {
      const { sectionId, subSectionId, title, description } = req.body;
      const subSection = await this.repoSubSection.findById(subSectionId);

      if (!subSection) {
        throw new AppError(errorConstants.RESOURCE_NOT_FOUND, {
          message: "SubSection not found",
        })
      }

      title ? (subSection.title = title) : null;
      description ? (subSection.description = description) : null;
      const video = req.files?.video;

      if (video) {
        const videoUrl = await uploadImage(video, process.env.FOLDER);
        subSection.videoUrl = videoUrl;
        subSection.timeDuration = `${videoUrl.duration}`;
      }
      await subSection.save();
      const updatedSection = await this.repoSection
        .findById(sectionId)
        .populate("subSection");

      SuccessResponse(req, res, {
        data: updatedSection,
        message: "Section updated successfully",
      });
    } catch (err) {
      ErrorResponse(req, res, err);
    }
  };

  /**
   * Delete an existing subsection
   * @param {Object} req - Express request object containing subsection details (sectionId, subSectionId)
   * @param {Object} res - Express response object
   * @description This function deletes a subsection by removing it from the associated section
   * and then deleting it from the database, returning the updated section.
   */
  deleteSubSection = async (req, res) => {
    try {
      const { sectionId, subSectionId } = req.body;

      //deleting Subsection from section
      await this.repoSection.findByIdUpdate(sectionId, {
        $pull: { subSection: subSectionId },
      });
      const subSection = await this.repoSubSection.findByIdDelete({
        _id: subSectionId,
      });
      if (!subSection) {
        throw new AppError(errorConstants.RESOURCE_NOT_FOUND, {
          message: "SubSection not found",
        })
      }
      const updatedSection = await Section.findById(sectionId).populate(
        "subSection"
      );

      SuccessResponse(req, res, {
        data: updatedSection,
        message: "Subsection deleted successfully",
      });
    } catch (err) {
      ErrorResponse(req, res, err);
    }
  };
}
