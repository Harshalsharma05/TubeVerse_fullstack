import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist
  if (!(name && description)) {
    throw new ApiError(400, "Both playlist name and description required");
  }

  const existingPlaylist = await Playlist.findOne({
    name,
    owner: req.user?._id,
  });

  if (existingPlaylist) {
    throw new ApiError(400, "A playlist with this name already exists");
  }

  const newPlaylist = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
  });

  if (!newPlaylist) {
    throw new ApiError(400, "Error while creating the playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, newPlaylist, "New Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, "Please provide valid userId");
  }

  const userPlaylists = await Playlist.aggregate([
    {
      $match: {
        owner: mongoose.Types.ObjectId(userId),
      },
    },
    {
      // for owner details
      $lookup: {
        from: "User",
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
      // converting createdBy array to object
      $addFields: {
        createdBy: {
          $arrayElemAt: ["$createdBy", 0],
        },
      },
    },
    // lookup for getting video details
    {
      $lookup: {
        from: "Video",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            // sub pipeline for getting user details of each video document
            $lookup: {
              from: "User",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
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
            // converting owner array to object
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
          {
            // projection at video level
            $project: {
              videoFile: 1,
              title: 1,
              description: 1,
              thumbnail: 1,
              views: 1,
              duration: 1,
              owner: 1,
            },
          },
        ],
      },
    },
    {
      // this is the projection at the outside playlist level (final projection)
      $project: {
        name: 1,
        description: 1,
        videos: 1,
        createdBy: 1,
      },
    },
  ]);

  if (!userPlaylists) {
    throw new ApiError(400, "No playlists found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userPlaylists,
        "All user playlists fetched successfully"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid or missing playlist id");
  }

    const playlistById = await Playlist.aggregate([
        //match the owner's all playlists
        {
            $match: {
                _id: mongoose.Types.ObjectId(playlistId),
            },
        },
        // lookup for getting owner's details
        {
            $lookup: {
                from: "User",
                localField: "owner",
                foreignField: "_id",
                as: "createdBy",
                pipeline: [
                    // projecting user details
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
        // converting the createdBy array to an object
        {
            $addFields: {
                createdBy: {
                    $arrayElemAt: ["$createdBy", 0],
                },
            },
        },
        // this lookup if for videos
        {
            $lookup: {
                from: "Video",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    // further lookup to get the owner details of the video
                    {
                        $lookup: {
                            from: "User",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
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
                    {
                        $addFields: {
                            owner: {
                                $arrayElemAt: ["$owner", 0],
                            },
                        },
                    },
                    // this is the projection for the video level
                    {
                        $project: {
                            title: 1,
                            description: 1,
                            thumbnail: 1,
                            owner: 1,
                            duration: 1,
                            views: 1,
                            createdAt: 1,
                            updatedAt: 1,
                        },
                    },
                ],
            },
        },
        // this projection is outside at the playlist level for the final result
        {
            $project: {
                videos: 1,
                createdBy: 1,
                name: 1,
                description: 1,
            },
        },
    ]);

    if(!playlistById) {
        throw new ApiError(400, "No playlist found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlistById, "Playlist fetched successfully")
    )
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid or missing playlist ID");
    }

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid or missing video ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(400, "No such Playlist found");
    }

    if (!playlist.owner.equals(req.user?._id)) {
        throw new ApiError(403, "You are not allowed to update this playlist");
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in the Playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: videoId
            }
        },
        { new: true }
    );

    if(!updatedPlaylist) {
        throw new ApiError(400, "Error while adding the video to the playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedPlaylist, "Video added to the Playlist")
    )
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid or missing playlist ID");
    }

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid or missing video ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(400, "No such Playlist found");
    }

    if (!playlist.owner.equals(req.user?._id)) {
        throw new ApiError(403, "You are not allowed to remove video from this playlist");
    }

    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video with this id does not exists in this Playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { // to remove the videoId
                videos: videoId
            }
        },
        { new: true }
    );

    if(!updatedPlaylist) {
        throw new ApiError(400, "Error while removing the video from the playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedPlaylist, "Video removed from the Playlist")
    )

});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    // TODO: delete playlist

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Missing or Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(400, "No playlist found with this ID");
    }

    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not allowed to delete this playlist");
    }

    const deletePlaylist = await Playlist.findByIdAndDelete(playlist._id);

    if (!deletePlaylist) {
        throw new ApiError(400, "Error while deleting this playlist");
    }

    return res.status(200).json(new ApiResponse(200, {}, "Playlist Deleted"));
});

const updatePlaylistDetails = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    //TODO: update playlist

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Missing or Invalid playlist ID");
    }

    if (!name || !description) {
        throw new ApiError(400, "All the fields are required");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(400, "No playlist found with this ID");
    }

    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not allowed to update this playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
        $set: {
            name,
            description,
        },
        },
        { new: true }
    );

    if (!updatedPlaylist) {
        throw new ApiError(400, "Error while updating this playlist");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Playlist details updated"));

});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylistDetails,
};
