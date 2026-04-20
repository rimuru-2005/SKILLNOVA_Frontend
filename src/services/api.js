const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  "http://localhost:5000/api";

export const request = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const contentType = response.headers.get("content-type") || "";
  const data = !text ? null : contentType.includes("application/json") ? JSON.parse(text) : text;

  if (!response.ok) {
    const error = new Error(
      data?.message || data?.error || `Request failed with status ${response.status}`,
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  if (response.status === 204) return null;
  return data;
};
