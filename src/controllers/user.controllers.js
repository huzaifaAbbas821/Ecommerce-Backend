import asyncHandler from "express-async-handler";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Server error access and refresh token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "Fields are missing");
  }

  const userExists = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (userExists) {
    return res.status(400).json(new ApiError(400,"username or email Already exists"))
    // throw new ApiError(400, "User Already Exists");
  }

  const createUser = await User.create({
    username,
    email,
    password,
  });

  if (!createUser) {
    throw new ApiError(500, "Server Error");
  }

  return res.status(200).json(new ApiResponse(200, "User Created", createUser));
});
// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(401).json(new ApiError(401,"All Fields are mandatory"));
  }

  const userExists = await User.findOne({ email });
  if (!userExists) {
    return res.status(404).json(new ApiError(404,"Account does not exist"));
  }

  const isCorrect = await userExists.isPasswordCorrect(password);
  if (!isCorrect) {
    return res.status(402).json(new ApiError(402,"Password is incorrect"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    userExists._id
  );
  const loggedInUser = await User.findById(userExists._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "Successfully logged in", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "LogOut Successfully", {}));
});

const saveProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const user = req.user;
  const newUser = await User.findByIdAndUpdate(
    user._id,
    { $addToSet: { saveData: id } },
    { new: true }
  );
  res
    .status(200)
    .json(new ApiResponse(200, "Product save Successfully", newUser.saveData));
});

const watchhistory = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const user = req.user;
  const newUser = await User.findByIdAndUpdate(
    user._id,
    { $addToSet: { watchHistory: id } },
    { new: true }
  );
  res
    .status(200)
    .json(
      new ApiResponse(200, "Product save Successfully", newUser.watchHistory)
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const iscorrectRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;
  if (!iscorrectRefreshToken) {
    throw new ApiError(401, "unAuthorized Token");
  }
  try {
    const checkToken = jwt.verify(
      iscorrectRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!checkToken) throw new ApiError(401, "Wrong token");

    const user = await User.findById(checkToken._id);
    if (!user) {
      throw new ApiError("invalid refresh token");
    }
    if (iscorrectRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(200, "token refresh Succesfully", {
          accessToken,
          refreshToken: newRefreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(401, error.message || "invalid refresh token");
  }
});

const getSavedProducts = asyncHandler(async (req, res) => {
  const user = req.user;

  const populatedUser = await User.findById(user._id).populate("saveData");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Saved products fetched successfully",
        populatedUser.saveData
      )
    );
});
const getWatchedProducts = asyncHandler(async (req, res) => {
  const user = req.user;

  const populatedUser = await User.findById(user._id).populate("watchHistory");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "watch products fetched successfully",
        populatedUser.watchHistory
      )
    );
});

const userChangePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const check = await user.isPasswordCorrect(oldPassword);
  if(!check){
    throw new ApiError(401, "password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, "password changes Succesfully", {}));
});

const changeUserInfo = asyncHandler(async (req, res) => {
  const { username, email } = req.body;
  if (!username || !email) {
    throw new ApiError(400, "fields are missing");
  }

  const user = await User.findOneAndUpdate(
    req.user._id,
    {
      $set: { username, email },
    },
    {
      new: true,
    }
  ).select("-password");
  res
    .status(200)
    .json(new ApiResponse(200, "User Info changes Succesfully", user));
});

const getCurrentuser = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, "current User", req.user));
});

const getAllBuyProducts = asyncHandler(async (req, res) => {
  const user = req.user;
  const Populatebuy = await User.findById(user._id).populate("buyDetails");
  res.status(200).json(new ApiResponse(200, "Bought Products", Populatebuy));
});

const buyHistory = asyncHandler(async (req, res) => {
  const productIds = req.body;  // Assuming req.body is an array of product IDs
  const user = req.user;

  if (!Array.isArray(productIds)) {
    return res.status(400).json(new ApiResponse(400, "Invalid product IDs format"));
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $addToSet: { buyDetails: { $each: productIds } } },  // Use $each with $addToSet
      { new: true }
    );
    
    res.status(200).json(new ApiResponse(200, "Product Added Successfully", updatedUser));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, "Error adding products", error.message));
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { password } = req.body; // Extract the password from req.body
  const user = req.user; // Assuming req.user is set correctly by your authentication middleware

  if (!user || !password) {
    throw new ApiError( 400, "User and password are required");
  }
  
  // Delete the user account
  await User.findByIdAndDelete(user._id);
  
  res.status(200).json({
    status: 200,
    message: "Account deleted successfully"
  });
});


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  userChangePassword,
  getCurrentuser,
  changeUserInfo,
  saveProduct,
  watchhistory,
  getSavedProducts,
  getWatchedProducts,
  getAllBuyProducts,
  buyHistory,
  deleteUser
};
