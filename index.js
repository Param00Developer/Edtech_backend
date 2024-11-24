import express from "express";
import {} from "dotenv/config.js";
import { dbConnect } from "./config/dbconnect.js";
import cookieSession from "cookie-session";
import session from "express-session";
import passport from "passport";
import router from "./routes/route.js";
import cookieParser from "cookie-parser";

// importing routes
import courseRoutes from "./routes/course.js";
import profileRoutes from "./routes/profile.js";
import paymentRoutes from "./routes/payments.js";
import userRoutes from "./routes/user.js";
import fileUpload from "express-fileupload";

const app = express();
const PORT = process.env.PORT || 4000;
app.use(
  session({
    secret: "your_secret_key_here",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 86400000, // Cookie max age in milliseconds (1 day)
    },
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(router);

// initializing passport
app.use(passport.initialize());
app.use(passport.session());
app.use(
  fileUpload({
    useTempFiles: true,
    dest: "./uploads/",
  })
);
// app.use(
//     cors({
//         origin:"http://localhost:5000",
//         methods:["GET","POST","PUT","DELETE"],
//         credentials:true
//     })
// )
// Configure express-session middleware

try {
  dbConnect();
  app.listen(PORT, () => {
    console.log(`Server is running on PORT : http://localhost:${PORT}/`);
  });
} catch (err) {
  console.error(`Some error occured :  ${err}`);
  res.status(500).json({
    success: false,
    message: `Error with the server : ${err}`,
  });
}

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is live..",
  });
});
