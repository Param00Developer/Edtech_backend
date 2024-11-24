import express from "express";
const router = express.Router();
import { auth } from "../middleware/auth.js";
import ProfileController from "../controller/Profile.controller.js"

const profileController=ProfileController.createInstance()
// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************
//delete account routes
router.delete("/deleteProfile", auth, profileController.deleteProfile);
router.put("/updateProfile", auth, profileController.updateProfile);
router.get("getUserDetails", auth, profileController.getAllUserDetails);

//get enrolled courses
router.get("/getEnrolledCourses", auth, profileController.getEnrolledCourses);
//updatedisplay picture
router.put("/updateDisplayPicture", auth, profileController.updateDisplayPicture);

export default router;
