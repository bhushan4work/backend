import {v2 as cloudinary} from "cloudinary";
import { response } from "express";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary =  async (localFilePath) => {
    try {
        if(!localFilePath) return null; 
        //else we upload files on cloudinary
        //as upload will take time so 'await'
        const response = await cloudinary.uploader.upload(localFilePath, response.url);
        return response;
        //now file is uploaded successfully
        console.log("upload success"); 
    } catch (error) {
        fs.unlinkSync(localFilePath) //removes locally saved temp file as upload operation fails
        return null; 
    }
}


export {uploadOnCloudinary }