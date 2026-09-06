import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// ==========================================
// STAR / UNSTAR A FILE
// ==========================================

export async function toggleFileStar(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.userId;
    const fileId = String(req.params.fileId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Check whether the file exists
    // and belongs to the logged-in user
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        ownerId: userId,
      },
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Check whether the file is already starred
    const existingStar = await prisma.star.findFirst({
      where: {
        userId,
        fileId,
      },
    });

    // ==========================================
    // UNSTAR FILE
    // ==========================================

    if (existingStar) {
      await prisma.star.delete({
        where: {
          id: existingStar.id,
        },
      });

      await prisma.activityLog.create({
        data: {
          type: "UNSTARRED",
          description: `Removed "${file.name}" from Starred`,
          userId,
          fileId: file.id,
        },
      });

      return res.status(200).json({
        success: true,
        message: "File removed from Starred",
        starred: false,
      });
    }

    // ==========================================
    // STAR FILE
    // ==========================================

    await prisma.star.create({
      data: {
        userId,
        fileId: file.id,
      },
    });

    await prisma.activityLog.create({
      data: {
        type: "STARRED",
        description: `Added "${file.name}" to Starred`,
        userId,
        fileId: file.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "File added to Starred",
      starred: true,
    });

  } catch (error) {
    console.error("Toggle file star error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// ==========================================
// STAR / UNSTAR A FOLDER
// ==========================================

export async function toggleFolderStar(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.userId;
    const folderId = String(req.params.folderId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Check whether the folder exists
    // and belongs to the logged-in user
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        ownerId: userId,
      },
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found",
      });
    }

    // Check whether folder is already starred
    const existingStar = await prisma.star.findFirst({
      where: {
        userId,
        folderId,
      },
    });

    // ==========================================
    // UNSTAR FOLDER
    // ==========================================

    if (existingStar) {
      await prisma.star.delete({
        where: {
          id: existingStar.id,
        },
      });

      await prisma.activityLog.create({
        data: {
          type: "UNSTARRED",
          description: `Removed folder "${folder.name}" from Starred`,
          userId,
          folderId: folder.id,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Folder removed from Starred",
        starred: false,
      });
    }

    // ==========================================
    // STAR FOLDER
    // ==========================================

    await prisma.star.create({
      data: {
        userId,
        folderId: folder.id,
      },
    });

    await prisma.activityLog.create({
      data: {
        type: "STARRED",
        description: `Added folder "${folder.name}" to Starred`,
        userId,
        folderId: folder.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Folder added to Starred",
      starred: true,
    });

  } catch (error) {
    console.error("Toggle folder star error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// ==========================================
// GET ALL STARRED ITEMS
// ==========================================

export async function getStarredItems(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const stars = await prisma.star.findMany({
      where: {
        userId,
      },

      include: {
        file: true,
        folder: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    // ==========================================
    // EXTRACT STARRED FILES
    // ==========================================

    const files = stars
      .filter((star) => star.file !== null)
      .map((star) => {
        return {
          id: star.file!.id,
          name: star.file!.name,
          mimeType: star.file!.mimeType,
          size: star.file!.size,
          storageKey: star.file!.storageKey,
          folderId: star.file!.folderId,
          ownerId: star.file!.ownerId,
          isTrashed: star.file!.isTrashed,
          trashedAt: star.file!.trashedAt,
          createdAt: star.file!.createdAt,
          updatedAt: star.file!.updatedAt,
          starredAt: star.createdAt,
        };
      });

    // ==========================================
    // EXTRACT STARRED FOLDERS
    // ==========================================

    const folders = stars
      .filter((star) => star.folder !== null)
      .map((star) => {
        return {
          id: star.folder!.id,
          name: star.folder!.name,
          parentId: star.folder!.parentId,
          ownerId: star.folder!.ownerId,
          isTrashed: star.folder!.isTrashed,
          trashedAt: star.folder!.trashedAt,
          createdAt: star.folder!.createdAt,
          updatedAt: star.folder!.updatedAt,
          starredAt: star.createdAt,
        };
      });

    return res.status(200).json({
      success: true,
      files,
      folders,
    });

  } catch (error) {
    console.error("Get starred items error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}