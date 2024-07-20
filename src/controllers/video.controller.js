import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//******************************************************************************//
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

//******************************************************************************//
//@dec publish video
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!(title, description)) {
    throw new ApiError(400, "title and description are required");
  }

  // Ensure thumbnail is provided
  let thumbnailLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
  }

  // Ensure video is provided
  let videoLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.videoTitle) &&
    req.files.videoTitle.length > 0
  ) {
    videoLocalPath = req.files.videoTitle[0].path;
  }

  if (!videoLocalPath) {
    throw new ApiError(400, "video not available");
  }
  // Upload thumbnail to Cloudinary
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  // Upload video to Cloudinary
  const videoTitle = await uploadOnCloudinary(videoLocalPath);

  if (!videoTitle) {
    throw new ApiError(400, "video not available on cloudinary");
  }

  const videoFile = await Video.create({
    title,
    description,
    videoTitle: videoTitle?.url,
    duration: videoTitle?.duration,
    thumbnail: thumbnail?.url,
  });
  if (!videoFile) {
    throw new ApiError(500, "something went wrong while uploading");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoFile, "video upload successfully"));
});

//******************************************************************************//
//@dec video get by Id
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId) {
    throw new ApiError(400, "put the name of video");
  }
  const getVideo = await Video.findById(videoId);
  if (!getVideo) {
    throw new ApiError(500, "video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, getVideo, "video fetched successfully"));
});
//******************************************************************************//
//@dec video updated successfully
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  if (!videoId) {
    throw new ApiError(400, "video id not found");
  }
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;
  if (!(title, description)) {
    throw new ApiError(400, "title, description and thumbnail are required");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    throw new ApiError(500, "error while uploading thumbnail");
  }

  const updateVideo = await Video.findByIdAndUpdate(videoId, {
    title,
    description,
    thumbnail: thumbnail?.url,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "details update successfully"));
});
//******************************************************************************//
//@dec video deleted successfully
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  const deleteVideo = await Video.findByIdAndDelete(videoId);

  if (!deleteVideo) {
    throw new ApiError(500, "something went wrong while deleting");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(500, "video not found");
  }

  video.isPublished = !video.isPublished;

  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, video?.isPublished, "toggle changed successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
