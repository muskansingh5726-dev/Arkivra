import { Router } from "express";
import {
  signup,
  login,
  getMe,
} from "../controllers/auth.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected route
router.get("/me", authMiddleware, getMe);

export default router;