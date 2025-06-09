import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if(!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Missing or invalid VideoId")
    }

    const userId = req.user?._id

    // get existing like document if was there
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId 
    })

    let liked;
    if(existingLike){
        // unlike the video
        const deletedLike = await existingLike.deleteOne();
        // removes this document from db

        if (!deletedLike) {
            throw new ApiError(500, "Failed to unlike the video");
        }

        liked = false; // unlike so false
    } else {

        // like the video
        const newLike = await Like.create({
            video: videoId,
            likedBy: userId
        })

        if(!newLike) {
            throw new ApiError(500, "Failed to like the video");
        }

        liked = true; 
    }

    const totalLikes = await Like.countDocuments({
        video: videoId
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            { videoId, liked, totalLikes },
            liked ? "Video liked successfully" : "Video unliked successfully"
        )
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!commentId || isValidObjectId(commentId)) {
        throw new ApiError(400, "Missing or Invalid comment id");
    }

    const userID = req.user?._id;

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userID,
    });

    let liked;
    if (existingLike) {
        //unlike the comment if already liked
        const deletedCommentLike = await existingLike.deleteOne();

        if (!deletedCommentLike) {
            throw new ApiError(500, "Failed to unlike the comment");
        }
        liked = false;

    } else {
        // like the comment

        const likedCommentLike = await Like.create({
            comment: commentId,
            likedBy: userID,
        });

        if (!likedCommentLike) {
            throw new ApiError(500, "Failed to like the comment");
        }
        liked = true;
    }

    const totalLikes = await Like.countDocuments({ comment: commentId });

    return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { commentId, liked, totalLikes },
        liked ? "Comment liked successfully" : "Comment unliked successfully"
      )
    );
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if (!tweetId || isValidObjectId(tweetId)) {
        throw new ApiError(400, "Missing or Invalid tweet id");
    }

    const userID = req.user?._id;

    const existingLike = await Like.findById({
        tweet: tweetId,
        likedBy: userID,
    });

    let liked;
    if (existingLike) {
        //unlike the tweet if already liked
        const deleteTweetLike = await existingLike.deleteOne();

        if (!deleteTweetLike) {
            throw new ApiError(500, "Failed to unlike the tweet");
        }
        liked = false;

    } else {
        //like the tweet
        const likedTweetLike = await Like.create({
            tweet: tweetId,
            likedBy: userID,
        });

        if (!likedTweetLike) {
            throw new ApiError(500, "Failed to like the tweet");
        }
        liked = true;
    }

    const totalLikes = await Like.countDocuments({ tweet: tweetId });

    return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { tweetId, liked, totalLikes },
        liked ? "Tweet liked successfully" : "Tweet unliked successfully"
      )
    );
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id;

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: userId,
                video: { $exists: true, $ne: null } // Ensure it's a video like
            }    
        },
        { // to get the video document
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [ // here we are at video document
                    {
                        $lookup: {
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
                        $addFields: { // this will add the owner field to the video document
                            createdBy: {
                                $first: "$createdBy" // since owner is an array, we take the first element
                                // this will store it directly as an object
                            }
                        }
                    },
                    {
                        $project: {
                            title: 1,
                            description: 1,
                            duration: 1,
                            thumbnail: 1,
                            videoFile: 1,
                            views: 1,
                            createdAt: 1,
                            createdBy: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$video", // unwind the video array to just object (so can be accssed directly as video.title, video.description, etc.)
            }
        },
        {
            $project: {
                video: 1,
                likedBy: 1,
            }
        }
    ])

    if (!likedVideos) {
        throw new ApiError(400, "Failed to fetch liked videos");
    }

    return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Successfully fetech liked videos")
    );
})

const countVideoLikes = asyncHandler(async (req, res) => {
    const {videoId} = req.params;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Missing or invalid video ID");
    }

    const totalLikes = await Like.countDocuments({
        video: videoId
    });

    // if (!totalLikes) {
    //     throw new ApiError(500, "Failed to count video likes");
    // }

    return res
    .status(200)
    .json(
        new ApiResponse(200, { videoId, totalLikes }, "Successfully counted video likes")
    );
})
export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    countVideoLikes
}