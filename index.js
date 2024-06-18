import express from "express"
import {} from "dotenv/config.js";
import {dbConnect} from "./config/dbconnect.js"
import cookieSession from "cookie-session";
import session from "express-session"; 
import * as GoogleAuth from './controller/googleAuth.js';
import passport from "passport";
import router from "./routes/route.js";


const app =express()
const PORT=process.env.PORT || 4000
app.use(express.json())
app.use(router)

// Configure express-session
app.use(
    session({
      secret: 'your_secret_key', // Replace with your actual secret
      resave: false,
      saveUninitialized: false
    })
  );
  

//setup session 
// app.use(cookieSession(
//     {
//         name:"session",
//         keys: ['key1'],
//         maxAge:24*60*60*1000
//     }
// ))
// initializing passport
app.use(passport.initialize())
app.use(passport.session())
// app.use(
//     cors({
//         origin:"http://localhost:5000",
//         methods:["GET","POST","PUT","DELETE"],
//         credentials:true
//     })
// )

try{
    // dbConnect()
    app.listen(PORT,()=>{
        console.log(`Server is running on PORT : http://localhost:${PORT}/`)
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