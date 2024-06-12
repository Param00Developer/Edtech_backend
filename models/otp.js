import mongoose from "mongoose";
import sendMail from "../utils/mailSender";

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

otpSchema.post("save",async function(doc){
    try{
        await sendMail(email,"Verification Email from Edtech_backend",doc.otp)
    }catch(err){
        console.error("Error inside emailing otp :"+err)
    }
})
export default mongoose.model("Otp", otpSchema);
