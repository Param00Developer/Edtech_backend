import { dashboard } from "../controller/dashboard.js";
import express from "express";
import user from "../models/user.js";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
const router = express.Router();

router.get("/auth/dashboard", dashboard);
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback", // Adjust the callback URL according to your application's route
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log("Profile Data : ", profile);
      return cb(null, profile);
    }
  )
);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/auth/dashboard");
  }
);

router.get("/login", (req, res) => {
  res.send("Please login");
});

router.get("/login/success", (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: user,
      cookies: req.cookies,
    });
  } catch (error) {
    console.log(`Error : ${error}`);
  }
});
export default router;
