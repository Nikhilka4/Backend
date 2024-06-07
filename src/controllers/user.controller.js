import { asynHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";

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

const registerUser = asynHandler(async (req, res) => {
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

const loginUser = asynHandler(async (req, res) => {
  // step - 1: get the data from the request body
  const { email, username, password } = req.body;
  // step - 2: validate the user through email or username and password
  if (!username || !email) {
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

const logoutUser = asynHandler(async (req, res) => {
  // step - 1: get the refresh token from the cookies
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  },
    {
        new: true,
    });

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponce(200,{}, "User logged out successfully!!!"))
});

export { registerUser, loginUser, logoutUser };
