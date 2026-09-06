import { Router } from "express";

import {
  toggleFileStar,
  toggleFolderStar,
  getStarredItems,
} from "../controllers/star.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// ==========================================
// GET ALL STARRED ITEMS
// ==========================================

router.get(
  "/",
  authMiddleware,
  getStarredItems
);

// ==========================================
// STAR / UNSTAR FILE
// ==========================================

router.post(
  "/file/:fileId",
  authMiddleware,
  toggleFileStar
);

// ==========================================
// STAR / UNSTAR FOLDER
// ==========================================

router.post(
  "/folder/:folderId",
  authMiddleware,
  toggleFolderStar
);

export default router;