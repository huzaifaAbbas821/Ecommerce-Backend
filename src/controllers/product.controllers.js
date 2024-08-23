import { Product } from "../models/product.model.js";
import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadCloudinary } from "../models/cloudinary.js";
import fs from 'fs';
import path from 'path';


  const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({});
    if (!products || products.length === 0) {
      throw new ApiError(404, "No products found");
    }
    res.status(200).json(new ApiResponse(200, "Products fetched successfully", products));
  });

const createProduct = asyncHandler(async (req, res) => {
  const { title ,description,  price,  category  , stock} = req.body;
  if ([title, description, category].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Data missing");
  }

  if (!price || !stock) {
    throw new ApiError(400, "Data missing");
  }

  if (!req.file) {
    throw new ApiError(400, "Image is missing");
  }

  const imageBuffer = req.file.buffer; // Get the file buffer from memory

  const uploadOptions = {
    resource_type: "auto",
    // folder: "your_folder_name", // Optionally, specify a folder in Cloudinary
  };

  const image = await cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
    if (error) throw new ApiError(500, "Issue while uploading to Cloudinary");
    return result;
  }).end(imageBuffer);

  if (!image) {
    throw new ApiError(500, "Issue while uploading");
  }


  // const image = await uploadCloudinary(imageLocalPath);
  // if (!image) {
  //   throw new ApiError(500, "Issue while uploading");
  // }

  // fs.unlink(imageLocalPath, (err) => {
  //   if (err) {
  //     console.error(`Failed to delete local image: ${imageLocalPath}`, err);
  //   } else {
  //     console.log(`Successfully deleted local image: ${imageLocalPath}`);
  //   }
  // });

  const newProduct = await Product.create({
    title,
    description:description,
    price,
    category,
    stock,
    featuredImage: image.url,
    owner: req.user._id,
  });

  return res.status(200).json(new ApiResponse(200, "Product created successfully", newProduct));
});

const getProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  res.status(200).json(new ApiResponse(200, "Product fetched successfully", product));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  await Product.deleteOne({ _id: id });

  res.status(200).json(new ApiResponse(200, "Product deleted successfully"));
});

const soldAndRating = asyncHandler(async(req,res) => {

  const { id, rate } = req.body;
  const userId = req.user._id; // Assuming you have user info in req.user
  
  const product = await Product.findById(id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const existingRating = product.ratings.find(r => r.userId.toString() === userId.toString());
  
  if (existingRating) {
    return res.status(400).json({ error: 'You have already rated this product' });
  }
  console.log(product.ratings.rating);
  
  let newRate = product.ratings.rating || 0 + rate;

  // Add new rating and increment sold count
  product.ratings.push({ userId, rating:newRate });
  product.sold += 1;
  
  await product.save();
  
  res.status(200).json(product);
  

})


export { createProduct, getProduct, deleteProduct , getAllProducts , soldAndRating};
