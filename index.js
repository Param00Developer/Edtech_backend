import {} from "dotenv/config.js";
import { dbConnect } from "./config/dbconnect.js";
import init from "./utils/server.utils.js";
import { logger } from "./utils/logger.utils.js";


const PORT = process.env.PORT || 4000;
const app = init();

//setup session
// app.use(cookieSession(
//     {
//         name:"session",
//         keys: ['key1'],
//         maxAge:24*60*60*1000
//     }
// ))
// initializing passport
// app.use(passport.initialize())
// app.use(passport.session())
// app.use(
//     cors({
//         origin:"http://localhost:5000",
//         methods:["GET","POST","PUT","DELETE"],
//     })
// )
// Configure express-session middleware

dbConnect().then(() => {
  logger.info("Database connected!");
  app.listen(PORT, () => {
    logger.info(`Server is running on PORT : http://localhost:${PORT}/`);
  });
}).catch((err) => {
  logger.error(err.message);
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is live..",
  });
});
