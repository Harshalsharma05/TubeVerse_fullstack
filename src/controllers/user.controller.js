import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler( async (req, res) => {
    
    const { username, email, fullName, password } = req.body
    
    // console.log("Request body:", req.body);
    
    // Validate input fields
    if (!username || !email || !fullName || !password) {
        throw new ApiError(400, "All fields are required");
    }

    if(!email.includes("@") || !email.includes(".")) {
        throw new ApiError(400, "Invalid email format");
    }

    // Check if user already exists
    const existedUser = User.findOne({ // Check if user exists by email or username
        $or: [{ email }, { username }] // or operator to check both fields
    })
    
    // console.log("Existed user:", existedUser);
    // if(existedUser) {
    //     throw new ApiError(409, "User already exists with this email or username");
    // }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // This line safely retrieves the file path of the first uploaded avatar image, or returns undefined if any part of the chain is missing.
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    // validate avatar image
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required!")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // avatar check again if uploaded or not
    if(!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }


    //entry in db
    const user = await User.create({
        username: username.toLowercase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // check if coverimage is there or not if not then leave it empty
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // .select() allows which fields to send by default all fields are selected if dont want to allow some particular fields just put minus (-) sign before field name

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})


export { registerUser }

// get the data from frontend and check all the fields if given (validate - not empty)
// check in db if user already exists by email and username or not if yes then just return
// check for images, check for avatar (as required field) 
// upload them to cloudinary, check again if avatar is uploaded because it is required field
// create user object - create entry in db
// remove password and refresh token field from response
// check for user creation
// return response