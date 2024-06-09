import mongoose, { mongo } from "mongoose";

const ratingAndReview=mongoose.Schema({
    user:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"User"
    },
    rating:{
        type:Number
    },
    review:{
        type:String,
        trim:true
    }, 
})

export default mongoose.Schema("RatingAndReview",ratingAndReview)