import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"
import { subscribe } from "diagnostics_channel";
import { log } from "console";
import mongoose, { isValidObjectId } from "mongoose";


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
const registerUser = asyncHandler(async (req, res) => {
    
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

const loginUser = asyncHandler(async(req, res) => {

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

const logoutUser = asyncHandler(async(req, res) => {

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

const refreshAccessToken = asyncHandler(async(req, res) => {
    
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

const changeCurrentPassword = asyncHandler(async(req, res) => {
    
    const {oldPassword, newPassword, confirmPassword} = req.body

    if(newPassword !== confirmPassword) {
        throw new ApiError(401, "New and Confirm password should be same")
    }

    const user = await User.findById(req.user?._id)

    const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isOldPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false}) // save the new password in the db

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "current user fetched successfully")
    )
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async(req, res) => {

    const avatarLocalPath = req.file?.path // here we requesting only one file so req.file (not files as above)

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    // upload new avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url) {
        throw new ApiError(400, "Error while uploading on cloudinary")
    }

    // delete old image from the cloudinary
    const currentUser = await User.findById(req.user?._id);
    if(currentUser.avatar) {

        // Extract public_id from the URL
        // const parts = currentUser.avatar.split("/");
        // const fileWithExt = parts[parts.length - 1];
        // const publicId = fileWithExt.split(".")[0];

        await deleteFromCloudinary(avatar)
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            avatar: avatar.url
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "User avatar updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {

    const coverImageLocalPath = req.file?.path // here we requesting only one file so req.file (not files as above)

    if(!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url) {
        throw new ApiError(400, "Error while uploading on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            coverImage: coverImage.url
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "User Cover-Image updated successfully")
    )

})


const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if(!username?.trim()) {
        throw new ApiError(400, "Username is missing")
    }

    // aggregate pipelines
    const channel = await User.aggregate([
        {
            $match: { // filter all the documents acc to username
                username: username?.toLowerCase() // in this case, we are matching only a single user by username so the channel array will have only 1 element or empty (if channel doesn't exist)
            }
        },
        {   
            // for how many subscribers channel has
            $lookup: { // left outer join with the subscription table with 'channel' in the subscription table
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            // how many channels i have subscribed to
            $lookup: { 
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            // add new fields to the User schema
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers" // it is a field so put '$' sign before it
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]}, // it checks if the current user ID is in the subscribers object
                        then: true,
                        else: false
                    }
                }
            }
        },
        {   
            // which fields to display (similar to select operator in mysql)
            // just set the flags of req flags to 1
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                createdAt: 1
            }
        }
    ])

    // console.log("Channel: ", channel); // will return the channel array

    if(!channel?.length) {
        throw new ApiError(404, "Channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})


const getWatchHistory = asyncHandler(async(req, res) => {

    const user = await User.aggregate([
        {
            $match: {
                // _id: new mongoose.Types.ObjectId(req.user._id)
                _id: typeof req.user._id === "string" ? mongoose.Types.ObjectId(req.user._id) : req.user._id
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [ // for each video in the watchHistory array, we will get the owner details
                    {
                        $lookup: { // here we are at the videos table
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "createdBy",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            createdBy: {
                                $first: "$createdBy" // it will return the first element of the owner array (watchHistory is an array of videos, and each video has an owner which is an array of users)
                                // so we are getting the first element of the owner array
                            }
                        }
                    }
                ]
            }
        },
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            user[0].watchHistory, 
            "User watch history fetched successfully"
        )
    )
})


const addToWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Add video to watch history if not already present
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $addToSet: { watchHistory: videoId } // $addToSet only adds if not already present
        },
        { new: true }
    );

    if (!user) {
        throw new ApiError(500, "Failed to update watch history");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Added to watch history"
            )
        );
});


const clearWatchHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Clear watch history by setting it to an empty array
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: { watchHistory: [] } // Set watchHistory to an empty array
        },
        { new: true });

    if (!user) {
        throw new ApiError(500, "Failed to clear watch history");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Watch history cleared successfully"
            )
    );
});

const clearAVideoFromWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    // Remove video from watch history
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $pull: { watchHistory: videoId } // $pull removes the specified value from an array
        },
        { new: true }
    );

    if (!user) {
        throw new ApiError(500, "Failed to remove video from watch history");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Video removed from watch history"
            )
        );
});

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
    getUserChannelProfile,
    getWatchHistory,
    addToWatchHistory,
    clearWatchHistory,
    clearAVideoFromWatchHistory
}
