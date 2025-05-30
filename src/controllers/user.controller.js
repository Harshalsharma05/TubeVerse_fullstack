import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        
        // find user in the db by ID
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // save the refresh token into the db
        user.refreshToken = refreshToken

        // save into the db (save() is the method of mongoose)
        await user.save({ validateBeforeSave: false }) 
        // validateBeforeSave: false means it will not validate the user schema before saving, as we are only updating the refresh token (not the password or other fields that require validation)
        // this is useful when you want to update a field that does not require validation, like refresh token

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating the tokens")
    }
}

// register user logic:
// get the data from frontend and check all the fields if given (validate - not empty)
// check in db if user already exists by email and username or not if yes then just return
// check for images, check for avatar (as required field) 
// upload them to cloudinary, check again if avatar is uploaded because it is required field
// create user object - create entry in db
// remove password and refresh token field from response
// check for user creation
// return response

// why asyncHandler is used?
// asyncHandler is a utility function that wraps asynchronous route handlers to catch errors and pass them to the next middleware, preventing the need for try-catch blocks in every route handler.
const registerUser = asyncHandler( async (req, res) => {
    
    // object destructuring
    const { username, email, fullName, password } = req.body 
    // req.body contains the data sent from the frontend in the request body
    
    // console.log("Request body:", req.body);
    
    // Validate input fields
    if (!username || !email || !fullName || !password) {
        throw new ApiError(400, "All fields are required");
    }

    if(!email.includes("@") || !email.includes(".")) {
        throw new ApiError(400, "Invalid email format");
    }

    // Check if user already exists
    const existedUser = await User.findOne({ // Check if user exists by email or username (returns false if not found)
        $or: [{ email }, { username }] // or operator to check both fields
    })
    
    // console.log("Existed user:", existedUser);
    if(existedUser) {
        throw new ApiError(409, "User already exists with this email or username");
    }

    // console.log("Files in request:", req.files);
    // req.files contains the files uploaded from the frontend, if any

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    // This line safely retrieves the file path of the first uploaded avatar image, or returns undefined if any part of the chain is missing.
    
    // validate avatar image
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required!")
    }

    // const coverImageLocalPath = req.files?.coverImage[0]?.path; // this will throw an error if coverImage is not uploaded
    
    // Using optional chaining to avoid errors if coverImage is not uploaded
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // avatar check again if uploaded or not
    if(!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    //entry in db
    const user = await User.create({
        username,
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // check if coverimage is there or not, if not then leave it empty
    })

    // Manual removal (if you want to avoid the second query) (not recommended)
    // user.password = undefined // remove password from user object
    // user.refreshToken = undefined // remove refreshToken from user object

    // More efficient way to select fields
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


// steps in login
// req body -> data
// username or email
// find the data
// password check
// access and refresh token
// send secure coookie (hhtp only and secure true)

const loginUser = asyncHandler ( async(req, res) => {

    const { username, email, password } = req.body

    // if(!username && !email){
    //     throw new ApiError(400, "Username or email is required")
    // }

    if( !(username || email) ){
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [ {username}, {email} ]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    // here 'user' is the instance we have fetched from the db in the above line this is not the mongoose schema 'User'
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid or wrong password")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = { // secured cookie: by this cookie could be accessed by the backend server only, not the frontend
        httpOnly: true,
        secure: true 
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(201,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler( async(req, res) => {

    const user = await User.findByIdAndUpdate(
        req.user._id, // this is what we have created object (.user) in the verifyJWT in auth middleware
        
        // what to update
        {
            $set: {
                refreshToken: undefined // reset/delete the refreshToken after logging the out
            }
        },
        {   
            new: true
            // By default, findOneAndUpdate() returns the document as it was before update was applied. If you set new: true, findOneAndUpdate() will instead give you the object after update was applied.
        }
    )

    const options = { // by this cookie could be accessed by the backend server only, not the frontend
        httpOnly: true,
        secure: true 
    }

    const loggedInUser = await User.findById(user._id).select("username -_id")

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {loggedInUser}, "User logged out"))
})

const refreshAccessToken = asyncHandler( async(req, res) => {
    
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    // for safety purposes (try-catch) because maybe while decoding token it may throw some error (not neccessary)
    try { 
        const decodedToken = jwt.verify(
            incomingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        // generate new tokens
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
        
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newRefreshToken
                },
                "Access Token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})


export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}
