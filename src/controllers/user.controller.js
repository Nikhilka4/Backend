import { asynHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";

const registerUser = asynHandler(async (req, res) => {
    // step - 1: get the data from the request body
    const {fullName, email,username, password} = req.body
    // step - 2: validate the data (empty or wrong data)
    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "Please fill all the fields")
    }
    // step - 3: check user already exists or not (username, email)
    const existingUser = User.findOne({
        $or: [
            {email},
            {username}
        ]
    })

    if(existingUser){
        throw new ApiError(409, "User with email or username already exists")
    }
    // step - 4: check for required files (image, pdf)
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Please upload avatar")
    }
    // step - 5: save the data to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath, "avatars")
    const coverImage = await uploadOnCloudinary(coverImageLocalPath, "cover-images")

    if(!avatar || !coverImage){
        throw new ApiError(400, "Please upload avatar")
    }
    // step - 6: create the user object - create entry in the database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })
    // step - 7: remove password and refresh token field from the response
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    // step - 8: check for user creation
    if(!createdUser){
        throw new ApiError(500, "Something went wrong... User not created!!")
    }
    // step - 9: send the response
    return res.status(201).json(
        new ApiResponce(200, createdUser, "User registered Successfully!!!")
    )
})


export  {registerUser}