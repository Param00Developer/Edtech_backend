import Express from "express"
import {} from "dotenv/config.js";
import {dbConnect} from "./config/dbconnect.js"

const app =Express()
const PORT=process.env.PORT || 4000
try{
    // dbConnect()
    app.listen(PORT,()=>{
    
        console.log(`Server is running on PORT : ${PORT}`)
    })
}catch(err){
    console.error(`Some error occured :  ${err}`)
    res.status(500).json({
        success:false,
        message:`Error with the server : ${err}`,
    })
}

app.get("/",(req,res)=>{
    return res.status(200).json({
        success:true,
        message:"Server is live..",
    })
})