import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generateAccessAndRefereshTokens } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

//********************************************************************************//
//@dec Registration Controller
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (!(fullName, email, username, password)) {
    throw new ApiError(400, "fill all the field");
  }

  const existedUser = await User.findOne({
    $or: { email, username },
  });
  if (existedUser) {
    throw new ApiError(409, "User already exist with email or username");
  }

  //@dec pick avatar local file path
  const avatarLocalPath = req.files?.avatar[0]?.path;

  //@dec pick cover image local path
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  )
    coverImageLocalPath = req.files.coverImage[0].path;

  //@dec if not available path throw error
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file required");
  }

  //@dec upload on cloudinary store on variable that path
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  //@dec check if not availabe throw error
  if (!avatar) {
    throw new ApiError(400, "avatar file required");
  }

  //@dec store data on mongodb
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    username,
    password,
  });

  //@dec find that store data by id then store that on variable
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //@dec if not find that data throw error
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registration");
  }

  //@dec return that as json
  return res
    .status(200)
    .json(new ApiResponse(201, "user registered successfully", createdUser));
});

//********************************************************************************//
//@dec LogIn controller
const logInUser = asyncHandler(async (req, res) => {
  //@dec get data from req.body
  const { username, email, password } = req.body;

  //@dec if not available throw error
  if (!(username, email, password)) {
    throw new ApiError(400, "fill the field");
  }
  //@dec find email and username on database
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  //@dec if not availabe throw error
  if (!user) {
    throw new ApiError(401, "user doesn't exist");
  }

  //@dec then compare password is that valid
  const isPasswordValid = await user.isPasswordCorrect(password);

  //@dec if not valid throw error
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid Credentials");
  }

  //@dec call a function to generate token by user id
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  //@dec then store that data on a variable remove password and refreshToken
  const userLogedIn = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //@dec Setting a cookie without options
  const options = {
    httpOnly: true,
  };
  //@dec store token on cookie then send that all in response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: userLogedIn,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

//********************************************************************************//
//@dec LogOut Controller
const logOutUser = asyncHandler(async (req, res) => {
  //@dec find by id and the unset that token.
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  //@dec Setting a cookie without options
  const options = {
    httpOnly: true,
    secure: true,
  };
  //@dec return that res and clear coookies
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "user logOut succesfully"));
});

//********************************************************************************//
//@dec update token
const refreshAndAccessToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingToken) {
    throw new ApiError(401, "unauthorized reques");
  }
  try {
    const decodedToken = jwt.verify(
      incomingToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "unauthorized request");
    }
    if (incomingToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { refreshToken, accessToken } = generateAccessAndRefereshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "accessToken refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

//********************************************************************************//
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!(oldPassword, newPassword)) {
    throw new ApiError(400, "fill the field");
  }

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "invalid old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

//********************************************************************************//
//@dec get current user
const getCurrentUser = asyncHandler((req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "user fetched successfully"));
});
//********************************************************************************//
//@dec update username and email
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { username, email } = req.body;

  if (!(email, username)) {
    throw new ApiError(400, "fill the field");
  }

  const user = await User.findByIdAndUpdate(
    req?.user._id,

    {
      $set: {
        username,
        email,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated"));
});

//********************************************************************************//
//@dec update avatar
const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  await User.findByIdAndUpdate(
    req.user?._id,

    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "avatar updated successfully"));
});

//********************************************************************************//
//@dec update coverImage
const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "u should add coverImage");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  const user = await User.findByIdAndUpdate(
    req.user?._id,

    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, "coverImage updated successfully"));
});
//********************************************************************************//
//@dec getChannel details
const getUserChannel = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "Subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "subscribers",
        },
        subscribedToCount: {
          $size: "subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        subscribersCount: 1,
        subscribedToCount: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
  ]);
  if (!channel.length) {
    throw new ApiError(400, "channel not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "user channel fetched successfully")
    );
});

//********************************************************************************//
//@dec get user watch history
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.objectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
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
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});
//********************************************************************************//
//@dec export the controller
export {
  registerUser,
  logInUser,
  logOutUser,
  refreshAndAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannel,
  getWatchHistory,
};
