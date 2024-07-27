import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { application } from "express";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});
//**************************************************************************//
//@dec add comment to a video
const addComment = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { videoId } = req.params;
  const { comment } = req.body;
  // TODO: add a comment to a video
  if (!videoId) {
    throw new ApiError(500, "something went wrong to getting videoId");
  }
  if (!userId) {
    throw new ApiError(400, "u should login");
  }
  if (!comment) {
    throw new ApiError(400, "fill the comment box");
  }
  const commentToSave = await Comment.create({
    video: videoId,
    Owner: userId,
    content: comment,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, commentToSave, "comment posted"));
});
//**************************************************************************//
//@dec update Comment
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  // TODO: update a comment
  if (!commentId) {
    throw new ApiError(500, "comment not available");
  }

  const comment = await Comment.findByIdAndUpdate(commentId, { content });
  if (!comment) {
    throw new ApiError(400, "u should login first");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment updated successfully"));
});
//**************************************************************************//
//@dec delete comment
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  // TODO: delete a comment
  if (!commentId) {
    throw new ApiError(500, "comment not available");
  }
  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, "comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
