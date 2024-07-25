import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//*******************************************************************************//
//@dec subscription toggle
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channel } = req.params;
  const subscriber = req.user?._id;
  // @dec  find channel id from params in user model
  const channelId = await User.findById(channel);
  if (!channelId) {
    throw new ApiError(500, "Channel not found");
  }
  // @dec  find user id from auth in user model
  const user = await User.findById(subscriber);
  if (!user) {
    throw new ApiError(400, "u should logIn first");
  }

  // @dec  find channelId and UserId subscription model
  const subscription = await Subscription.findOne({ subscriber, channel });

  // @dec  if not available then create
  if (!subscription) {
    await Subscription.create({ subscriber, channel });
    res.status(200).json(new ApiResponse(200, "channel subscribed"));
  }
  // @dec  else available then delete
  else {
    await Subscription.deleteOne({ _id: subscription._id });
    res.status(200).json(new ApiResponse(200, "unsubscribed successfully"));
  }
});

//******************************************************************************//
// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channel } = req.params;
  if (!channel) {
    throw new ApiError(500, "channel not found");
  }

  const channelSubscription = Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channel),
      },
    },
    {
      $count: "countChannel",
    },
    {
      $project: {
        countChannel: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, channelSubscription, "total subscriber"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
