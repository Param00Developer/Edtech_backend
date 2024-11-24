import User from "../models/user.js";
import Category from "../models/category.js";
import Course from "../models/courseModel.js";
import Section from "../models/section.js";
import SubSection from "../models/subSection.js";
import CourseProgress from "../models/courseProgress.js";
import { uploadImage } from "../utils/imageUploader.js";

export default class CourseController {
  constructor() {
    this.repoCourse = Course;
    this.repoUser = User;
    this.repoCategory = Category;
    this.repoSection = Section;
    this.repoSubSection = SubSection;
    this.repoCourseProgress = CourseProgress;
  }

  static createInstance() {
    return new CourseController();
  }
  /**
   * Create a new course
   * @param {Object} req - Express request object containing course details
   * @param {Object} res - Express response object
   * @description This function creates a new course by validating the request data,
   * uploading the course thumbnail, and saving the course details in the database.
   */
  createCourse = async (req, res) => {
    try {
      // Get user ID from request object
      const userId = req.user.id;

      const {
        name,
        description,
        whatWillYouLearn,
        price,
        tag: _tag,
        category,
        status,
        instructions: _instructions,
      } = req.body;

      // Convert the tag and instructions from stringified Array to Array
      const tag = JSON.parse(_tag);
      const instructions = JSON.parse(_instructions);

      const thumbnail = req.files.thumbnailImage;

      if (
        !name ||
        !description ||
        !whatWillYouLearn ||
        !price ||
        !thumbnail ||
        !category ||
        !instructions.length
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields must be provided.",
        });
      }

      if (!status || status === undefined) {
        status = "Draft";
      }
      // Check if the user is an instructor
      const instructorDetails = await User.findById(userId, {
        accountType: "Instructor",
      });

      if (!instructorDetails) {
        return res.status(404).json({
          success: false,
          message: "Instructor Details Not Found",
        });
      }

      //tag details fetch from db
      const categoryDetails = await this.repoCategory.findById(tag);
      if (!categoryDetails) {
        return res.status(404).json({
          success: false,
          message: "Category Details Not Found",
        });
      }

      //upload image
      const thumbnailUrl = await uploadImage(thumbnail, process.env.FOLDER);

      //course entry create
      const newCourse = await this.repoCourse
        .create({
          courseName: name,
          courseDescription: description,
          instructor: instructorDetails._id,
          whatWillYouLearn,
          price,
          category: categoryDetails._id,
          thumbnail: thumbnailImage.secure_url,
          status: status,
          instructions,
        })
        .lean();

      //add new course to user
      await this.repoUser.findByIdAndUpdate(
        { _id: instructorDetails._id },
        { $push: { courses: newCourse._id } },
        { new: true }
      );

      //return response
      res.status(200).json({
        success: true,
        message: "Course created successfully",
        data: newCourse,
      });
    } catch (err) {
      console.log("Error creating User : ", err);
      res.status(500).json({
        success: false,
        message: "Internal Server Error while creating course ",
      });
    }
  };

  /**
   * Get details of a specific course
   * @param {Object} req - Express request object containing the course ID
   * @param {Object} res - Express response object
   * @description This function fetches detailed information about a course, including
   * the instructor details, category, ratings, reviews, and course content.
   */
  getCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body;
      // populate nestead fields
      const courseDetails = await this.repoCourse
        .find({ _id: courseId })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndreviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec();
      res.status(200).json({
        success: true,
        message: "User details fetched successfully",
        data: courseDetails,
      });
    } catch (err) {
      console.log("Error fetching  course : ", err);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error while fetching all courses",
      });
    }
  };

  /**
   * Get a list of all available courses
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @description Fetches a summarized list of all courses in the database,
   * including basic details like name, price, thumbnail, and instructor.
   */
  getAllCourses = async (req, res) => {
    try {
      const allCourses = await this.repoCourse
        .find(
          {},
          {
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndReviews: true,
            studentsEnroled: true,
          }
        )
        .populate("instructor")
        .exec();
      return res.status(200).json({
        success: true,
        data: allCourses,
      });
    } catch (error) {
      console.log(error);
      return res.status(404).json({
        success: false,
        message: `Can't Fetch Course Data`,
        error: error.message,
      });
    }
  };

  /**
   * Get full details of a specific course including progress for a user
   * @param {Object} req - Express request object containing course ID
   * @param {Object} res - Express response object
   * @description This function fetches the full details of a course, including
   * the instructor, category, ratings, reviews, content, and user-specific progress.
   */
  getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body;
      const userId = req.user.id;
      const courseDetails = await this.repoCourse
        .findOne({
          _id: courseId,
        })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec();

      let courseProgressCount = await this.repoCourseProgress.findOne({
        courseID: courseId,
        userId: userId,
      });

      console.log("courseProgressCount : ", courseProgressCount);

      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        });
      }

      let totalDurationInSeconds = 0;
      courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration);
          totalDurationInSeconds += timeDurationInSeconds;
        });
      });

      const totalDuration = this.convertSecondsToDuration(
        totalDurationInSeconds
      );

      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : [],
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  /**
   * Edit the details of an existing course
   * @param {Object} req - Express request object containing course ID and updates
   * @param {Object} res - Express response object
   * @description This function allows updating the details of a course, including its thumbnail image,
   * tags, and other fields. Only fields present in the request body are updated.
   */
  // Edit Course Details
  editCourse = async (req, res) => {
    try {
      const { courseId } = req.body;
      const updates = req.body;
      const course = await this.repoCourse.findById(courseId);

      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      // If Thumbnail Image is found, update it
      if (req.files) {
        console.log("thumbnail update");
        const thumbnail = req.files.thumbnailImage;
        const thumbnailImage = await uploadImageToCloudinary(
          thumbnail,
          process.env.FOLDER_NAME
        );
        course.thumbnail = thumbnailImage.secure_url;
      }

      // Update only the fields that are present in the request body
      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          if (key === "tag" || key === "instructions") {
            course[key] = JSON.parse(updates[key]);
          } else {
            course[key] = updates[key];
          }
        }
      }

      await course.save();

      const updatedCourse = await this.repoCourse
        .findOne({
          _id: courseId,
        })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec();

      res.json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };

  /**
   * Get a list of all courses for a specific instructor
   * @param {Object} req - Express request object containing instructor ID (from authenticated user)
   * @param {Object} res - Express response object
   * @description This function fetches all courses created by a specific instructor,
   * sorted in descending order by creation date.
   */
  // Get a list of Course for a given Instructor
  getInstructorCourses = async (req, res) => {
    try {
      // Get the instructor ID from the authenticated user or request body
      const instructorId = req.user.id;

      // Find all courses belonging to the instructor
      const instructorCourses = await this.repoCourse
        .find({
          instructor: instructorId,
        })
        .sort({ createdAt: -1 });

      // Return the instructor's courses
      res.status(200).json({
        success: true,
        data: instructorCourses,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor courses",
        error: error.message,
      });
    }
  };

  /**
   * Delete a course along with its associated sections, subsections, and student enrollments
   * @param {Object} req - Express request object containing course ID
   * @param {Object} res - Express response object
   * @description This function deletes a course, including unenrolling all students from the course
   * and removing all associated sections and subsections.
   */
  // Delete the Course
  deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.body;

      // Find the course
      const course = await this.repoCourse.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Unenroll students from the course
      const studentsEnrolled = course.studentsEnrolled;
      for (const studentId of studentsEnrolled) {
        await this.repoUser.findByIdAndUpdate(studentId, {
          $pull: { courses: courseId },
        });
      }

      // Delete sections and sub-sections
      const courseSections = course.courseContent;
      for (const sectionId of courseSections) {
        // Delete sub-sections of the section
        const section = await this.repoSection.findById(sectionId);
        if (section) {
          const subSections = section.subSection;
          for (const subSectionId of subSections) {
            await this.repoSubSection.findByIdAndDelete(subSectionId);
          }
        }

        // Delete the section
        await this.repoSection.findByIdAndDelete(sectionId);
      }

      // Delete the course
      await this.repoCourse.findByIdAndDelete(courseId);

      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  };

  /**
   * Converts a given time in seconds into a human-readable duration format
   * (e.g., "1h 30m", "45m 20s", "30s").
   *
   * @param {number} seconds - The total number of seconds to convert.
   * @returns {string} - The formatted duration string.
   */
  convertSecondsToDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const seconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };
}
