//image upload function using cloudinary
import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// Example function to upload an image
async function uploadImage(file, folder,height,quality) {
  try {
    const height=height?height:null
    const quality=quality?quality:null
    const options={height,quality,resource_type:"auto"}
    //image upload
    const result = await cloudinary.v2.uploader.upload(file, options)
    console.log(`File Url : `,result);
    return result;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export { uploadImage };
