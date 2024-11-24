import User from "../models/user.js";
import jwt from "jsonwebtoken";
import sendMail from "../utils/mailSender.js";
import bcrypt from "bcrypt";
import { passwordUpdated } from "../mailTemplates/passwordChange.js";

async function resetPasswordToken(req, res) {
  try {
    const { email } = req.body;
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res.status(400).json({
        success: false,
        message: "Invalid User email provided .",
      });
    }
    const payload = {
      email: email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    const url = `http://localhost:3000/update-password/${token}`;
    const message = `Please click on the link to reset your password ${url}`;

    //sending mail with the link
    try {
      await sendMail(email, "Password reset Ed-tech_backend", message);
    } catch (err) {
      console.log("Error inside email in resetPassword :", err);
      return res.status(500).json({
        success: false,
        message: `Error in mail inside resetPassword :${err}`,
      });
    }
    //If mail send is success
    return res.status(500).json({
      success: true,
      message: `Please check your mail ${email} for resetting password..`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error while resetting password : Internal Server Error",
    });
  }
}

async function resetPassword(req, res) {
  try {
    const token = req.body.token;
    const { password, confirPassword } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invalid Url.",
      });
    }
    if (password != confirPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password does not match",
      });
    }
    const { email } = jwt.verify(token, process.env.JWT_SECRET);

    const hashPassword = await bcrypt.hashPassword(password, 10);
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashPassword },
      { new: true }
    );
    console.log("User password changed :", user);
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error while reseting password :${err}`,
    });
  }
}

export { resetPassword, resetPasswordToken };
