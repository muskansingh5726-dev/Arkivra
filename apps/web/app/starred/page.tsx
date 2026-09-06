"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./starred.module.css";

interface FileItem {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt?: string;
  starredAt?: string;
}

interface FolderItem {
  id: string;
  name: string;
  createdAt?: string;
  starredAt?: string;
}

export default function StarredPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const API_URL = "http://localhost:5000";

  // ==========================================
  // LOAD STARRED ITEMS
  // ==========================================

  async function loadStarredItems() {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login first.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/stars`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to load starred items"
        );

        setLoading(false);
        return;
      }

      setFiles(data.files || []);
      setFolders(data.folders || []);

    } catch (error) {
      console.error("Load starred items error:", error);

      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // UNSTAR FILE
  // ==========================================

  async function unstarFile(fileId: string) {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/stars/file/${fileId}`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to remove file from Starred"
        );

        return;
      }

      setFiles((currentFiles) =>
        currentFiles.filter(
          (file) => file.id !== fileId
        )
      );

      setMessage("File removed from Starred ⭐");

    } catch (error) {
      console.error("Unstar file error:", error);

      setMessage("Something went wrong.");
    }
  }

  // ==========================================
  // UNSTAR FOLDER
  // ==========================================

  async function unstarFolder(folderId: string) {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/stars/folder/${folderId}`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to remove folder from Starred"
        );

        return;
      }

      setFolders((currentFolders) =>
        currentFolders.filter(
          (folder) => folder.id !== folderId
        )
      );

      setMessage("Folder removed from Starred ⭐");

    } catch (error) {
      console.error("Unstar folder error:", error);

      setMessage("Something went wrong.");
    }
  }

  // ==========================================
  // FORMAT FILE SIZE
  // ==========================================

  function formatFileSize(bytes: number) {
    if (!bytes || bytes === 0) {
      return "0 Bytes";
    }

    const sizes = [
      "Bytes",
      "KB",
      "MB",
      "GB",
    ];

    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return `${(
      bytes / Math.pow(1024, index)
    ).toFixed(2)} ${sizes[index]}`;
  }

  // ==========================================
  // LOAD DATA ON PAGE OPEN
  // ==========================================

  useEffect(() => {
    loadStarredItems();
  }, []);

  return (
    <div className={styles.app}>

      {/* ========================================== */}
      {/* SIDEBAR */}
      {/* ========================================== */}

      <aside className={styles.sidebar}>

        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            A
          </div>

          <h1>ARKIVRA</h1>
        </div>

        <Link
          href="/"
          className={styles.newButton}
        >
          + New
        </Link>

        <nav>

          <Link
            href="/"
            className={styles.navItem}
          >
            📁 My Drive
          </Link>

          <Link
            href="/starred"
            className={`${styles.navItem} ${styles.active}`}
          >
            ⭐ Starred
          </Link>

          <Link
            href="/"
            className={styles.navItem}
          >
            🗑 Trash
          </Link>

        </nav>

        <div className={styles.sidebarBottom}>
          <p>ARKIVRA</p>
          <span>Secure Cloud Storage</span>
        </div>

      </aside>

      {/* ========================================== */}
      {/* MAIN CONTENT */}
      {/* ========================================== */}

      <main className={styles.content}>

        {/* HEADER */}

        <div className={styles.header}>

          <div>

            <p className={styles.welcome}>
              YOUR FAVORITES ⭐
            </p>

            <h2>Starred</h2>

            <p className={styles.subtitle}>
              Quick access to your important files and folders.
            </p>

          </div>

          <Link
            href="/"
            className={styles.backButton}
          >
            ← My Drive
          </Link>

        </div>

        {/* MESSAGE */}

        {message && (

          <div className={styles.message}>

            <span>
              {message}
            </span>

            <button
              onClick={() => setMessage("")}
            >
              ×
            </button>

          </div>

        )}

        {/* LOADING */}

        {loading && (

          <div className={styles.loading}>

            <div className={styles.spinner}></div>

            <p>
              Loading your starred items...
            </p>

          </div>

        )}

        {!loading && (

          <>

            {/* ========================================== */}
            {/* STARRED FOLDERS */}
            {/* ========================================== */}

            <section className={styles.section}>

              <div className={styles.sectionHeader}>

                <div>

                  <p className={styles.sectionLabel}>
                    ORGANIZATION
                  </p>

                  <h3>
                    ⭐ Starred Folders
                  </h3>

                </div>

                <span>
                  {folders.length}{" "}
                  {folders.length === 1
                    ? "folder"
                    : "folders"}
                </span>

              </div>

              {folders.length === 0 ? (

                <div className={styles.empty}>

                  <div className={styles.emptyIcon}>
                    📁
                  </div>

                  <h4>
                    No starred folders
                  </h4>

                  <p>
                    Star your important folders to
                    access them quickly here.
                  </p>

                </div>

              ) : (

                <div className={styles.folderGrid}>

                  {folders.map((folder) => (

                    <div
                      key={folder.id}
                      className={styles.folderCard}
                    >

                      <div
                        className={
                          styles.folderTop
                        }
                      >

                        <span
                          className={
                            styles.folderIcon
                          }
                        >
                          📁
                        </span>

                        <button
                          className={
                            styles.starButton
                          }
                          onClick={() =>
                            unstarFolder(
                              folder.id
                            )
                          }
                          title="Remove from Starred"
                        >
                          ⭐
                        </button>

                      </div>

                      <h4>
                        {folder.name}
                      </h4>

                      <p>
                        Folder
                      </p>

                    </div>

                  ))}

                </div>

              )}

            </section>

            {/* ========================================== */}
            {/* STARRED FILES */}
            {/* ========================================== */}

            <section className={styles.section}>

              <div className={styles.sectionHeader}>

                <div>

                  <p className={styles.sectionLabel}>
                    YOUR DOCUMENTS
                  </p>

                  <h3>
                    ⭐ Starred Files
                  </h3>

                </div>

                <span>
                  {files.length}{" "}
                  {files.length === 1
                    ? "file"
                    : "files"}
                </span>

              </div>

              {files.length === 0 ? (

                <div className={styles.empty}>

                  <div className={styles.emptyIcon}>
                    📄
                  </div>

                  <h4>
                    No starred files
                  </h4>

                  <p>
                    Your important starred files
                    will appear here.
                  </p>

                </div>

              ) : (

                <div className={styles.fileList}>

                  {files.map((file) => (

                    <div
                      key={file.id}
                      className={styles.fileRow}
                    >

                      <div
                        className={styles.fileInfo}
                      >

                        <div
                          className={styles.fileIcon}
                        >
                          📄
                        </div>

                        <div>

                          <h4>
                            {file.name}
                          </h4>

                          <p>
                            {formatFileSize(
                              file.size
                            )}
                          </p>

                        </div>

                      </div>

                      <div
                        className={styles.fileActions}
                      >

                        <button
                          className={
                            styles.unstarButton
                          }
                          onClick={() =>
                            unstarFile(
                              file.id
                            )
                          }
                        >
                          ★ Unstar
                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </section>

            {/* ========================================== */}
            {/* EMPTY COMPLETE STATE */}
            {/* ========================================== */}

            {files.length === 0 &&
              folders.length === 0 && (

                <div className={styles.noItems}>

                  <div>
                    ⭐
                  </div>

                  <h3>
                    Nothing starred yet
                  </h3>

                  <p>
                    Go to My Drive and star
                    files or folders you want
                    quick access to.
                  </p>

                  <Link href="/">
                    Go to My Drive →
                  </Link>

                </div>

              )}

          </>

        )}

      </main>

    </div>
  );
}