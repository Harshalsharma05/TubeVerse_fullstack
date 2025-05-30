import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

// here res in not used anywhere so we can replace it with underscore (_) (good practice)
export const verifyJWT = asyncHandler( async(req, _, next) => { 
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") // because genreally token is written as Bearer token (so remove the Bearer and the space part)
    
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user; // manually created new obj named .user in the req
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})