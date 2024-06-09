import mongoose from "mongoose";
import {} from "dotenv"

export async function dbConnect(){
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Connected to MongoDB")
    }catch(err){
        console.log("Can't connect with DB",err);
    }
}
