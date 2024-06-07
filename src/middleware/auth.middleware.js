import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asynHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

export const verifyJWT = asynHandler(async (req, _, next) => { // here the res is not used so we can use "_"
   try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
 
     if(!token) {
         throw new ApiError(401, "Unauthorized request");
     }
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
 
     const user = await User.findById(decodedToken?._Id).select("-password -refreshToken");
     
     if(!user) {
         throw new ApiError(401, "Invalid Access token");
     }
 
     req.user = user;
     next();
   } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access token");
   } 

})