import express from "express";
const router = express.Router();
import {
  createCourse,
  getCourseDetails,
  getAllCourses,
} from "../controller/course.js";

import {
  createCategory,
  showAllCategory,
  categoryPageDetails,
} from "../controller/category.js";
import {
  createSection,
  updateSection,
  deleteSection,
} from "../controller/section.js";

import {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} from "../controller/subSection.js";
import {
  createRating,
  getAllRatings,
  getAvgRatings,
} from "../controller/ratingAndReview.js";
import { auth, isInstructor, isStudent, isAdmin } from "../middleware/auth.js";

//courses can only be created by instructor
router.post("/createCourse", auth, isInstructor, createCourse);
// Add a section to a course
router.post("/addSection", auth, isInstructor, createSection);
//update a section
router.post("/updateSection", auth, isInstructor, updateSection);
//delete a section
router.post("/deleteSection", auth, isInstructor, deleteSection);
// Add a subSection to a section
router.post("/addSubSection", auth, isInstructor, createSubSection);
// get all registered courses
router.get("/getAllCourses", getAllCourses);
//get course specific details
router.post("/getCourseDetails", getCourseDetails);

//category Routes
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategory);
router.post("/getCategoryPageDetails", categoryPageDetails);

//rating and review
router.post("/createRating", auth, isStudent, createRating);
router.get("/getAvgRating", getAvgRatings);
router.get("/getReviews", getAllRatings);

export default router;
