import mongoose, { mongo } from "mongoose";

const profileSchema=mongoose.Schema({
   gender:{
    type:String,
   },
   dateOfBirth:{
    type:String,
   },
   about:{
    type:String,
    trim:true
   },
   contactNumber:{
    type:Number,
    trim:true
   },
})
export default mongoose.model("Profile",profileSchema)