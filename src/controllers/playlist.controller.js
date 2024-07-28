import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//*********************************************************************************//
//@dec create a playList
const createPlaylist = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user?._id;
  //TODO: create playlist
  if (!(title, description)) {
    throw new ApiError(400, "fill the field");
  }
  if (!userId) {
    throw new ApiError(400, "u can't create playlist u should login first");
  }
  const createPlaylist = await Playlist.create({
    title,
    description,
    owner: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, createPlaylist, "playlist created"));
});
//*********************************************************************************//
//@dec getUserPlaylists
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  const getPlayList = await Playlist.findOne({ owner: userId });

  return res
    .status(200)
    .json(new ApiResponse(200, getPlayList, "Playlist fetched successfully"));
});
//*********************************************************************************//
//@dec getPlaylistById
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "id is not valid");
  }

  const findPlayList = await Playlist.findById(playlistId);
  if (!findPlayList) {
    throw new ApiError(500, "playlist not available");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, findPlayList, "playList fetched by Id successfully")
    );
});
//*********************************************************************************//
//@dec addVideoToPlaylist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(500, "playlist is not available");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(500, "video is not available");
  }
  const addVideoToPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
    videos: [videoId],
  });
  return res
    .status(200)
    .json(new ApiResponse(200, addVideoToPlaylist, "video added to playlist"));
});
//*********************************************************************************//
//@dec removeVideoFromPlaylist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(500, "playlist is not available");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(500, "video is not available");
  }
  const removeVideoFromPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
    $unset: { videos: videoId },
  });
  return res
    .status(200)
    .json(
      new ApiResponse(200, removeVideoFromPlaylist, "video removed to playlist")
    );
});
//********************************************************************************//
//@dec  deletePlaylist
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(500, "playlist is not available");
  }
  const playlist = await Playlist.findByIdAndDelete(playlistId);
  return res
    .status(200)
    .json(new ApiResponse(200, "playlist deleted successfully"));
});
//********************************************************************************//
//@dec  updatePlaylist
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(500, "id is not valid");
  }
  const playlist = await Playlist.findByIdAndUpdate(playlistId, {
    name,
    description,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
