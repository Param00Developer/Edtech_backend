import mongoose from "mongoose";
import {} from "dotenv"

export async function dbConnect(){
    try{
        mongoose.set("debug", true); //logging DB queries
        return await mongoose.connect(process.env.MONGO_URL)
    }catch(err){
        console.log("Can't connect with DB",err);
    }
}
