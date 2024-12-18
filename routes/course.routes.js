import express from "express";
import CourseController from "../controller/course.controller.js";
import SectionController from "../controller/section.controller.js";
import SubSectionController from "../controller/subSection.js";
import CategoryController from "../controller/category.js";
import RatingAndReviewController from "../controller/ratingAndReview.js";
const router = express.Router();

const courseController = CourseController.createInstance();
const sectionController =SectionController.createInstance();
const subSectionController =SubSectionController.createInstance();
const categoryController = CategoryController.createInstance();
const ratingAndReviewController = RatingAndReviewController.createInstance();

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
router.post("/addSection", auth, isInstructor, sectionController.createSection);
//update a section
router.post("/updateSection", auth, isInstructor, sectionController.updateSection);
//delete a section
router.post("/deleteSection", auth, isInstructor, sectionController.deleteSection);
// Add a subSection to a section
router.post("/addSubSection", auth, isInstructor, subSectionController.createSubSection);
// Edit Sub Section
router.post("/updateSubSection", auth, isInstructor, subSectionController.updateSubSection)
// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructor, subSectionController.deleteSubSection)
// get all registered courses
router.get("/getAllCourses", courseController.getAllCourses);
//get course specific details
router.post("/getCourseDetails", courseController.getCourseDetails);
// Get Details for a Specific Courses
router.post("/getFullCourseDetails", auth, courseController.getFullCourseDetails)
// Edit Course routes
router.post("/editCourse", auth, isInstructor, courseController.editCourse)
// Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", auth, isInstructor, courseController.getInstructorCourses)
// Delete a Course
router.delete("/deleteCourse", courseController.deleteCourse)

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
//category Routes
router.post("/createCategory", auth, isAdmin, categoryController.createCategory);
router.get("/showAllCategories", categoryController.showAllCategory);
router.post("/getCategoryPageDetails", categoryController.categoryPageDetails);

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
//rating and review
router.post("/createRating", auth, isStudent, ratingAndReviewController.createRating);
router.get("/getAvgRating", ratingAndReviewController.getAvgRatings);
router.get("/getReviews", ratingAndReviewController.getAllRatings);

export default router;
