"use client";

import { useEffect, useState } from "react";

import {
  getStarredItems,
  toggleFileStar,
  toggleFolderStar,
} from "../lib/api";

const API_URL = "http://localhost:5000";

// ==========================================
// TYPES
// ==========================================

type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  starredAt?: string;
};

type FileItem = {
  id: string;
  name: string;
  size: number;
  mimeType: string;

  folderId?: string | null;

  isTrashed?: boolean;
  trashedAt?: string | null;

  starredAt?: string;
};

type ViewMode =
  | "drive"
  | "starred"
  | "trash";

type ModalAction =
  | "trash"
  | "delete"
  | null;

// ==========================================
// HOME
// ==========================================

export default function Home() {
  // ==========================================
  // AUTH STATE
  // ==========================================

  const [token, setToken] =
    useState("");

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [isSignup, setIsSignup] =
    useState(false);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [authLoading, setAuthLoading] =
    useState(false);

  // ==========================================
  // APP STATE
  // ==========================================

  const [folders, setFolders] =
    useState<Folder[]>([]);

  const [files, setFiles] =
    useState<FileItem[]>([]);

  const [trashFiles, setTrashFiles] =
    useState<FileItem[]>([]);

  const [starredFiles, setStarredFiles] =
    useState<FileItem[]>([]);

  const [
    starredFolders,
    setStarredFolders,
  ] = useState<Folder[]>([]);

  const [folderName, setFolderName] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [userName, setUserName] =
    useState("");

  // ==========================================
  // VIEW STATE
  // ==========================================

  const [viewMode, setViewMode] =
    useState<ViewMode>("drive");

  // ==========================================
  // FOLDER NAVIGATION STATE
  // ==========================================

  // null = My Drive root

  const [
    currentFolderId,
    setCurrentFolderId,
  ] = useState<string | null>(
    null
  );

  // ==========================================
  // MODAL STATE
  // ==========================================

  const [
    modalAction,
    setModalAction,
  ] = useState<ModalAction>(
    null
  );

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<FileItem | null>(
    null
  );

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  // ==========================================
  // LOAD SAVED LOGIN
  // ==========================================

  useEffect(() => {
    const savedToken =
      localStorage.getItem(
        "arkivra_token"
      );

    const savedUser =
      localStorage.getItem(
        "arkivra_user"
      );

    if (savedToken) {
      setToken(savedToken);

      setIsLoggedIn(true);
    }

    if (savedUser) {
      setUserName(savedUser);
    }
  }, []);

  // ==========================================
  // LOAD DATA AFTER LOGIN
  // ==========================================

  useEffect(() => {
    if (!token || !isLoggedIn) {
      return;
    }

    loadData();
  }, [token, isLoggedIn]);

  // ==========================================
  // LOAD STARRED DATA
  // ==========================================

  async function loadStarredData() {
    try {
      const data =
        await getStarredItems();

      if (data.success) {
        setStarredFiles(
          data.files || []
        );

        setStarredFolders(
          data.folders || []
        );
      }
    } catch (error) {
      console.error(
        "Unable to load starred items:",
        error
      );
    }
  }

  // ==========================================
  // LOAD ALL DATA
  // ==========================================

  async function loadData() {
    try {
      setLoading(true);

      const [
        foldersResponse,
        filesResponse,
        trashResponse,
      ] = await Promise.all([
        fetch(
          `${API_URL}/api/folders`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        ),

        fetch(
          `${API_URL}/api/files`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        ),

        fetch(
          `${API_URL}/api/files/trash`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        ),
      ]);

      // ======================================
      // TOKEN EXPIRED
      // ======================================

      if (
        foldersResponse.status === 401 ||
        filesResponse.status === 401 ||
        trashResponse.status === 401
      ) {
        logout();

        return;
      }

      const foldersData =
        await foldersResponse.json();

      const filesData =
        await filesResponse.json();

      const trashData =
        await trashResponse.json();

      if (foldersData.success) {
        setFolders(
          foldersData.folders || []
        );
      }

      if (filesData.success) {
        setFiles(
          filesData.files || []
        );
      }

      if (trashData.success) {
        setTrashFiles(
          trashData.files || []
        );
      }

      await loadStarredData();
    } catch (error) {
      console.error(error);

      setMessage(
        "Could not connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  async function handleAuth() {
    if (
      !email.trim() ||
      !password.trim()
    ) {
      setMessage(
        "Please enter email and password."
      );

      return;
    }

    if (
      isSignup &&
      !name.trim()
    ) {
      setMessage(
        "Please enter your name."
      );

      return;
    }

    try {
      setAuthLoading(true);

      setMessage("");

      const endpoint =
        isSignup
          ? `${API_URL}/api/auth/signup`
          : `${API_URL}/api/auth/login`;

      const body =
        isSignup
          ? {
              name,
              email,
              password,
            }
          : {
              email,
              password,
            };

      const response =
        await fetch(endpoint, {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(body),
        });

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        setMessage(
          data.message ||
            "Authentication failed."
        );

        return;
      }

      const loggedInUserName =
        data.user?.name || name;

      localStorage.setItem(
        "arkivra_token",
        data.token
      );

      localStorage.setItem(
        "arkivra_user",
        loggedInUserName
      );

      setToken(data.token);

      setUserName(
        loggedInUserName
      );

      setIsLoggedIn(true);

      setPassword("");

      setMessage("");
    } catch (error) {
      console.error(error);

      setMessage(
        "Could not connect to server."
      );
    } finally {
      setAuthLoading(false);
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  function logout() {
    localStorage.removeItem(
      "arkivra_token"
    );

    localStorage.removeItem(
      "arkivra_user"
    );

    setToken("");

    setUserName("");

    setIsLoggedIn(false);

    setFolders([]);

    setFiles([]);

    setTrashFiles([]);

    setStarredFiles([]);

    setStarredFolders([]);

    setEmail("");

    setPassword("");

    setName("");

    setViewMode("drive");

    setCurrentFolderId(null);

    setMessage("");
  }

  // ==========================================
  // CREATE FOLDER
  // ==========================================

  async function createFolder() {
    if (!folderName.trim()) {
      setMessage(
        "Please enter a folder name."
      );

      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/api/folders`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              name:
                folderName.trim(),

              parentId:
                currentFolderId,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        setMessage(
          data.message ||
            "Could not create folder."
        );

        return;
      }

      setFolders(
        (previous) => [
          data.folder,
          ...previous,
        ]
      );

      setFolderName("");

      setMessage(
        "Folder created successfully! 📁"
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "Error creating folder."
      );
    }
  }

  // ==========================================
  // UPLOAD FILE
  // ==========================================

  async function uploadFile(
    selectedFile: File
  ) {
    try {
      setMessage(
        "Uploading file..."
      );

      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );

      // If a folder is open,
      // upload into that folder

      if (currentFolderId) {
        formData.append(
          "folderId",
          currentFolderId
        );
      }

      const response =
        await fetch(
          `${API_URL}/api/files/upload`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body: formData,
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        setMessage(
          data.message ||
            "Upload failed."
        );

        return;
      }

      setFiles(
        (previous) => [
          data.file,
          ...previous,
        ]
      );

      setMessage(
        "File uploaded successfully! 🎉"
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "Error uploading file."
      );
    }
  }

  // ==========================================
  // STAR / UNSTAR FILE
  // ==========================================

  async function handleToggleFileStar(
    fileId: string
  ) {
    try {
      const data =
        await toggleFileStar(
          fileId
        );

      if (data.starred) {
        const fileToStar =
          files.find(
            (file) =>
              file.id === fileId
          );

        if (fileToStar) {
          setStarredFiles(
            (previous) => [
              {
                ...fileToStar,

                starredAt:
                  new Date().toISOString(),
              },

              ...previous,
            ]
          );
        }

        setMessage(
          "File added to Starred ⭐"
        );
      } else {
        setStarredFiles(
          (previous) =>
            previous.filter(
              (file) =>
                file.id !== fileId
            )
        );

        setMessage(
          "File removed from Starred"
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to update Starred."
      );
    }
  }

  // ==========================================
  // STAR / UNSTAR FOLDER
  // ==========================================

  async function handleToggleFolderStar(
    folderId: string
  ) {
    try {
      const data =
        await toggleFolderStar(
          folderId
        );

      if (data.starred) {
        const folderToStar =
          folders.find(
            (folder) =>
              folder.id === folderId
          );

        if (folderToStar) {
          setStarredFolders(
            (previous) => [
              {
                ...folderToStar,

                starredAt:
                  new Date().toISOString(),
              },

              ...previous,
            ]
          );
        }

        setMessage(
          "Folder added to Starred ⭐"
        );
      } else {
        setStarredFolders(
          (previous) =>
            previous.filter(
              (folder) =>
                folder.id !== folderId
            )
        );

        setMessage(
          "Folder removed from Starred"
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to update Starred."
      );
    }
  }

  // ==========================================
  // VIEW FILE
  // ==========================================

  async function handleViewFile(
    fileId: string
  ) {
    let newWindow:
      | Window
      | null = null;

    try {
      newWindow =
        window.open(
          "",
          "_blank"
        );

      const response =
        await fetch(
          `${API_URL}/api/files/${fileId}/view`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        if (newWindow) {
          newWindow.close();
        }

        const data =
          await response
            .json()
            .catch(() => null);

        setMessage(
          data?.message ||
            "Unable to open file."
        );

        return;
      }

      const blob =
        await response.blob();

      const fileURL =
        URL.createObjectURL(
          blob
        );

      if (newWindow) {
        newWindow.location.href =
          fileURL;
      } else {
        window.open(
          fileURL,
          "_blank"
        );
      }
    } catch (error) {
      console.error(error);

      if (newWindow) {
        newWindow.close();
      }

      setMessage(
        "Unable to open file."
      );
    }
  }

  // ==========================================
  // DOWNLOAD FILE
  // ==========================================

  async function handleDownloadFile(
    fileId: string,
    fileName: string
  ) {
    try {
      setMessage(
        "Downloading file..."
      );

      const response =
        await fetch(
          `${API_URL}/api/files/${fileId}/download`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        setMessage(
          data?.message ||
            "Unable to download file."
        );

        return;
      }

      const blob =
        await response.blob();

      const fileURL =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = fileURL;

      link.download =
        fileName;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      URL.revokeObjectURL(
        fileURL
      );

      setMessage(
        "File downloaded successfully! ⬇️"
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to download file."
      );
    }
  }

  // ==========================================
  // MODAL FUNCTIONS
  // ==========================================

  function openTrashModal(
    file: FileItem
  ) {
    setSelectedFile(file);

    setModalAction("trash");
  }

  function openDeleteModal(
    file: FileItem
  ) {
    setSelectedFile(file);

    setModalAction("delete");
  }

  function closeModal() {
    if (actionLoading) {
      return;
    }

    setModalAction(null);

    setSelectedFile(null);
  }

  // ==========================================
  // MOVE TO TRASH
  // ==========================================

  async function handleMoveToTrash() {
    if (!selectedFile) {
      return;
    }

    try {
      setActionLoading(true);

      const response =
        await fetch(
          `${API_URL}/api/files/${selectedFile.id}/trash`,
          {
            method: "PATCH",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        setMessage(
          data.message ||
            "Unable to move file to Trash."
        );

        return;
      }

      setFiles(
        (previous) =>
          previous.filter(
            (file) =>
              file.id !==
              selectedFile.id
          )
      );

      setStarredFiles(
        (previous) =>
          previous.filter(
            (file) =>
              file.id !==
              selectedFile.id
          )
      );

      setTrashFiles(
        (previous) => [
          data.file,
          ...previous,
        ]
      );

      setMessage(
        "File moved to Trash 🗑️"
      );

      setModalAction(null);

      setSelectedFile(null);
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to move file to Trash."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ==========================================
  // RESTORE FILE
  // ==========================================

  async function handleRestoreFile(
    fileId: string
  ) {
    try {
      const response =
        await fetch(
          `${API_URL}/api/files/${fileId}/restore`,
          {
            method: "PATCH",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        setMessage(
          data.message ||
            "Unable to restore file."
        );

        return;
      }

      setTrashFiles(
        (previous) =>
          previous.filter(
            (file) =>
              file.id !== fileId
          )
      );

      setFiles(
        (previous) => [
          data.file,
          ...previous,
        ]
      );

      setMessage(
        "File restored successfully! ♻️"
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to restore file."
      );
    }
  }

  // ==========================================
  // PERMANENT DELETE
  // ==========================================

  async function handlePermanentDelete() {
    if (!selectedFile) {
      return;
    }

    try {
      setActionLoading(true);

      const response =
        await fetch(
          `${API_URL}/api/files/${selectedFile.id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        setMessage(
          data.message ||
            "Unable to delete file."
        );

        return;
      }

      setTrashFiles(
        (previous) =>
          previous.filter(
            (file) =>
              file.id !==
              selectedFile.id
          )
      );

      setMessage(
        "File permanently deleted."
      );

      setModalAction(null);

      setSelectedFile(null);
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to delete file."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ==========================================
  // LOGIN PAGE
  // ==========================================

  if (!isLoggedIn) {
    return (
      <main className="loginPage">
        <div className="loginCard">

          <div className="loginLogo">

            <div className="loginLogoIcon">
              A
            </div>

            <h1>
              ARKIVRA
            </h1>

            <p>
              Your secure cloud storage
            </p>

          </div>

          <h2>
            {isSignup
              ? "Create Account"
              : "Welcome Back"}
          </h2>

          <p className="loginSubtitle">
            {isSignup
              ? "Create your ARKIVRA account"
              : "Login to access your files"}
          </p>

          {isSignup && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                handleAuth();
              }
            }}
          />

          {message && (
            <div className="authMessage">
              {message}
            </div>
          )}

          <button
            className="loginButton"
            onClick={handleAuth}
            disabled={authLoading}
          >
            {authLoading
              ? "Please wait..."
              : isSignup
              ? "Create Account"
              : "Login"}
          </button>

          <button
            className="switchButton"
            onClick={() => {
              setIsSignup(
                !isSignup
              );

              setMessage("");
            }}
          >
            {isSignup
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </button>

        </div>
      </main>
    );
  }

  // ==========================================
  // FOLDER NAVIGATION
  // ==========================================

  const visibleFolders =
    viewMode === "drive"
      ? folders.filter(
          (folder) =>
            folder.parentId ===
            currentFolderId
        )
      : viewMode === "starred"
      ? starredFolders
      : [];

  const displayedFiles =
    viewMode === "drive"
      ? files.filter(
          (file) =>
            (file.folderId || null) ===
            currentFolderId
        )
      : viewMode === "starred"
      ? starredFiles
      : trashFiles;

  const currentFolder =
    currentFolderId
      ? folders.find(
          (folder) =>
            folder.id ===
            currentFolderId
        )
      : null;

  // ==========================================
  // GET FOLDER PATH
  // ==========================================

  function getFolderPath() {
    if (!currentFolderId) {
      return [];
    }

    const path: Folder[] = [];

    let folder =
      folders.find(
        (item) =>
          item.id ===
          currentFolderId
      ) || null;

    while (folder) {
      path.unshift(folder);

      if (!folder.parentId) {
        break;
      }

      folder =
        folders.find(
          (item) =>
            item.id ===
            folder!.parentId
        ) || null;
    }

    return path;
  }

  const folderPath =
    getFolderPath();

  // ==========================================
  // GO BACK ONE FOLDER
  // ==========================================

  function goBackFolder() {
    if (!currentFolderId) {
      return;
    }

    if (currentFolder?.parentId) {
      setCurrentFolderId(
        currentFolder.parentId
      );
    } else {
      setCurrentFolderId(null);
    }
  }
  const breadcrumbFolders: Folder[] = [];

let breadcrumbFolderId = currentFolderId;

while (breadcrumbFolderId) {
  const folder = folders.find(
    (item) => item.id === breadcrumbFolderId
  );

  if (!folder) {
    break;
  }

  breadcrumbFolders.unshift(folder);

  breadcrumbFolderId = folder.parentId;
}

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <main className="app">

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside className="sidebar">

        <div className="logo">

          <div className="logoIcon">
            A
          </div>

          <h1>
            ARKIVRA
          </h1>

        </div>

        <button
          className="newButton"
          onClick={() => {
            if (
              viewMode === "drive"
            ) {
              document
                .getElementById(
                  "folderInput"
                )
                ?.focus();
            }
          }}
        >
          ＋ New
        </button>

        <nav>

          {/* MY DRIVE */}

          <button
            className={`navItem ${
              viewMode === "drive"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setViewMode("drive");

              setCurrentFolderId(null);

              setMessage("");
            }}
          >
            📁 My Drive
          </button>

          {/* STARRED */}

          <button
            className={`navItem ${
              viewMode === "starred"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setViewMode(
                "starred"
              );

              setCurrentFolderId(null);

              setMessage("");

              loadStarredData();
            }}
          >
            ⭐ Starred

            {(
              starredFiles.length +
              starredFolders.length
            ) > 0 &&
              ` (${
                starredFiles.length +
                starredFolders.length
              })`}
          </button>

          {/* TRASH */}

          <button
            className={`navItem ${
              viewMode === "trash"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setViewMode("trash");

              setCurrentFolderId(null);

              setMessage("");
            }}
          >
            🗑 Trash

            {trashFiles.length > 0 &&
              ` (${trashFiles.length})`}
          </button>

        </nav>

        <div className="storage">

          <p>
            Storage
          </p>

          <div className="storageBar">

            <div className="storageUsed" />

          </div>

          <span>
            {files.length} active files
          </span>

        </div>

      </aside>

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <section className="content">

        {/* ====================================
            HEADER
        ==================================== */}

        <header className="header">

          <div>

            <p className="welcome">
              WELCOME BACK 👋
            </p>

            <h2>
              {viewMode === "drive"
                ? currentFolder?.name ||
                  "My Drive"
                : viewMode === "starred"
                ? "Starred"
                : "Trash"}
            </h2>

            {/* BREADCRUMB */}

            {viewMode === "drive" &&
              currentFolderId && (

                <div className="breadcrumb">
  <button
    type="button"
    className="breadcrumbLink"
    onClick={() => {
      setCurrentFolderId(null);
      setViewMode("drive");
    }}
  >
    My Drive
  </button>

  {breadcrumbFolders.map((folder) => (
    <div
      className="breadcrumbItem"
      key={folder.id}
    >
      <span className="breadcrumbSeparator">
        /
      </span>

      <button
        type="button"
        className="breadcrumbLink"
        onClick={() => {
          setCurrentFolderId(folder.id);
          setViewMode("drive");
        }}
      >
        {folder.name}
      </button>
    </div>
  ))}
</div>

              )}

          </div>

          <div className="profile">

            <button
              className="logoutButton"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </header>

        {/* ====================================
            ACTIONS
        ==================================== */}

        {viewMode === "drive" && (

          <section className="actions">

            {/* BACK BUTTON */}

            {currentFolderId && (

              <button
  className="backButton"
  onClick={() => {
    setCurrentFolderId(null);
    setViewMode("drive");
  }}
>
  <span className="backArrow">←</span>
  Back
</button>

            )}

            {/* CREATE FOLDER */}

            <div className="createFolder">

              <input
                id="folderInput"
                value={folderName}
                onChange={(event) =>
                  setFolderName(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    createFolder();
                  }
                }}
                placeholder={
                  currentFolderId
                    ? "Enter subfolder name..."
                    : "Enter folder name..."
                }
              />

              <button
                onClick={
                  createFolder
                }
              >
                + Create Folder
              </button>

            </div>

            {/* UPLOAD */}

            <label className="uploadButton">

              ⬆ Upload File

              <input
                type="file"
                hidden
                onChange={(event) => {

                  const selected =
                    event.target
                      .files?.[0];

                  if (selected) {
                    uploadFile(
                      selected
                    );
                  }

                  event.target.value =
                    "";

                }}
              />

            </label>

          </section>

        )}

        {/* ====================================
            MESSAGE
        ==================================== */}

        {message && (

          <div className="message">
            {message}
          </div>

        )}

        {/* ====================================
            LOADING
        ==================================== */}

        {loading && (

          <div className="loading">
            Loading your cloud storage...
          </div>

        )}

        {/* ====================================
            FOLDERS
        ==================================== */}

        {viewMode !== "trash" && (

          <section className="section">

            <div className="sectionHeader">

              <h3>

                {viewMode === "starred"
                  ? "Starred Folders"
                  : "Folders"}

              </h3>

              <span>
                {visibleFolders.length}
                {" "}
                folders
              </span>

            </div>

            {visibleFolders.length ===
            0 ? (

              <div className="empty">

                📂

                <p>
                  No folders yet
                </p>

                <span>

                  {viewMode ===
                  "starred"

                    ? "Star your important folders to find them here."

                    : currentFolderId

                    ? "Create a subfolder here."

                    : "Create your first folder above."}

                </span>

              </div>

            ) : (

              <div className="grid">

                {visibleFolders.map(
                  (folder) => (

                    <div
                      className="card folderCard"
                      key={folder.id}

                      onClick={() => {

                        setCurrentFolderId(
                          folder.id
                        );

                        setViewMode(
                          "drive"
                        );

                      }}
                    >

                      <div className="cardTop">

                        <div className="folderIcon">
                          📁
                        </div>

                        <button
                          className="starButton"
                          title="Star folder"

                          onClick={(
                            event
                          ) => {

                            event.stopPropagation();

                            handleToggleFolderStar(
                              folder.id
                            );

                          }}
                        >

                          {starredFolders.some(
                            (
                              starredFolder
                            ) =>
                              starredFolder.id ===
                              folder.id
                          )
                            ? "⭐"
                            : "☆"}

                        </button>

                      </div>

                      <h4>
                        {folder.name}
                      </h4>

                      <p>
                        Folder
                      </p>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        )}

        {/* ====================================
            FILES
        ==================================== */}

        <section className="section">

          <div className="sectionHeader">

            <h3>

              {viewMode === "drive"

                ? "Files"

                : viewMode === "starred"

                ? "Starred Files"

                : "Trash Files"}

            </h3>

            <span>
              {displayedFiles.length}
              {" "}
              files
            </span>

          </div>

          {displayedFiles.length ===
          0 ? (

            <div className="empty">

              {viewMode === "drive"

                ? "📄"

                : viewMode ===
                  "starred"

                ? "⭐"

                : "🗑️"}

              <p>

                {viewMode === "drive"

                  ? "No files uploaded"

                  : viewMode ===
                    "starred"

                  ? "No starred files"

                  : "Trash is empty"}

              </p>

              <span>

                {viewMode === "drive"

                  ? currentFolderId

                    ? "Upload a file to this folder."

                    : "Upload your first file above."

                  : viewMode ===
                    "starred"

                  ? "Star your important files to find them quickly."

                  : "Deleted files will appear here."}

              </span>

            </div>

          ) : (

            <div className="fileList">

              {displayedFiles.map(
                (file) => (

                  <div
                    className={`fileRow ${
                      viewMode === "drive" ||
                      viewMode === "starred"
                        ? "clickableFileRow"
                        : ""
                    }`}
                    key={file.id}

                    onClick={() => {

                      if (
                        viewMode ===
                          "drive" ||
                        viewMode ===
                          "starred"
                      ) {
                        handleViewFile(
                          file.id
                        );
                      }

                    }}
                  >

                    {/* FILE INFO */}

                    <div className="fileInfo">

                      <span className="fileIcon">

                        {file.mimeType?.startsWith(
                          "image/"
                        )

                          ? "🖼️"

                          : file.mimeType ===
                            "application/pdf"

                          ? "📕"

                          : "📄"}

                      </span>

                      <div>

                        <h4>
                          {file.name}
                        </h4>

                        <p>

                          {file.size < 1024

                            ? `${file.size} bytes`

                            : `${(
                                file.size /
                                1024
                              ).toFixed(
                                2
                              )} KB`}

                        </p>

                      </div>

                    </div>

                    {/* FILE ACTIONS */}

                    <div className="fileActions">

                      {/* STAR */}

                      {(viewMode ===
                        "drive" ||
                        viewMode ===
                          "starred") && (

                        <button
                          className="starButton fileStarButton"

                          onClick={(
                            event
                          ) => {

                            event.stopPropagation();

                            handleToggleFileStar(
                              file.id
                            );

                          }}
                        >

                          {starredFiles.some(
                            (
                              starredFile
                            ) =>
                              starredFile.id ===
                              file.id
                          )

                            ? "⭐"

                            : "☆"}

                        </button>

                      )}

                      {/* NORMAL ACTIONS */}

                      {(viewMode ===
                        "drive" ||
                        viewMode ===
                          "starred") && (

                        <>

                          <button
                            className="viewButton"

                            onClick={(
                              event
                            ) => {

                              event.stopPropagation();

                              handleViewFile(
                                file.id
                              );

                            }}
                          >
                            👁 View
                          </button>

                          <button
                            className="downloadButton"

                            onClick={(
                              event
                            ) => {

                              event.stopPropagation();

                              handleDownloadFile(
                                file.id,
                                file.name
                              );

                            }}
                          >
                            ⬇ Download
                          </button>

                          <button
                            className="trashButton"

                            onClick={(
                              event
                            ) => {

                              event.stopPropagation();

                              openTrashModal(
                                file
                              );

                            }}
                          >
                            🗑 Trash
                          </button>

                        </>

                      )}

                      {/* TRASH ACTIONS */}

                      {viewMode ===
                        "trash" && (

                        <>

                          <button
                            className="restoreButton"

                            onClick={(
                              event
                            ) => {

                              event.stopPropagation();

                              handleRestoreFile(
                                file.id
                              );

                            }}
                          >
                            ♻ Restore
                          </button>

                          <button
                            className="deleteButton"

                            onClick={(
                              event
                            ) => {

                              event.stopPropagation();

                              openDeleteModal(
                                file
                              );

                            }}
                          >
                            ❌ Delete
                          </button>

                        </>

                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </section>

      {/* ======================================
          CONFIRMATION MODAL
      ====================================== */}

      {modalAction &&
        selectedFile && (

          <div
            className="modalOverlay"
            onClick={closeModal}
          >

            <div
              className="confirmModal"

              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div
                className={`modalIcon ${
                  modalAction ===
                  "delete"

                    ? "dangerIcon"

                    : "trashModalIcon"
                }`}
              >

                {modalAction ===
                "delete"

                  ? "⚠️"

                  : "🗑️"}

              </div>

              <h2>

                {modalAction ===
                "trash"

                  ? "Move to Trash?"

                  : "Delete Permanently?"}

              </h2>

              <p>

                {modalAction ===
                "trash"

                  ? "Are you sure you want to move this file to Trash?"

                  : "This file will be permanently deleted and cannot be recovered."}

              </p>

              <div className="modalFileName">

                📄 {selectedFile.name}

              </div>

              <div className="modalActions">

                <button
                  className="cancelModalButton"
                  onClick={closeModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                {modalAction ===
                "trash" ? (

                  <button
                    className="confirmTrashButton"

                    onClick={
                      handleMoveToTrash
                    }

                    disabled={
                      actionLoading
                    }
                  >

                    {actionLoading

                      ? "Moving..."

                      : "Yes, Move to Trash"}

                  </button>

                ) : (

                  <button
                    className="confirmDeleteButton"

                    onClick={
                      handlePermanentDelete
                    }

                    disabled={
                      actionLoading
                    }
                  >

                    {actionLoading

                      ? "Deleting..."

                      : "Yes, Delete"}

                  </button>

                )}

              </div>

            </div>

          </div>

        )}

    </main>
  );
}