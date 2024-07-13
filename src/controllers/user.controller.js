import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//********************************************************************************//
//@dec Generating token
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

//********************************************************************************//
//@dec User Registration
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
const logIn = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(username, email, password)) {
    throw new ApiError(400, "fill the field");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(401, "user doesn't exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const userLogedIn = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

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

export { registerUser, logIn };
