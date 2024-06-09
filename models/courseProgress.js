import mongoose from "mongoose";

const courseProgressSchema=mongoose.Schema({
    courseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    },
    completedVideos:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Subsection"
        }
    ]
})

export default mongoose.model("CourseProgress",courseProgressSchema)