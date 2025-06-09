import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";

const getChannelStatsByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if( !userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    // const userId = await User.findOne({ username: username.toLowerCase() }).select("_id");

    const videoCount = await Video.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $group: {
            _id: null, // get sum for whole channel(all videos combined)
            totalViews: {
              // will calculate the total combined views
              $sum: "$views",
            },
            totalVideos: {
              // will get total videos uploaded by user
              $sum: 1,
            },
          },
        },
        {
          $project: {
            _id: 0, // exclude the id field from the output
            totalVideos: 1,
            totalViews: 1,
          },
        },
      ]);
    
    const subscriberCount = await Subscription.aggregate([
    {
        $match: {
        channel: new mongoose.Types.ObjectId(userId),
        },
    },
    {
        $group: {
        _id: null, // All documents are grouped into a single group
        totalSubscribers: {
            $sum: 1, // count of all documents in this group
        },
        },
    },
    {
        $project: {
        _id: 0,
        totalSubscribers: 1,
        },
    },
    ]);
    
    const likeCount = await Like.aggregate([
    {
        $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoInfo",
        },
    },
    {
        $match: {
        "videoInfo.owner": userId,
        },
    },
    {
        $group: {
        _id: null, // All documents are grouped into a single group
        totalLikes: {
            $sum: 1, // count of all documents in this group
        },
        },
    },
    {
        $project: {
        _id: 0,
        totalLikes: 1,
        },
    },
    ]);
    
    const videos = await Video.aggregate([
        {
            $match: {
            owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails",
            pipeline: [
                {
                $project: {
                    avatar: 1,
                    fullName: 1,
                    username: 1,
                },
                },
            ],
            },
        },
        {
            $addFields: {
            createdBy: { $first: "$ownerDetails" },
            },
        },
        {
            $project: {
            videoFile: 1,
            thumbnail: 1,
            title: 1,
            duration: 1,
            views: 1,
            isPublished: 1,
            createdBy: 1, // now contains avatar, fullname, username
            createdAt: 1,
            updatedAt: 1,
            },
        },
    ]);

    if (!videos) {
    throw new ApiError(500, "Failed to fetch videos");
    }

    const allStats = {
        video: videos || [], // include the videos in the stats response
        totalViews: videoCount[0]?.totalViews || 0,
        totalVideos: videoCount[0]?.totalVideos || 0,
        totalSubscribers: subscriberCount[0]?.totalSubscribers || 0,
        totalLikes: likeCount[0]?.totalLikes || 0,
    };
    
    return res
    .status(200)
    .json(new ApiResponse(200, allStats, "Channel stats fetched successfully"));
})


export { getChannelStatsByUserId };