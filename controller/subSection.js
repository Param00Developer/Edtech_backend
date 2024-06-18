import SubSection from "../models/subSection.js";
import Section from "../models/section.js";
import { uploadImage } from "../utils/imageUploader.js";

export async function createSubSection(req, res) {
  try {
    const { sectionId, title, timeDuration, description } = req.body;
    const video = req.files.videoFile;
    if (!sectionId || !title || !timeDuration || !description) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }
    const videoUrl = await uploadImage(video, process.env.FOLDER);

    //create a subSection
    const subSection = await SubSection.create({
      title,
      timeDuration,
      description,
      videoUrl,
    });
    //add subSection to section
    const section = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: { subSection: subSection._id },
      },
      { new: true }
    ).populate("subSection");

    res.status(200).json({
      success: true,
      message: "SubSection created successfully",
      section,
    });
  } catch (err) {
    console.log(`Error inside subsection delete :${err}`);
    return res.status(400).json({
      success: false,
      message: "Unable to create subsection",
      error: err.message,
    });
  }
}
