import { Router } from "express";

import {
  createFolder,
  getFolders,
  getFolderById,
} from "../controllers/folder.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();


// ==========================================
// CREATE FOLDER
// POST /api/folders
// ==========================================

router.post(
  "/",
  authMiddleware,
  createFolder
);


// ==========================================
// GET ALL FOLDERS
// GET /api/folders
// ==========================================

router.get(
  "/",
  authMiddleware,
  getFolders
);


// ==========================================
// GET ONE FOLDER
// GET /api/folders/:id
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  getFolderById
);


export default router;