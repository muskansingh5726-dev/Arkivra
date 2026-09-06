import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// ==========================================
// CREATE FOLDER
// POST /api/folders
// ==========================================

export async function createFolder(
  req: AuthRequest,
  res: Response
) {
  try {
    const { name, parentId } = req.body;

    // Check authenticated user
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Validate folder name
    if (
      !name ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Folder name is required",
      });
    }

    // Check parent folder
    if (parentId) {
      const parentFolder =
        await prisma.folder.findFirst({
          where: {
            id: parentId,
            ownerId: req.userId,
            isTrashed: false,
          },
        });

      if (!parentFolder) {
        return res.status(404).json({
          success: false,
          message: "Parent folder not found",
        });
      }
    }

    // Create folder
    const folder =
      await prisma.folder.create({
        data: {
          name: name.trim(),
          parentId: parentId || null,
          ownerId: req.userId,
        },
      });

    return res.status(201).json({
      success: true,
      message: "Folder created successfully",
      folder,
    });
  } catch (error) {
    console.error(
      "Create folder error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


// ==========================================
// GET ALL FOLDERS
// GET /api/folders
// ==========================================

export async function getFolders(
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

    const folders =
      await prisma.folder.findMany({
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
      folders,
    });
  } catch (error) {
    console.error(
      "Get folders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


// ==========================================
// GET ONE FOLDER + CONTENTS
// GET /api/folders/:id
// ==========================================

export async function getFolderById(
  req: AuthRequest,
  res: Response
) {
  try {
    // Check authenticated user
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const id = String(
      req.params["id"] || ""
    );

    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Folder ID is required",
      });
    }

    // Find folder
    const folder =
      await prisma.folder.findFirst({
        where: {
          id,
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

    // ======================================
    // GET DIRECT SUBFOLDERS
    // ======================================

    const subfolders =
      await prisma.folder.findMany({
        where: {
          parentId: id,
          ownerId: req.userId,
          isTrashed: false,
        },

        orderBy: {
          createdAt: "desc",
        },
      });


    // ======================================
    // GET FILES INSIDE THIS FOLDER
    // ======================================

    const files =
      await prisma.file.findMany({
        where: {
          folderId: id,
          ownerId: req.userId,
          isTrashed: false,
        },

        orderBy: {
          createdAt: "desc",
        },
      });


    // ======================================
    // RESPONSE
    // ======================================

    return res.status(200).json({
      success: true,

      folder,

      subfolders,

      files,
    });

  } catch (error) {
    console.error(
      "Get folder error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}