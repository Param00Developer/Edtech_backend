// Import the required modules
import express from "express";
const router = express.Router();
import { auth, isInstructor, isStudent, isAdmin } from "../middleware/auth.js";
import PaymentController from "../controller/payments.controller.js";
const paymentController =PaymentController.createInstance();


// ********************************************************************************************************
//                                      Payment routes
// ********************************************************************************************************
router.post("/capturePayment", auth, isStudent, paymentController.capturePayment)
router.post("/verifyPayment",auth, isStudent, paymentController.verifyPayment)
router.post("/sendPaymentSuccessEmail", auth, isStudent, paymentController.sendPaymentSuccessEmail);


export default router;
