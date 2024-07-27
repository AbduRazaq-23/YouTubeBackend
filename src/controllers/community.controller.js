import { Community } from "../models/community.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//****************************************************************************//
//@dec create a community post
const createCommunityPost = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { content } = req.body;
  //TODO: create tweet
  if (!userId) {
    throw new ApiError(400, "u should logIn first");
  }
  if (!content) {
    throw new ApiError(400, "fill the text box");
  }

  const user = await User.findOne(userId);
  if (!user) {
    throw new ApiError(400, "u should logIn first");
  }
  const post = await Community.create({ owner: userId, content });

  return res
    .status(200)
    .json(new ApiResponse(200, post, "posted a community Post"));
});
//***************************************************************************//
//@dec get all community post
const getCommunityPost = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const posts = await Community.find();
  return res.status(200).json(new ApiResponse(200, posts, "all posts"));
});
//***************************************************************************//
//@dec updateCommunityPost
const updateCommunityPost = asyncHandler(async (req, res) => {
  const { contentId } = req.params;
  const userId = req.user?._id;
  const { content } = req.body;

  // TODO: update communityPost
  if (!contentId) {
    throw new ApiError(400, " post has not available");
  }
  const user = await Community.findOne({ owner: userId });
  if (!user) {
    throw new ApiError(400, "u can't update post");
  }
  const post = await Community.findByIdAndUpdate(contentId, { content });

  if (!post) {
    throw new ApiError(500, "error while updating post");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, post, "post updated successfully"));
});
//***************************************************************************//
//@dec delete community Post
const deleteCommunityPost = asyncHandler(async (req, res) => {
  const { contentId } = req.params;
  const userId = req.user?._id;

  // TODO: delete communityPost
  if (!contentId) {
    throw new ApiError(400, " post has not available");
  }
  const user = await Community.findOne({ owner: userId });
  if (!user) {
    throw new ApiError(400, "u can't update post");
  }
  const post = await Community.findByIdAndDelete(contentId);

  return res
    .status(200)
    .json(new ApiResponse(200, "post deleted successfully"));
});

export {
  createCommunityPost,
  getCommunityPost,
  updateCommunityPost,
  deleteCommunityPost,
};
