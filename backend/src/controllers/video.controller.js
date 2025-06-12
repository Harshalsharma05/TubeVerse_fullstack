import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteVideoFromCloudinary,
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy,
    sortType,
    userId = req.user?._id,
  } = req.query;
  //TODO: get all videos based on query, sort, pagination

  let finalSortBy = sortBy && sortBy.trim() !== "" ? sortBy : "createdAt";
  let finalSortType = sortType === "asc" ? 1 : -1;

  // steps
  // use match for query on the basis of title or description or i think we can do channel also
  // perfom lookup for the user details for the video like username, avatar, etc
  // project the details of the user
  // use sort to sort the videos
  // for pagination use page and limit to calculate skip and limit
  const allVideos = await Video.aggregate([
    //match stage for filtering
    {
      $match: {
        $or: [
          { title: { $regex: query || "", $options: "i" } },
          { description: { $regex: query || "", $options: "i" } },
        ],
      },
    },
    // lookup to fetch owner details
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
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        createdBy: {
          $first: "$createdBy",
        },
      },
    },
    {
      $project: {
        thumbnail: 1,
        videoFile: 1,
        duration: 1,
        views: 1,
        title: 1,
        description: 1,
        createdBy: 1,
        createdAt: 1,
      },
    },
    // sorting
    {
      $sort: {
        [finalSortBy]: finalSortType === "asc" ? 1 : -1,
      },
    },
    //pagination
    {
      $skip: (page - 1) * limit, // Tells the database how many items to ignore (skip) from the start.
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  if (!allVideos?.length) {
    throw new ApiError(404, "No videos found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, allVideos, "All videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (!title || !description) {
    throw new ApiError(400, "Give atleast one detail of a video!");
  }

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  let videoFile;
  try {
    videoFile = await uploadOnCloudinary(videoFileLocalPath);
    console.log("uploaded video: ", videoFile);
  } catch (error) {
    console.log("Error uploading video ", error);
    throw new ApiError(500, "Failed to upload video");
  }

  let thumbnailFile;
  try {
    thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);
    console.log("uploaded thumbnail: ", thumbnailFile);
  } catch (error) {
    console.log("Error uploading thumbnail ", error);
    throw new ApiError(500, "Failed to upload thumbnail");
  }

  try {
    const video = await Video.create({
      videoFile: videoFile.url,
      thumbnail: thumbnailFile.url,
      title,
      description,
      duration: videoFile.duration,
      owner: req.user?._id,
    });

    if (!video) {
      throw new ApiError(500, "Something went wrong while uploading a video");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, video, "Video uploaded successfully"));
  } catch (error) {
    console.log("Error while uploading a video", error);

    if (videoFile) {
      await deleteVideoFromCloudinary(videoFile.public_id);
    }

    if (thumbnailFile) {
      await deleteFromCloudinary(thumbnailFile.public_id);
    }

    throw new ApiError(
      500,
      "Something went wrong while uploading the video and video file and thumbnail deleted"
    );
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "VideoId is not valid");
  }

  const video = await Video.findById(videoId).populate(
    "owner",
    "fullName username avatar"
  ); // replaces the owner ObjectId with the actual user document, but only includes the fullName, username, and avatar fields from the user.

  // The video object you get will have an owner field containing user details (not just the ObjectId

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail

  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "VideoId is not valid");
  }

  const newThumbnailLocalPath = req.file?.path;

  if (!newThumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  // check that only owner of the video can update his video details
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (!video.owner.equals(req.user?._id)) {
    throw new ApiError(401, "You cant update other's video");
  }

  // upload on cloudinary
  const newThumbnail = await uploadOnCloudinary(newThumbnailLocalPath);

  if (!newThumbnail.url) {
    throw new ApiError(400, "Error while uploading on cloudinary");
  }

  // delete old thumbnail from cloudinary
  try {
    await deleteVideoFromCloudinary(video.thumbnail);
  } catch (error) {
    throw new ApiError(500, "Error while deleting old thumbnail");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    req.user?._id,
    {
      title,
      description,
      thumbnail: newThumbnail.url,
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "Video details updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "VideoId is not valid");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  if (!video.owner.equals(req.user?._id)) {
    throw new ApiError("401", "Cant delete other's video");
  }

  // delete from cloudinary
  const deletedVideoFile = await deleteVideoFromCloudinary(video.videoFile);

  if (!deletedVideoFile || deletedVideoFile?.result !== "ok") {
    throw new ApiError(500, "Error while deleting video");
  }

  const deletedThumbnailFile = await deleteFromCloudinary(video.thumbnail);

  if (!deletedThumbnailFile || deletedThumbnailFile?.result !== "ok") {
    throw new ApiError(500, "Error while deleting thumbnail");
  }

  // delete document from the database
  const deletedVideo = await Video.findByIdAndDelete(videoId);

  if (!deletedVideo) {
    throw new ApiError(500, "Error while deleting the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || mongoose.Types.isValidObjectId(videoId)) {
    throw new ApiError(400, "VideoId is not valid");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(500, "Video not found");
  }

  if (!video.owner.equals(req.user._id)) {
    throw new ApiError(
      403,
      "You are not allowed to update another user's video"
    );
  }

  const publishStatus = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished, // toggle
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, publishStatus, "Publish Status modified"));
});

const incrementViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const alreadyWatched = user.watchHistory.some(
    (id) => id.toString() === videoId.toString()
  );

  let video;
  if (!alreadyWatched) {
    // Increment views and add to watch history
    video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    );
    await User.findByIdAndUpdate(userId, {
      $addToSet: { watchHistory: videoId },
    });
  } else {
    video = await Video.findById(videoId);
  }

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { views: video.views }, "View count updated"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  incrementViews,
};
