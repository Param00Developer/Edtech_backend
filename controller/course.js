import Tag from "../models/category.js"
import User from "../models/user.js"
import Course from "../models/courseModel.js"
import { uploadImage } from "../utils/imageUploader.js"

export async function(req,res){
    try{
        const {name,description,whatWillYouLearn,price,tag} = req.body

        const thumbnail=req.file.thumbnailImage

        if (!name ||!description ||!whatWillYouLearn ||!price ||!thumbnail) {
            return res.status(400).json({
              success: false,
              message: "All fields must be provided."
            });
        }
        // instructor id
        const instructorId=req.user.id

        //tag details fetch from db
        const tagDetails=await Tag.findById(tag)
        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:"Tag not found"
            })
        }

        //upload image
        const thumbnailUrl=await uploadImage(thumbnail,process.env.FOLDER)

        //course entry create
        const newCourse = await Course.create({courseName:name,courseDescription:description,instructor:instructorId,whatWillYouLearn,price,tag:tagDetails._id,thumbnail:thumbnailUrl})

        //add new course to user
        const user=await User.findByIdAndUpdate({_id:instructorId},{$push:{courses:course._id}},{new:true})

        //return response
        res.status(200).json({
            success: true,
            message: "Course created successfully",
            data:newCourse
        })

    }
    catch(err){
        console.log('Error creating User : ',err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error while creating course "
            message: "Internal Server Error while creating course "
        })
    }
}