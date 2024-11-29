import User from "../models/user.js";
import jwt from "jsonwebtoken";
import sendMail from "../utils/mailSender.js";
import bcrypt from "bcrypt";
import { passwordUpdated } from "../mailTemplates/passwordChange.js";
import { ErrorResponse, SuccessResponse } from "../utils/response.utils.js";
import AppError from "../utils/appError.utils.js";
import errorConstants from "../constants/error.constants.js";

export default class PasswordController {
  constructor() {
    this.repoUser = User;
  }

  static createInstance() {
    return new PasswordController();
  }

  /**
   * Send a password reset token to the user's email
   * @param {Object} req - Express request object containing the user's email
   * @param {Object} res - Express response object
   * @description Generates a password reset token and sends a reset link to the user's registered email.
   */
  resetPasswordToken = async (req, res) => {
    try {
      const { email } = req.body;
      const userFound = await this.repoUser.findOne({ email });
      if (!userFound) {
        throw new AppError(errorConstants.BAD_REQUEST,{
          message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
        })
      }
      const payload = {
        email: email,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);

      const url = `http://localhost:3000/update-password/${token}`;
      const message = `Your Link for email verification is ${url}. Please click this url to reset your password.`;

      //sending mail with the link
      try {
        await sendMail(email, "Password reset Ed-tech_backend", message);
      } catch (err) {
        throw new AppError(errorConstants.INTERNAL_SERVER_ERROR, {
          message: `Error in mail inside resetPassword :${err}`
        })
      }
      //If mail send is success
      SuccessResponse(req, res, {
        message: `Please check your mail ${email} for resetting password..`,
      });
    } catch (err) {
      ErrorResponse(req,res,err)
    }
  };

  /**
   * Reset the user's password
   * @param {Object} req - Express request object containing the new password and token
   * @param {Object} res - Express response object
   * @description Validates the token and updates the user's password in the database. Also sends a confirmation email of changed password.
   */
  resetPassword = async (req, res) => {
    try {
      const { password, confirmPassword, token } = req.body;

      if (!token) {
        throw new AppError(errorConstants.BAD_REQUEST, {
          message: "Invalid Url.",
        })
      }
      if (password != confirmPassword) {
        throw new AppError(errorConstants.BAD_REQUEST, {
          message: "Password and confirm password does not match",
        })
      }
      const { email } = jwt.verify(token, process.env.JWT_SECRET);

      const hashPassword = await bcrypt.hashPassword(password, 10);
      const user = await this.repoUser.findOneAndUpdate(
        { email },
        { password: hashPassword },
        { new: true }
      );
      try {
        const message = passwordUpdated(email, user.firstName + user.lastName);
        await sendMail(email, "Password reset Ed-tech_backend", message);
      } catch (err) {
        throw new AppError(errorConstants.INTERNAL_SERVER_ERROR, {
          message: `Error in mail inside resetPassword :${err}`
        })
      }
      SuccessResponse(req, res, {
        message: `Password changed successfully`,
      });
    } catch (err) {
      ErrorResponse(req,res,err)
    }
  };
}
