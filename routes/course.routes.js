import express from "express";
import CourseController from "../controller/course.controller.js";
const router = express.Router();

const courseController = new CourseController();
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

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************
//courses can only be created by instructor
router.post("/createCourse", auth, isInstructor, courseController.createCourse);
// Add a section to a course
router.post("/addSection", auth, isInstructor, courseController.createSection);
//update a section
router.post("/updateSection", auth, isInstructor, courseController.updateSection);
//delete a section
router.post("/deleteSection", auth, isInstructor, courseController.deleteSection);
// Add a subSection to a section
router.post("/addSubSection", auth, isInstructor, courseController.createSubSection);
// Edit Sub Section
router.post("/updateSubSection", auth, isInstructor, courseController.updateSubSection)
// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructor, courseController.deleteSubSection)
// get all registered courses
router.get("/getAllCourses", courseController.getAllCourses);
//get course specific details
router.post("/getCourseDetails", courseController.getCourseDetails);
// Get Details for a Specific Courses
router.post("/getFullCourseDetails", auth, courseController.getFullCourseDetails)
// Edit Course routes
router.post("/editCourse", auth, isInstructor, courseController.editCourse)
// Delete a Course
router.delete("/deleteCourse", courseController.deleteCourse)

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
//category Routes
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategory);
router.post("/getCategoryPageDetails", categoryPageDetails);

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
//rating and review
router.post("/createRating", auth, isStudent, createRating);
router.get("/getAvgRating", getAvgRatings);
router.get("/getReviews", getAllRatings);

export default router;
