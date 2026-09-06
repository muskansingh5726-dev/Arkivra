import { Router } from "express";

import {
  uploadFile,
  getFiles,
  getTrashedFiles,
  viewFile,
  downloadFile,
  moveFileToTrash,
  restoreFile,
  permanentlyDeleteFile,
} from "../controllers/file.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();


// ==========================================
// UPLOAD FILE
// POST /api/files/upload
// ==========================================

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadFile
);


// ==========================================
// GET ACTIVE FILES
// GET /api/files
// ==========================================

router.get(
  "/",
  authMiddleware,
  getFiles
);


// ==========================================
// GET TRASHED FILES
// GET /api/files/trash
// IMPORTANT: This must come BEFORE "/:id/..."
// ==========================================

router.get(
  "/trash",
  authMiddleware,
  getTrashedFiles
);


// ==========================================
// VIEW FILE
// GET /api/files/:id/view
// ==========================================

router.get(
  "/:id/view",
  authMiddleware,
  viewFile
);


// ==========================================
// DOWNLOAD FILE
// GET /api/files/:id/download
// ==========================================

router.get(
  "/:id/download",
  authMiddleware,
  downloadFile
);


// ==========================================
// MOVE FILE TO TRASH
// PATCH /api/files/:id/trash
// ==========================================

router.patch(
  "/:id/trash",
  authMiddleware,
  moveFileToTrash
);


// ==========================================
// RESTORE FILE
// PATCH /api/files/:id/restore
// ==========================================

router.patch(
  "/:id/restore",
  authMiddleware,
  restoreFile
);


// ==========================================
// PERMANENTLY DELETE FILE
// DELETE /api/files/:id
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  permanentlyDeleteFile
);


export default router;