import mongoose from "mongoose";
import Course from "../models/courseModel.js";
import { instance } from "../config/razorpay.js";
import User from "../models/user.js";
import user from "../models/user.js";
import sendMail from "../utils/mailSender.js";

export async function capturePayment(req, res) {
  try {
    const { course_id } = req.body;
    const userId = req.user.id;
    if (!course_id) {
      return res.json({
        success: false,
        message: "Please provide a valid course id.",
      });
    }
    let course;
    try {
      course = await Course.findById(course_id);
      if (!course) {
        return res.json({
          success: false,
          message: "Could not find the course.",
        });
      }
      //check whether user already paid for the course
      const id = mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(id)) {
        return res.json({
          success: false,
          message: "Student is already enrolled .",
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }

    //order create
    const amount = course.price;
    const currency = "INR";

    const options = {
      amount: amount * 100,
      currency,
      receipt: Math.random(Date.now()).toString(),
      notes: {
        courseId: course_id,
        user_id: userId,
      },
    };
    //create order
    const paymentResponse = await instance.orders.create(options);
    res.status(200).json({
      message: "Payment intigration  success",
      courseName: course.courseName,
      courseDescription: courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (err) {
    console.log(`Error : ${err}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function verifySignature(req, res) {
  try {
    const webhookSecret = "2115446131031";
    const signature = req.headers["x-razorpay-signature"];
    const shasum = crytpto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }
    const { courseId, userId } = req.body.payload.payment.entity.notes;
    //added student into course
    const course = await Course.findByIdAndUpdate(
      { _id: courseId },
      { $push: { studentsEnrolled: user } },
      { new: true }
    );
    if (!course) {
      return res.status(500).json({
        success: false,
        message: "Course not found",
      });
    }
    //assigning course to student
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { $push: { courses: courseId } },
      { new: true }
    );
    const mailBody = await sendMail(
      user.email,
      `Congratulation from  Edtech_backend!!","Congratulation u are enrolled in new ${course.courseName}, open dashboard to get started.`
    );
    console.log(`Mail Body : ${mailBody}`);
    return res.status(200).json({
      success: true,
      message: "Signature Verified and Course Added.",
    });
  } catch (err) {
    console.log(`Error verifying payment response:${err}`);
    res.status(200).json({
      success: false,
      message: `Error verifying payment response:${err}`,
    });
  }
}
