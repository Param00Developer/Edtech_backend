import Profile from "../models/profile.js";
import User from "../models/user.js";
import { uploadImage } from "../utils/imageUploader.js";
import { SuccessResponse } from "../utils/response.utils.js";

export default class ProfileController {
  constructor() {
    this.repoUser = User;
    this.repoProfile = Profile;
  }

  static createInstance() {
    return new ProfileController();
  }

  /**
   * Update user profile details
   * @param {Object} req - Express request object containing user profile data
   * @param {Object} res - Express response object
   * @description Updates the user's profile information such as date of birth, about, contact number, and gender.
   */
  updateProfile = async (req, res) => {
    try {
      const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
      const id = req.user?.id;
      if (!contactNumber || !gender || !id) {
        return res
          .status(400)
          .json({ success: false, message: "Please fill all the fields" });
      }

      const user = await this.repoUser.findById(id);
      const profileId = user.additionalDetails;
      const profile = await this.repoProfile.findById(profileId);

      //update profile
      profile.dateOfBirth = dateOfBirth;
      profile.about = about;
      profile.contactNumber = contactNumber;
      profile.gender = gender;

      await profile.save();

      SuccessResponse(req,res,{
        message: "Profile updated successfully",
      })
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Profile update failed.",
      });
    }
  };

  /**
   * Delete a user and their profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @description Deletes the user and their associated profile from the database.
   */
  deleteProfile = async (req, res) => {
    try {
      const id = req.user.id;
      const user = await this.repoUser.findById(id);
      const profileId = user.additionalDetails;
      if (!profileId) {
        return res.satus(400).json({
          success: false,
          message: "Profile not found",
        });
      }
      await this.repoProfile.findByIdAndDelete(profileId);
      await this.repoUser.findByIdAndDelete(id);

      SuccessResponse(req,res,{
        message: "User delete successful.",
      })
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Profile delete failed.",
      });
    }
  };

  /**
   * Get details of the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @description Fetches details of the authenticated user along with populated profile information.
   */
  getAllUserDetails = async (req, res) => {
    try {
      const id = req.user.id;

      const user = await findById(id).populate("additionalDetails").exec();

      SuccessResponse(req,res,{
        message: "user data fetched based on filters",
        user,
      })
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "User data fetch falied.",
      });
    }
  };

  /**
   * Update user profile display picture
   * @param {Object} req - Express request object containing file upload
   * @param {Object} res - Express response object
   * @description Updates the user's profile picture and saves the URL in the user record.
   */
  updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files?.displayPicture;
      const id = req.user?.id;
      const upload = await uploadImage(
        displayPicture,
        String(process.env.FOLDER_NAME),
        1000,
        1000
      );
      console.log(`Image Data : ${JSON.stringify(upload)}`);
      const user = await this.repoUser.findByIdAndUpdate(
        id,
        {
          image: upload.secure_url,
        },
        { new: true }
      );

      SuccessResponse(req,res,{
        message: "Image update was successful",
        user,
      })
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to update Profile picture",
      });
    }
  };

  /**
   * Get a list of courses the user is enrolled in
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @description Retrieves all the courses the user is currently enrolled in, including course details.
   */
  getEnrolledCourses = async (req, res) => {
    try {
      const id = req.user.id;
      const enrolledCourses = await this.repoUser
        .findById(id, {
          _id: true,
          courses: true,
        })
        .populate("courses");

      if (!enrolledCourses) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        });
      }

      SuccessResponse(req,res,{
        data: enrolledCourses.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
}
