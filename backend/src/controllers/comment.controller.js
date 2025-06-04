import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!videoId || isValidObjectId(videoId)) {
        return new ApiError(400, "Missing or Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "No such video found");
    }

    const comments = await Comment.aggregate([
        // match the comments of the video
        {
            $match: {
                video: mongoose.Types.ObjectId(videoId),
            },
        },
        // populate the user details to it
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "createdBy",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        // convert the createdBy array to object
        {
            $addFields: {
                createdBy: {
                    $first: "$createdBy",
                },
            },
        },
        {
            $unwind: "$createdBy",
        },
        // project the final output
        {
            $project: {
                content: 1,
                createdBy: 1,
            },
        },
        //pagination
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: parseInt(limit),
        },
    ]);

    return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched"));


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    const {content} = req.body;

    if(!videoId || !content || content.trim() === "") {
        throw new ApiError(400, "Video ID and content are required");
    }

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id,
    });

    if (!comment) {
        throw new ApiError(500, "Failed to add comment");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const {content} = req.body;

    if (!commentId || !content || content.trim() === "") {
        throw new ApiError(400, "Comment ID and content are required");
    }

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (!comment.owner.equals(req.user?._id)) {
        throw new ApiError(403, "You are not allowed to update this comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { content },
        { new: true }
    );

    if (!updatedComment) {
        throw new ApiError(500, "Failed to update comment");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;

    if (!commentId || !mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid or missing comment ID");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (!comment.owner.equals(req.user?._id)) {
        throw new ApiError(403, "You are not allowed to delete this comment");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
        throw new ApiError(500, "Failed to delete comment");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }
