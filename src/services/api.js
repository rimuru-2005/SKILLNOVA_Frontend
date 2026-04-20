const BASE_URL = import.meta.env.VITE_API_BASE; // [cite: 138]

export const request = async (url, options = {}) => {
  const token = localStorage.getItem("token"); // [cite: 91]
  const headers = {
    "Content-Type": "application/json", // [cite: 95]
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`; // [cite: 96]
  }

  const response = await fetch(`${BASE_URL}${url}`, { // [cite: 92]
    ...options,
    headers,
  });

  if (!response.ok) throw new Error("API Error");
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? JSON.parse(text) : text;
};
