import { request } from "./api";

// Centralized API client for frontend integration.
// Each function below is the single place that knows the endpoint path and HTTP method.
// As backend routes stabilize, update this file first and keep component code focused on UI.

export const getCurrentUser = () => {
  // API CALL
  // Expected response:
  // {
  //   name: string,
  //   email: string,
  //   role: string,
  //   department: string,
  //   college: string,
  //   dob: string,
  //   year: string,
  //   linkedin: string,
  //   skills: string
  // }
  return request("/users/me");
};

export const updateCurrentUser = (profile) => {
  // API CALL
  // Expected request body:
  // {
  //   name: string,
  //   email: string,
  //   role: string,
  //   department: string,
  //   college: string,
  //   dob: string,
  //   year: string,
  //   linkedin: string,
  //   skills: string
  // }
  // Expected response:
  // {
  //   success?: boolean,
  //   message?: string,
  //   data?: object
  // }
  return request("/users/me", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
};

export const getPlatformSettings = () => {
  // API CALL
  // Placeholder endpoint until backend finalizes platform metadata.
  // Expected response:
  // {
  //   platformInitials?: string,
  //   platformName?: string,
  //   name?: string,
  //   company?: string,
  //   organization?: string,
  //   orgName?: string,
  //   siteName?: string
  // }
  return request("/platform/settings");
};

export const getAnnouncements = () => {
  // API CALL
  // Expected response:
  // [
  //   {
  //     id: string | number,
  //     title?: string,
  //     message?: string,
  //     text?: string,
  //     priority?: string,
  //     pinned?: boolean,
  //     createdAt?: string,
  //     updatedAt?: string,
  //     date?: string,
  //     publishedAt?: string
  //   }
  // ]
  // or
  // {
  //   announcements?: Announcement[],
  //   items?: Announcement[]
  // }
  return request("/announcements");
};

export const getAiSuggestions = () => {
  // API CALL
  // Expected response:
  // string[]
  // or
  // { data: string[] }
  return request("/suggestions");
};

export const getAiCapabilities = () => {
  // API CALL
  // Expected response:
  // string[]
  // or
  // { data: string[] }
  return request("/capabilities");
};

export const getAiWelcomeMessage = () => {
  // API CALL
  // Expected response:
  // {
  //   message?: string
  // }
  return request("/welcome-message");
};

export const sendAiChatMessage = (message) => {
  // API CALL
  // Expected request body:
  // {
  //   message: string
  // }
  // Expected response:
  // {
  //   reply?: string,
  //   message?: string
  // }
  return request("/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
};

export const getReports = () => {
  // API CALL
  // Expected response:
  // {
  //   milestones?: Array<{
  //     id: string | number,
  //     title: string,
  //     status: string,
  //     icon?: string
  //   }>,
  //   analytics?: Array<{
  //     name: string,
  //     progress: number
  //   }>,
  //   distribution?: Array<{
  //     name: string,
  //     value: number
  //   }>
  // }
  return request("/reports");
};

export const getInterns = () => {
  // API CALL
  // Expected response:
  // Array<{
  //   id: string | number,
  //   name: string,
  //   department: string,
  //   attendance: string,
  //   task: string,
  //   rating: number,
  //   status: string
  // }>
  // or
  // {
  //   success?: boolean,
  //   data?: Intern[]
  // }
  return request("/interns");
};

export const updateInternAttendance = (id) => {
  // API CALL
  // Expected response:
  // {
  //   id: string | number,
  //   name: string,
  //   department: string,
  //   attendance: string,
  //   task: string,
  //   rating: number,
  //   status: string
  // }
  return request(`/interns/${id}/attendance`, {
    method: "PATCH",
  });
};

export const updateInternStatus = (id) => {
  // API CALL
  // Expected response:
  // {
  //   id: string | number,
  //   name: string,
  //   department: string,
  //   attendance: string,
  //   task: string,
  //   rating: number,
  //   status: string
  // }
  return request(`/interns/${id}/status`, {
    method: "PATCH",
  });
};
