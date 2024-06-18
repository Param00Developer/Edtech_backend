import { dashboard } from "../controller/dashboard.js";
import  express  from "express";
import user from "../models/user.js";
import passport from "passport";

const router=express.Router()

router.get("/auth/dashboard",dashboard)

router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile',"email"] })
);
  
router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login',session:false }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/auth/dashboard');
    });

router.get("/login",(req,res)=>{
    res.send("Please login")
})

router.get("/login/success",(req,res)=>{
    try{
        res.status(200).json({
            success:true,
            user:user,
            cookies:req.cookies
        })
    }
    catch(error){
        console.log(`Error : ${error}`)
    }

})
export default router