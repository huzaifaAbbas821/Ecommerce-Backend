// import  fs  from "fs";
// import {v2 as cloudinary} from "cloudinary"


// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY__CLOUD_NAME,
//     api_key: process.env.CLOUDINARY__API_KEY,
//     api_secret:process.env.CLOUDINARY__API_SECRET,

// })

// const uploadCloudinary = async (localFilePath) => {
//     try {
//         if(!localFilePath) return null;
//         // upload file
//         const response = await cloudinary.uploader.upload(localFilePath , {
//             resource_type: "auto"
//         })
//         //   console.log("File is Uploaded on Cloudinary", response.url)
//         fs.unlinkSync(localFilePath);  
//         return response;


//     } catch (error) {
    
//         fs.unlinkSync(localFilePath);
        
        
//     }
// }

// export {uploadCloudinary}


import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY__CLOUD_NAME,
    api_key: process.env.CLOUDINARY__API_KEY,
    api_secret: process.env.CLOUDINARY__API_SECRET,
});

const uploadCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            resource_type: "auto",
            // folder: "your_folder_name", // Optionally, specify a folder in Cloudinary
        };

        const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error) {
                reject(new Error("Issue while uploading to Cloudinary"));
            } else {
                resolve(result);
            }
        });

        uploadStream.end(fileBuffer);
    });
};

export { uploadCloudinary };
