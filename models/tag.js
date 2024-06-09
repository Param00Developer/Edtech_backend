import mongoose, { mongo } from "mongoose";

const tagSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    course:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
    },
})

export default mongoose.Schema("Tag",tagSchema)