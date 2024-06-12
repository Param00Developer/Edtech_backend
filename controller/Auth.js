import User from "../models/user.js"
import OTP from "../models/otp.js"
import Profile from "../models/profile.js"
import otpGenerator from "otp-generator"
import bcrypt from "bcrypt"


//sendOTP
async function sendOTP(req,res){
    try{
        const {email} = req.body

        const exist=User.findOne({email})
        if(exist){
            res.status(200).json({
                success:false,
                message:"User already registered ."
            })
        }

        let otp
        do{
            otp=otpGenerator.generate(
                6,
                {
                    upperCaseAlphabets:false,
                    lowerCaseAlphabets:false,
                    specialChars:false
                }
            )
        }while(await OTP.findOne({otp}))
        
        const otpBody=OTP.create({email:email,otp:otp})
        res.status(200).json({
            success:true,
            message:"OTP has been send to email.Please verify to continue."
        })

    }
    catch(err){
        console.log(err)
    }
}

//signup route
async function signup(req,res){
    try{
        const{firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp}=req.body
        if (!firstName || !lastName ||!email || !password ||confirmPassword ||otp){
            return res.status(400).json({
                success:false,
                message:"Please fill all the fields."
            })
        }

        if(password!==confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and confirm password does not match."
            })
        }

        const userExist=await User.findOne({email})
        if(userExist){
            return res.status(400).json({
                success:false,
                message:"User already exist."
            })
        }

        const recentOtp=await OTP.find({email}).sort({createdAt:-1}).limit(1)
        if(recentOtp[0].otp!==otp){
            return res.status(400).json({
                success:false,
                message:"Enter a valid Otp."
            })
        }

        const hashPassword=await bcrypt.hash(password,10)

        const profileDetails=await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:contactNumber
        })

        const user=await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashPassword,
            accountType,
            additionalDetails:profileDetails,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        return res.status(200).json({
            success:true,
            message:"User registration was successful."
        })
    }
    catch(err){
        console.log(err)
        return res.status(500).json({
            success:false,
            message:"User registration failed."
        })
    }
}


//login
async function login(req,res){
    try{
        const {email,password}=req.body
        if(!email || !password){
            return req.status(403).json({
                success:false,
                message:"All fields are required , please try again."
            })
        }
        const user =await User.findOne({email})
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first. "
            })
        }
        if(await bcrypt.compare(password,user.password)){
            const payload ={
                email:user.email,
                id:user._id,
                role:user.accountType
            }

            const token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"2h"})

            //returning a cookie that will have the token
            const options={
                success:true,
                token,
                user,
                message:"Logged in success"
            }
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Password is incorrect."
            })
        }
    }catch(err){
        console.log(`Error occured while login : ${err}`)
        return res.status(500).json({
            success:false,
            message:"Error in login : Internal server error."
        })
    }
}
