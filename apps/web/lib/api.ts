const API_URL = "http://localhost:5000/api";

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("arkivra_token");
}

function getAuthHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

// ==========================================
// GET STARRED ITEMS
// ==========================================

export async function getStarredItems() {
  const response = await fetch(
    `${API_URL}/stars`,
    {
      method: "GET",

      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch starred items"
    );
  }

  return data;
}

// ==========================================
// STAR / UNSTAR FILE
// ==========================================

export async function toggleFileStar(
  fileId: string
) {
  const response = await fetch(
    `${API_URL}/stars/file/${fileId}`,
    {
      method: "POST",

      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to update file"
    );
  }

  return data;
}

// ==========================================
// STAR / UNSTAR FOLDER
// ==========================================

export async function toggleFolderStar(
  folderId: string
) {
  const response = await fetch(
    `${API_URL}/stars/folder/${folderId}`,
    {
      method: "POST",

      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to update folder"
    );
  }

  return data;
}