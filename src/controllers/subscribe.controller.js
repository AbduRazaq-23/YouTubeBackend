import mongoose from "mongoose";
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
//@dec controller to return channel list to which user has subscribed
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channel } = req.params;
  if (!channel) {
    throw new ApiError(500, "channel not found");
  }

  const channelSubscription = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channel),
      },
    },
    {
      $count: "countChannel",
    },
  ]);

  if (!channelSubscription.length) {
    throw new ApiError(500, "no subscriber");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channelSubscription[0], "total subscriber"));
});

//@dec controller to return subscriber list of a channel
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriber } = req.params;

  if (!subscriber) {
    throw new ApiError(500, "subscriber id not found");
  }

  const subscriberCount = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriber),
      },
    },
    {
      $count: "SubscribedChannel",
    },
  ]);
  if (!getSubscribedChannels.length) {
    throw new ApiError(500, "subscribed channel not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, subscriberCount[0], "all subscribed channel"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
