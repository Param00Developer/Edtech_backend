import express from "express";
const router = express.Router();
import { auth } from "../middleware/auth.js";

import {
  deleteProfile,
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
} from "../controller/Profile.js";

//delete account routes
router.delete("/deleteProfile", auth, deleteProfile);

router.put("/updateProfile", auth, updateProfile);
router.get("getUserDetails", auth, getAllUserDetails);

//get enrolled courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses);

//updatedisplay picture
router.put("/updateDisplayPicture", auth, updateDisplayPicture);

export default router;
