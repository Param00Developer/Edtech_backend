import Profile from "../models/profile.js";
import User from "../models/user.js";
import { uploadImage } from "../utils/imageUploader.js";

export async function updateProfile(req, res) {
  try {
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
    const id = req.user?.id;
    if (!contactNumber || !gender || !id) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all the fields" });
    }

    const user = await User.findById(id);
    const profileId = user.additionalDetails;
    const profile = await Profile.findById(profileId);

    //update profile
    profile.dateOfBirth = dateOfBirth;
    profile.about = about;
    profile.contactNumber = contactNumber;
    profile.gender = gender;

    await profile.save();

    return res.status(200).json({
      success: false,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Profile update failed.",
    });
  }
}

export async function deleteProfile(req, res) {
  try {
    const id = req.user.id;
    const user = await User.findById(id);
    const profileId = user.additionalDetails;
    if (!profileId) {
      return res.satus(400).json({
        success: false,
        message: "Profile not found",
      });
    }
    await Profile.findByIdAndDelete(profileId);
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User delete successful.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Profile delete failed.",
    });
  }
}

export async function getAllUserDetails(req, res) {
  try {
    const id = req.user.id;

    const user = await findById(id).populate("additionalDetails").exec();

    res.status(200).json({
      success: true,
      message: "user data fetched based on filters",
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "User data fetch falied.",
    });
  }
}

export async function updateDisplayPicture(req, res) {
  try {
    const displayPicture = req.files?.displayPicture;
    const id = req.user?.id;
    console.log("=====", displayPicture);
    const upload = await uploadImage(
      displayPicture,
      String(process.env.FOLDER_NAME),
      1000,
      1000
    );
    console.log(`Image Data : ${JSON.stringify(upload)}`);
    const user = await User.findByIdAndUpdate(
      id,
      {
        image: upload.secure_url,
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Image update was successful",
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Failed to update Profile picture",
    });
  }
}

export async function getEnrolledCourses(req, res) {
  try {
    const id = req.user.id;
    const enrolledCourses = await User.findById(id, {
      _id: true,
      courses: true,
    }).populate("courses");

    if (!enrolledCourses) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      });
    }
    return res.status(200).json({
      success: true,
      data: enrolledCourses.courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
