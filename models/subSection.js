import mongoose, { mongo } from "mongoose";

const subSection=mongoose.Schema({
   title:{
    type:String,
   },
   timeDuration:{
    type:String,
   },
   description:{
    type:String,
    trim:true
   },
   videoUrl:{
    type:String,
    trim:true
   },
})
export default mongoose.model("SubSection",subSection)