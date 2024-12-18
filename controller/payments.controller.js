import mongoose from "mongoose";
import Course from "../models/courseModel.js";
import User from "../models/user.js";
import instance from "../config/razorpay.js";
import courseEnrollmentEmail from "../mailTemplates/courseEnrollmentEmail.js";
import paymentSuccessEmail from "../mailTemplates/paymentSuccessEmail.js";
import sendMail from "../utils/sendMail.js";
import { ErrorResponse, SuccessResponse } from "../utils/response.utils.js";
import crypto from "crypto";
import AppError from "../utils/appError.utils.js";
import errorConstants from "../constants/error.constants.js";

export default class PaymentController {
  constructor() {
    this.repoUser = User;
    this.repoCourse = Course;
  }

  static createInstance() {
    return new PaymentController();
  }

  /**
   * Capture Payment for courses
   * @param {Object} req - Express request object containing user and course data
   * @param {Object} res - Express response object
   * @description Captures the payment for the courses selected by the user.
   * It validates course IDs, calculates the total amount, and creates a Razorpay order.
   */
  capturePayment = async (req, res) => {
    try {
      const { courses } = req.body;
      const userId = req.user.id;

      if (courses.length === 0) {
        throw new AppError(errorConstants.BAD_REQUEST, {
          message: "Please provide Course Id",
        });
      }

      let totalAmount = 0;

      for (const course_id of courses) {
        let course;
        course = await this.repoCourse.findById(course_id);
        if (!course) {
          throw new AppError(errorConstants.RESOURCE_NOT_FOUND, {
            message: "Course not found",
          });
        }

        const uid = new mongoose.Types.ObjectId(userId);
        if (course.studentsEnrolled.includes(uid)) {
          return SuccessResponse(req, res, {
            message: "Course already enrolled",
          });
        }
        totalAmount += course.price;
      }
      const currency = "INR";
      const options = {
        amount: totalAmount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
      };
      const paymentResponse = await instance.orders.create(options);
      SuccessResponse(req, res, {
        message: paymentResponse,
      });
    } catch (err) {
      ErrorResponse(req, res, err);
    }
  };

  /**
   * Verify Payment
   * @param {Object} req - Express request object containing payment details
   * @param {Object} res - Express response object
   * @description Verifies the payment signature generated by Razorpay to ensure the transaction's integrity.
   * If verification is successful, enrolls the user in the selected courses.
   */
  //verify the payment
  verifyPayment = async (req, res) => {
    try {
      const razorpay_order_id = req.body?.razorpay_order_id;
      const razorpay_payment_id = req.body?.razorpay_payment_id;
      const razorpay_signature = req.body?.razorpay_signature;
      const courses = req.body?.courses;
      const userId = req.user.id;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !courses ||
        !userId
      ) {
        throw new AppError(errorConstants.INTERNAL_SERVER_ERROR, {
          message: "Payment Failed",
        });
      }

      let body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature === razorpay_signature) {
        //enroll karwao student ko
        await this.enrollStudents(courses, userId, res);
        //return res
        return SuccessResponse(req, res, {
          message: "Payment Verified",
        });
      }
      throw new AppError(errorConstants.BAD_REQUEST,{
        message: "Payment Verification Failed",
      })
    } catch (err) {
      ErrorResponse(req, res, err);
    }
  };

  /**
   * Enroll Students in Courses
   * @param {Array} courses - List of course IDs to enroll
   * @param {String} userId - ID of the user
   * @param {Object} res - Express response object
   * @description Adds the user to the students enrolled in the courses and sends enrollment confirmation emails.
   */
  enrollStudents = async (courses, userId, res) => {
    if (!courses || !userId) {
      throw new AppError(errorConstants.BAD_REQUEST,{
        message: "Please Provide data for Courses or UserId",
      })
    }

    for (const courseId of courses) {
      try {
        //find the course and enroll the student in it
        const enrolledCourse = await this.repoCourse.findOneAndUpdate(
          { _id: courseId },
          { $push: { studentsEnrolled: userId } },
          { new: true }
        );

        if (!enrolledCourse) {
          throw new AppError(errorConstants.BAD_REQUEST,{
            message: "Course Not Found",
          })
        }

        //find the student and add the course to their list of enrolledCOurses
        const enrolledStudent = await this.repoUser.findByIdAndUpdate(
          userId,
          {
            $push: {
              courses: courseId,
            },
          },
          { new: true }
        );

        ///bachhe ko mail send kardo
        const emailResponse = await sendMail(
          enrollStudents.email,
          `Successfully Enrolled into ${enrolledCourse.courseName}`,
          courseEnrollmentEmail(
            enrolledCourse.courseName,
            `${enrolledStudent.firstName}`
          )
        );
      } catch (error) {
        throw new AppError(errorConstants.INTERNAL_SERVER_ERROR,{error})
      }
    }
  };

  /**
   * Send Payment Success Email
   * @param {Object} req - Express request object containing payment and user details
   * @param {Object} res - Express response object
   * @description Sends an email to the user upon successful payment with the transaction details.
   */
  sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body;

    const userId = req.user.id;

    if (!orderId || !paymentId || !amount || !userId) {
      throw new AppError(errorConstants.BAD_REQUEST, {
        message: "Please provide all the fields" 
      })
    }

    try {
      //student ko dhundo
      const enrolledStudent = await this.repoUser.findById(userId);
      await sendMail(
        enrolledStudent.email,
        `Payment Recieved`,
        paymentSuccessEmail(
          `${enrolledStudent.firstName}`,
          amount / 100,
          orderId,
          paymentId
        )
      );
    } catch (error) {
        ErrorResponse(req,res,error)
    }
  };
}
