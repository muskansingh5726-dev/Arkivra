import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import folderRoutes from "./routes/folder.routes.js";
import fileRoutes from "./routes/file.routes.js";
import starRoutes from "./routes/star.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "ARKIVRA API is running 🚀",
  });
});

// ==========================================
// API ROUTES
// ==========================================

// Authentication
app.use("/api/auth", authRoutes);

// Folders
app.use("/api/folders", folderRoutes);

// Files
app.use("/api/files", fileRoutes);

// Starred Items
app.use("/api/stars", starRoutes);

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 ARKIVRA API running on http://localhost:${PORT}`
  );
});