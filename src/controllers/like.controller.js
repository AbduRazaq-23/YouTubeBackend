import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//********************************************************************************//
//@dec video like toggle
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;
  //TODO: toggle like on video

  if (!videoId) {
    throw new ApiError(500, "video not available");
  }
  if (!userId) {
    throw new ApiError(500, "like id not available");
  }

  const like = await User.findById(userId);

  if (!like) {
    throw new ApiError(400, "U can't like this video u should logIn first");
  }

  const checkIfLiked = await Like.findOne({
    likedBy: userId,
    video: videoId,
  });

  if (checkIfLiked) {
    await Like.deleteOne({ _id: checkIfLiked._id });
    return res.status(200).json(new ApiResponse(200, "like removed"));
  } else {
    await Like.create({ likedBy: userId, video: videoId });
    return res.status(200).json(new ApiResponse(200, "liked"));
  }
});
//********************************************************************************//
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
