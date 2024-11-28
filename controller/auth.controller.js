import User from "../models/user.js";
import OTP from "../models/otp.js";
import Profile from "../models/profile.js";
import otpGenerator from "otp-generator";
import bcrypt from "bcrypt";
import sendMail from "../utils/mailSender.js";
import { passwordUpdated } from "../mailTemplates/passwordChange.js";
import jwt from "jsonwebtoken";
import { SuccessResponse , ErrorResponse} from "../utils/response.utils.js";
import AppError from "../utils/appError.utils.js";
import errorConstants from "../constants/error.constants.js";

export default class AuthController {
  constructor() {
    // Initialize repositories for user, profile, and OTP operations
    this.repoProfile = Profile;
    this.repoUser = User;
    this.repoOtp = OTP;
  }

  static createInstance() {
    return new AuthController();
  }

  /**
   * Send an OTP to the user's email for verification
   * @param {Object} req - Express request object containing the user's email
   * @param {Object} res - Express response object
   * @description Generates a 6-digit OTP, checks its uniqueness, and sends it to the user's email.
   */
  sendOtp = async (req, res) => {
    try {
      const { email } = req.body;
      const exist = await this.repoUser.findOne({ email });
      if (exist) {
        throw new AppError(errorConstants.BAD_REQUEST,{
          message:"User already registered ."
        })
      }
      let otp;
      do {
        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });
      } while (await this.repoOtp.findOne({ otp }));

      const otpBody = OTP.create({ email: email, otp: otp });
      SuccessResponse(req, res, {
        message: "OTP has been send to email.Please verify to continue.",
      });
    } catch (err) {
      ErrorResponse(req, res, err)
      console.log(err);
    }
  };

  /**
   * Register a new user
   * @param {Object} req - Express request object containing user details
   * @param {Object} res - Express response object
   * @description Validates user input, verifies the OTP, hashes the password, and saves user details in the database.
   */
  signup = async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp,
      } = req.body;
      if (
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !confirmPassword ||
        !otp
      ) {
        return res.status(400).json({
          success: false,
          message: "Please fill all the fields.",
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Password and confirm password does not match.",
        });
      }

      const userExist = await this.repoUser.findOne({ email });
      if (userExist) {
        throw new AppError(errorConstants.BAD_REQUEST,{
          message: "User already exist.",
        });
      }

      const recentOtp = await this.repoOtp
        .find({ email })
        .sort({ createdAt: -1 })
        .limit(1);
      if (recentOtp[0].otp !== otp) {
        throw new AppError(errorConstants.BAD_REQUEST,{
          message: "Invalid OTP.",
        })
      }

      const hashPassword = await bcrypt.hash(password, 10);

      // Create the user
      let approved = "";
      approved === "Instructor" ? (approved = false) : (approved = true);

      const profileDetails = await this.repoProfile.create({
        gender: null,
        dateOfBirth: null,
        about: null,
        contactNumber: contactNumber,
      });

      const user = await this.repoUser.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password: hashPassword,
        accountType,
        approved,
        additionalDetails: profileDetails,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
      });

      SuccessResponse(req, res, {
        user,
        message: "User registered successfully",
      });
    } catch (err) {
      console.log(err);
      ErrorResponse(req, res, err);
    }
  };

  /**
   * Login a user
   * @param {Object} req - Express request object containing login credentials
   * @param {Object} res - Express response object
   * @description Validates user credentials, generates a JWT token, and sends it as a cookie.
   */
  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return req.status(403).json({
          success: false,
          message: "All fields are required , please try again.",
        });
      }
      const user = await this.repoUser
        .findOne({ email })
        .populate("additionalDetails");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User is not registered, please signup first. ",
        });
      }
      if (await bcrypt.compare(password, user.password)) {
        const payload = {
          email: user.email,
          id: user._id,
          accountType: user.accountType,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "24h",
        });

        //returning a cookie that will have the token
        const options = {
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          httpOnly: true,
        };
        return res.cookie("token", token, options).status(200).json({
          success: true,
          token,
          user,
          message: `User Login Success`,
        });
      } else {
        throw new AppError(errorConstants.NOT_AUTHORIZED , {
          message: "Password is incorrect.",
        })
      }
    } catch (err) {
      ErrorResponse(req,res,err)
    }
  };

  /**
   * Change the user's password
   * @param {Object} req - Express request object containing old and new passwords
   * @param {Object} res - Express response object
   * @description Validates the old password, hashes the new password, updates the database, and sends a confirmation email.
   */
  changePassword = async (req, res) => {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;
      //user validation
      const userDetails = await this.repoUser.findById(req.user.id);

      const isMatch = await bcrypt.compare(oldPassword, userDetails.password);
      if (!isMatch) {
        throw new AppError(errorConstants.NOT_AUTHORIZED , {
          message: "Old password is incorrect.",
        })
      } else if (newPassword !== confirmPassword) {
        throw new AppError(errorConstants.NOT_AUTHORIZED , {
          message: "New password and confirm password do not match",
        })
      }
      //hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      //change the password
      const updatedDetail = await this.repoUser.findByIdAndUpdate(
        userDetails._id,
        { password: hashedPassword },
        { new: true }
      );

      //Email of password change is send
      await sendMail(
        updatedDetail.email,
        passwordUpdated(
          updatedDetail.email,
          `Password updated successfully for ${updatedDetail.firstName} ${updatedDetail.lastName}`
        )
      );
      SuccessResponse(req, res, {
        message: "Password updated successfully",
      });
    } catch (err) {
      ErrorResponse(req,res,{
        message:`"Error in changing password : Internal server error" `
      })
    }
  };
}
