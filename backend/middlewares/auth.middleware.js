import User from "../models/user.model.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

export const protectRoute = asyncHandler(async (req, res, next) => {
  if (!req.cookies.accessToken) {
    res.status(401);
    throw new Error("Unauthorized -- no access token provided");
  }
  const accessToken = req.cookies.accessToken;

  let decoded;
  try {
    decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    res.status(401);
    if (err.name === "TokenExpiredError")
      throw new Error("protect route : Access Token expired!");
    else if (err.name === "JsonWebTokenError")
      throw new Error("protect route : Invalid Access Token");
    else throw new Error("protect route : Could not verify Access Token");
  }
  const user = await User.findById(decoded.userId).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  req.user = user;
  next();
});

export const adminRoute = asyncHandler((req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Access denied -- Admin only");
  }
});
