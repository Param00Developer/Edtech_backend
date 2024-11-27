import express from "express";
const router = express.Router();

import { login, signup, sendOtp, changePassword } from "../controller/Auth.js";
import {
  resetPasswordToken,
  resetPassword,
} from "../controller/resetPassword.js";
import { auth } from "../middleware/auth.js";

// Routes for Login, Signup, and Authentication
router.post("/login", login);
router.post("/signup", signup);

router.post("/sendOtp", sendOtp);
router.post("/changePassword", auth, changePassword);

// router for generating reset password token
router.post("/resetPasswordToken", resetPasswordToken);

router.post("resetPassword", resetPassword);

export default router;
