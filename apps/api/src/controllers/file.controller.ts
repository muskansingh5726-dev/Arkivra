import { Response } from "express";
import path from "path";
import fs from "fs";

import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";


// ==========================================
// UPLOAD FILE
// POST /api/files/upload
// ==========================================

export async function uploadFile(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { folderId } = req.body;

    // Verify folder ownership if folderId is provided
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          ownerId: req.userId,
          isTrashed: false,
        },
      });

      if (!folder) {
        return res.status(404).json({
          success: false,
          message: "Folder not found",
        });
      }
    }

    const file = await prisma.file.create({
      data: {
        name: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        storageKey: req.file.filename,
        folderId: folderId || null,
        ownerId: req.userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      file,
    });

  } catch (error) {
    console.error("Upload file error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


// ==========================================
// GET ACTIVE FILES
// GET /api/files
// ==========================================

export async function getFiles(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const files = await prisma.file.findMany({
      where: {
        ownerId: req.userId,
        isTrashed: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      files,
    });

  } catch (error) {
    console.error("Get files error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


// ==========================================
// GET TRASHED FILES
// GET /api/files/trash
// ==========================================

export async function getTrashedFiles(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const files = await prisma.file.findMany({
      where: {
        ownerId: req.userId,
        isTrashed: true,
      },
      orderBy: {
        trashedAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      files,
    });

  } catch (error) {
    console.error("Get trashed files error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


// ==========================================
// VIEW FILE
// GET /api/files/:id/view
// ==========================================

export async function viewFile(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const id = String(req.params["id"] || "");

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "File ID is required",
      });
    }

    const file = await prisma.file.findFirst({
      where: {
        id,
        ownerId: req.userId,
        isTrashed: false,
      },
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const filePath = path.join(
      process.cwd(),
      "uploads",
      file.storageKey
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Physical file not found",
      });
    }

    return res.sendFile(filePath);

  } catch (error) {
    console.error("View file error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to view file",
    });
  }
}


// ==========================================
// DOWNLOAD FILE
// GET /api/files/:id/download
// ==========================================

export async function downloadFile(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const id = String(req.params["id"] || "");

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "File ID is required",
      });
    }

    const file = await prisma.file.findFirst({
      where: {
        id,
        ownerId: req.userId,
        isTrashed: false,
      },
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const filePath = path.join(
      process.cwd(),
      "uploads",
      file.storageKey
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Physical file not found",
      });
    }

    return res.download(
      filePath,
      file.name
    );

  } catch (error) {
    console.error("Download file error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to download file",
    });
  }
}


// ==========================================
// MOVE FILE TO TRASH
// PATCH /api/files/:id/trash
// ==========================================

export async function moveFileToTrash(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const id = String(req.params["id"] || "");

    const file = await prisma.file.findFirst({
      where: {
        id,
        ownerId: req.userId,
        isTrashed: false,
      },
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const updatedFile = await prisma.file.update({
      where: {
        id,
      },
      data: {
        isTrashed: true,
        trashedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "File moved to trash",
      file: updatedFile,
    });

  } catch (error) {
    console.error("Move file to trash error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to move file to trash",
    });
  }
}


// ==========================================
// RESTORE FILE
// PATCH /api/files/:id/restore
// ==========================================

export async function restoreFile(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const id = String(req.params["id"] || "");

    const file = await prisma.file.findFirst({
      where: {
        id,
        ownerId: req.userId,
        isTrashed: true,
      },
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "Trashed file not found",
      });
    }

    const updatedFile = await prisma.file.update({
      where: {
        id,
      },
      data: {
        isTrashed: false,
        trashedAt: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "File restored successfully",
      file: updatedFile,
    });

  } catch (error) {
    console.error("Restore file error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to restore file",
    });
  }
}


// ==========================================
// PERMANENTLY DELETE FILE
// DELETE /api/files/:id
// ==========================================

export async function permanentlyDeleteFile(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const id = String(req.params["id"] || "");

    const file = await prisma.file.findFirst({
      where: {
        id,
        ownerId: req.userId,
        isTrashed: true,
      },
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "Trashed file not found",
      });
    }

    const filePath = path.join(
      process.cwd(),
      "uploads",
      file.storageKey
    );

    // Delete physical file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete database record
    await prisma.file.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "File permanently deleted",
    });

  } catch (error) {
    console.error("Permanent delete error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to permanently delete file",
    });
  }
}