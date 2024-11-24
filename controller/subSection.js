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

export async function updateSubSection(req, res) {
  try {
    const { sectionId, title, description } = req.body;
    const subSection = await SubSection.findById(sectionId);

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    title ? (subSection.title = title) : null;
    description ? (subSection.description = description) : null;
    const video = req.files?.video;

    if (video) {
      const videoUrl = await uploadImage(video, process.env.FOLDER);
      subSection.videoUrl = videoUrl;
      subSection.timeDuration = `${videoUrl.duration}`;
    }
    await subSection.save();
    return res.json({
      success: true,
      message: "Section updated successfully",
    });
  } catch (err) {
    console.log(`Error inside subsection update :${err}`);
    return res.status(500).json({
      success: false,
      message: "Error while updating Subsection : Internal Servre error.",
    });
  }
}

export async function deleteSubSection(req, res) {
  try {
    const { sectionId, subSectionId } = req.body;

    //deleting Subsection from section
    await Section.findByIdUpdate(sectionId, {
      $pull: { subSection: subSectionId },
    });
    const subSection = await SubSection.findByIdDelete({
      _id: subSectionId,
    });
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "Subsection not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Subsection deleted successfully",
    });
  } catch (err) {
    console.log(`Error inside subsection delete :${err}`);
    return res.status(400).json({
      success: false,
      message: "Error while deleting Subsection : Internal Servre error.",
    });
  }
}
