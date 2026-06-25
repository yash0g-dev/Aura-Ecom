import express from "express";
import {
  signup,
  login,
  logout,
  refreshToken,
  profile,
} from "../controllers/auth.contoller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/refresh-token", refreshToken);

router.get("/profile", protectRoute, profile);

export default router;
