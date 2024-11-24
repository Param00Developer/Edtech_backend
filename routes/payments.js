// Import the required modules
import express from "express";
const router = express.Router();

import { capturePayment, verifySignature } from "../controller/Payments.js";
import { auth, isInstructor, isStudent, isAdmin } from "../middleware/auth.js";
router.post("/capturePayment", auth, isStudent, capturePayment);
router.post("/verifySignature", verifySignature);

export default router;
