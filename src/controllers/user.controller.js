import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // step - 1: get the data from the request body
  const { fullName, email, username, password } = req.body;
  // step - 2: validate the data (empty or wrong data)
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Please fill all the fields");
  }
  // step - 3: check user already exists or not (username, email)
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  // step - 4: check for required files (image, pdf)
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Please upload avatar");
  }
  // step - 5: save the data to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath, "avatars");
  const coverImage = await uploadOnCloudinary(
    coverImageLocalPath,
    "cover-images"
  );

  if (!avatar) {
    throw new ApiError(400, "Please upload avatar");
  }
  // step - 6: create the user object - create entry in the database
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  // step - 7: remove password and refresh token field from the response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // step - 8: check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong... User not created!!");
  }
  // step - 9: send the response
  return res
    .status(201)
    .json(new ApiResponce(200, createdUser, "User registered Successfully!!!"));
});

const loginUser = asyncHandler(async (req, res) => {
  // step - 1: get the data from the request body
  const { email, username, password } = req.body;
  // step - 2: validate the user through email or username and password
  if (!(username || email)) {
    throw new ApiError(400, "Please provide email or username");
  }
  // step - 3: check whether the user exists or not
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }
  // step - 4: check for the password
  const isPasswordMatched = await user.isPasswordCorrect(password);

  if (!isPasswordMatched) {
    throw new ApiError(401, "Invalid password");
  }
  // step - 5: generate the access token and refresh token and send it to the user
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  // step - 6: send the tokens in the form of cookies (secure cookies)
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    // expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    httpOnly: true,
    secure: true,
  };
  // step - 7: send the response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponce(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully!!!"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // step - 1: get the refresh token from the cookies
  await User.findByIdAndUpdate(req.user._id, 
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
        new: true,
    }
  );

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponce(200,{}, "User logged out successfully!!!"))
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401, "unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?._id)
  
    if(!user){
      throw new ApiError(401, "Invalid Refresh Token")
    }
  
    if(incomingRefreshToken !== user.refreshToken){
      throw new ApiError(401, "Refresh Token is expired or invalid")
    }
  
    const options = {
      httpOnly: true,
      secure: true,
    }
  
    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)
    
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponce(200,{accessToken, refreshToken: newRefreshToken}, "Access token refreshed successfully!!!"))
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Please provide both old and new password");
  }

  const user = await User.findById(req.user._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save({validateBeforeSave: false});

  return res
  .status(200)
  .json(new ApiResponce(
    200, {},
     "Password changed successfully"
    ));
})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponce(
      200, {
        user: req.user,
      },
       "User fetched successfully"
       ));
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "Please provide both full name and email");
  }

  const user = await User.findById(
    req.user._id,
    {
      $set:{
        fullName,
        email,
      }
    },
    {
      new: true,
    }
  ).select("-password")

  return res
    .status(200)
    .json(new ApiResponce(
      200, 
      user,
      "Account details updated successfully"
      ));
})

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if(!avatar.url) {
    throw new ApiError(400, "Failed to upload avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id, {
        $set:{
          avatar: avatar.url,
        }
      }, {
      new: true,
    }).select("-password")

    res
    .status(200)
    .json(new ApiResponce(
      200, user, "Avatar updated successfully"
      ));
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path

  if(!coverImageLocalPath){
    throw new ApiError(400, "cover image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if(!coverImage.url) {
    throw new ApiError(400, "Failed to upload coverImage");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id, {
        $set:{
          coverImage: coverImage.url,
        }
      }, {
      new: true,
    }).select("-password")

    res
    .status(200)
    .json(new ApiResponce(
      200, user,"Cover image updated successfully"
      ));
})


const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if(!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      }
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribedTo.subscriber"],
            },
            then: true,
            else: false,
          }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      }
    }
  ])

  if(!channel?.length) {
    throw new ApiError(404, "channel not found");
  }

  return res
    .status(200)
    .json(new ApiResponce(
      200, channel[0], "Channel profile fetched successfully"
      ));
})
// const forgotPassword = asyncHandler(async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     throw new ApiError(400, "Please provide a valid email");
//   }

//   const user = await User.findOne({ email });

//   if (!user) {
//     throw new ApiError(404, "No user found with this email");
//   }

// })

export { 
  registerUser, 
  loginUser, 
  logoutUser, 
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
 };
