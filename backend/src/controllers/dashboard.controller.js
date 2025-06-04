import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId= req.user?._id // by default, it will return the integer value of the user id

    const videoCount = await Video.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null, // get sum for whole channel(all videos combined)
                totalViews: { // will calculate the total combined views 
                    $sum: "$views"
                },
                totalVideos: { // will get total videos uploaded by user
                    $sum: 1
                }
                
            }
        },
        {
            $project: {
                _id: 0, // exclude the id field from the output
                totalVideos: 1,
                totalViews: 1
            }
        },
    ]);

    const subscriberCount = await Subscription.aggregate([
        {
            $match: {
                channel: mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: { 
                _id: null, // All documents are grouped into a single group
                totalSubscribers: {
                    $sum: 1 // count of all documents in this group
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalSubscribers: 1,
            }
        }
    ]);

    const likeCount = await Like.aggregate([
        {
            $lookup: {
                from: "Video",
                localField: "video",
                foreignField: "_id",
                as: "videoInfo"
            }
        },
        {
            $match: {
                "videoInfo.owner": userId
            }
        },
        {
            $group: {
                _id: null, // All documents are grouped into a single group
                totalLikes: {
                    $sum: 1 // count of all documents in this group
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalLikes: 1
            }
        }
    ]);

    const allStats = {
        totalViews: videoCount[0]?.totalViews || 0,
        totalVideos: videoCount[0]?.totalVideos || 0,
        totalSubscribers: subscriberCount[0]?.totalSubscribers || 0,
        totalLikes: likeCount[0]?.totalLikes || 0
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            allStats,
            "Channel stats fetched successfully"
        )
    )

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user?._id

    const videos = await Video.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                owner: 1,
                createdAt: 1,
                updatedAt: 1,
            }
        }
    ]);

    if(!videos) {
        throw new ApiError(500, "Failed to fetch videos")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videos[0] ? videos[0] : 0, // if no videos then return 0
            "All channel videos fetched successfully"
        )
    )

})

export {
    getChannelStats, 
    getChannelVideos
    }