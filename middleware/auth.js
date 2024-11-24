import jwt from "jsonwebtoken";

//Auth middleware
async function auth(req, res, next) {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies.token ||
      req.body.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access.",
      });
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (err) {
    console.log(`Error at auth middleware :${err}`);
    return res.status(500).json({
      success: false,
      message: `Error at auth middleware :${err}`,
    });
  }
}

//isStudent middleware
async function isStudent(req, res, next) {
  try {
    if (req.user.accountType == "Student") {
      return next();
    }
    return res.status(401).json({
      success: false,
      message: `This route is allowed only for students.`,
    });
  } catch (err) {
    console.log(`Error at isStudent middleware :${err}`);
    return res.status(500).json({
      success: false,
      message: `Error at isStudent middleware :${err}`,
    });
  }
}

//isInstructor middleware
async function isInstructor(req, res, next) {
  try {
    if (req.user.accountType === "instructor") {
      return next();
    }
    return res.status(401).json({
      success: false,
      message: `This route is allowed only for Instructor.`,
    });
  } catch (err) {
    console.log(`Error at isInstructor middleware :${err}`);
    return res.status(500).json({
      success: false,
      message: `Error at isInstructor middleware :${err}`,
    });
  }
}

//isAdmin middleware
async function isAdmin(req, res, next) {
  try {
    if (req.user.accountType === "admin") {
      return next();
    }
    return res.status(401).json({
      success: false,
      message: `This route is allowed only for Admin.`,
    });
  } catch (err) {
    console.log(`Error at isAdmin middleware :${err}`);
    return res.status(500).json({
      success: false,
      message: `Error at isAdmin middleware :${err}`,
    });
  }
}

export { isAdmin, isInstructor, auth, isStudent };
