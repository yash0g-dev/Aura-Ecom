import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";
import asyncHandler from "express-async-handler";

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
};

function generateToken(userId) {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
}

async function storeRefreshToken(userId, refreshToken) {
  await redis.set(
    `refreshToken:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60,
  );
}

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, //15mins
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, //7days
  });
};

// @desc   signup handler
// @route  POST /api/auth/signup
// @access Public
export const signup = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ email, password, name });

  const { accessToken, refreshToken } = generateToken(user._id);

  await storeRefreshToken(user._id, refreshToken);

  setCookies(res, accessToken, refreshToken);

  res.status(201).send({
    id: user._id,
    name: user.name,
    email: user.email,
    message: "success",
  });
});

// @desc   login handler
// @route  POST /api/auth/login
// @access Public
export const login = asyncHandler(async (req, res) => {
  if (!req.body.email) {
    res.status(400);
    throw new Error("Bad request : Email is required");
  }
  if (!req.body.password) {
    res.status(400);
    throw new Error("Bad request : Password is required");
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.comparePassword(password))) {
    const { accessToken, refreshToken } = generateToken(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: "succesfully logged in",
    });
  } else {
    res.status(401);
    throw new Error("invalid credentials");
  }
});

// @desc   logout handler
// @route  POST /api/auth/logout
// @access Public
export const logout = asyncHandler(async (req, res) => {
  if (!req.cookies.refreshToken) {
    res.status(401);
    throw new Error("can not logout absence of request token");
  }
  const refreshToken = req.cookies.refreshToken;

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    res.status(400);
    if (err.name === "TokenExpiredError")
      throw new Error(" Access Token expired!");
    else if (err.name === "JsonWebTokenError")
      throw new Error(" Invalid Access Token");
    else throw new Error(" Could not verify Access Token");
  }
  await redis.del(`refreshToken:${decoded.userId}`);
  res.clearCookie("refreshToken", cookieOptions);
  res.clearCookie("accessToken", cookieOptions);
  res.status(200).json({
    userId: decoded.userId,
    message: "successfully logged out",
  });
});

// @desc   refresth the expired token
// @route  POST /api/file/refreshToken
// @access Public
export const refreshToken = asyncHandler(async (req, res) => {
  if (!req.cookies.refreshToken) {
    res.status(401);
    throw new Error("need refresh token in request");
  }
  const refreshToken = req.cookies.refreshToken;
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    res.status(400);
    if (err.name === "TokenExpiredError")
      throw new Error(" Access Token expired!");
    else if (err.name === "JsonWebTokenError")
      throw new Error(" Invalid Access Token");
    else throw new Error(" Could not verify Access Token");
  }
  const storedToken = await redis.get(`refreshToken:${decoded.userId}`);
  if (refreshToken !== storedToken) {
    res.status(401);
    throw new Error("invalid token credentials");
  }
  const accessToken = jwt.sign(
    { userId: decoded.userId },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, //15mins
  });
  res.status(201).json({
    userId: decoded.userId,
    message: "successfully created new access token",
  });
});

// @desc   get profile handler
// @route  POST /api/auth/getProfile
// @access Private
export const profile = asyncHandler(async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500);
    throw new Error("Server Error", error.message);
  }
});

// @desc    Update user profile data (Phone / Avatar)
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfileMetaData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User record mapping not found");
  }

  // Safely merge incoming mutations into our structured profile block
  user.profile.phone = req.body.phone || user.profile.phone;
  user.profile.avatar = req.body.avatar || user.profile.avatar;

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    profile: updatedUser.profile,
  });
});

// @desc    Add a new shipping address to user account profile
// @route   POST /api/auth/profile/addresses
// @access  Private
export const addUserAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User record mapping not found");
  }

  // If this is the user's first address, automatically make it the default
  if (user.profile.savedAddresses.length === 0) {
    req.body.isDefault = true;
  } else if (req.body.isDefault) {
    // If the new address is explicitly set as default, remove the default flag from existing addresses
    user.profile.savedAddresses.forEach((addr) => (addr.isDefault = false));
  }

  user.profile.savedAddresses.push(req.body);
  await user.save();

  res.status(201).json({
    success: true,
    addresses: user.profile.savedAddresses,
  });
});
