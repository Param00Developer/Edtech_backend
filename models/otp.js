import mongoose from "mongoose";
import sendMail from "../utils/mailSender.js";

const otpSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: String,
    default: Date.now(),
  },
});

// Add TTL index to automatically remove documents after 5 minutes
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

otpSchema.post("save", async function (doc) {
  try {
    await sendMail(
      doc.email,
      "Verification Email from Edtech_backend",
      doc.otp
    );
  } catch (err) {
    console.error("Error inside emailing otp :" + err);
  }
});
export default mongoose.model("Otp", otpSchema);
