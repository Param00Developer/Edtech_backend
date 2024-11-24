//image upload function using cloudinary
import cloudinary from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Example function to upload an image
async function uploadImage(file, folder, height_image, quality_image) {
  try {
    const height = height_image ? height_image : null;
    const quality = quality_image ? quality_image : null;
    const options = { height, quality, resource_type: "auto" };
    //image upload
    console.log("-------", file);
    const result = await cloudinary.v2.uploader.upload(
      file.tempFilePath,
      options
    );
    console.log(`File Url : `, result);
    return result;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

export { uploadImage };
