import mongoose from "mongoose";

const otpSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: Number,
        required: true
    },
    createdAt: {
        type: String,
        default: Date.now(),
        expires: 5 * 60 // Added missing comma here
    }
});

export default mongoose.model("Otp", otpSchema);
