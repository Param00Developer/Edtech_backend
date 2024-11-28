import express from "express";
import AuthController from "../controller/auth.controller.js";
import PasswordController from "../controller/resetPassword.controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();
const authController = AuthController.createInstance();
const passwordController = PasswordController.createInstance()

// Routes for Login, Signup, and Authentication
router.post("/login", authController.login);
router.post("/signup", authController.signup);

router.post("/sendOtp", authController.sendOtp);
router.post("/changePassword", auth, authController.changePassword);

// router for generating reset password token
router.post("/resetPasswordToken", passwordController.resetPasswordToken);

router.post("resetPassword", passwordController.resetPassword);

export default router;
