import  fs  from "fs";
import {v2 as cloudinary} from "cloudinary"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY__CLOUD_NAME,
    api_key: process.env.CLOUDINARY__API_KEY,
    api_secret:process.env.CLOUDINARY__API_SECRET,

})

const uploadCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        // upload file
        const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type: "auto"
        })
        //   console.log("File is Uploaded on Cloudinary", response.url)
        fs.unlinkSync(localFilePath);  
        return response;


    } catch (error) {
    
        fs.unlinkSync(localFilePath);
        
        
    }
}

export {uploadCloudinary}