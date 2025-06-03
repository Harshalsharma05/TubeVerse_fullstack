import {v2 as cloudinary} from "cloudinary"
import { log } from "console";
import fs from "fs"
import { ApiError } from "./ApiError.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        // upload on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto"
        })
        // file uploaded successfully
        fs.unlinkSync(localFilePath)

        console.log("File is uploaded on cloudinary! ", response.url);
        // console.log("Full response from cloudinary: ", response);
        
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved file on the server if not uploaded
        return null;
    }    
}

const deleteFromCloudinary = async(cloudUrl) => {
    try {

        if(!cloudUrl) return null;

        // Extract the public ID from the URL
        const parts = cloudUrl.split("/");
        const fileWithExtension = parts[parts.length - 1];
        const publicId = fileWithExtension.split(".")[0];

        const response = await cloudinary.uploader.destroy(publicId);

        console.log("Old File deleted successfully from cloudinary");
        
        return response;

        
    } catch (error) {
        throw new ApiError(500, {}, "Something went wrong while deleting old image from cloudinary")
    }
}

const deleteVideoFromCloudinary = async (cloudUrl) => {
  try {
    // Extract the public ID from the URL
    const urlParts = cloudUrl.split("/");
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExtension.split(".")[0];

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
    console.log("Deleted:", result);

    return result;
    
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary,deleteVideoFromCloudinary }