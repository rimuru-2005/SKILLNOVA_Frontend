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

export const getAdminUsers = () => {
  // MAKE API CALL
  // Expected response:
  // Array<{
  //   id?: string | number,
  //   _id?: string | number,
  //   name?: string,
  //   fullName?: string,
  //   email?: string,
  //   role?: string,
  //   dept?: string,
  //   department?: string,
  //   status?: string,
  //   avatar?: string,
  //   rating?: number
  // }>
  // or
  // {
  //   data?: User[],
  //   users?: User[],
  //   items?: User[]
  // }
  return request("/users");
};

export const createAdminUser = (user) => {
  // MAKE API CALL
  // Expected request body:
  // {
  //   name: string,
  //   email: string,
  //   role: string,
  //   dept: string,
  //   status: string,
  //   avatar: string,
  //   rating: number
  // }
  return request("/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
};

export const updateAdminUser = (id, updates) => {
  // MAKE API CALL
  // Expected request body:
  // Partial<{
  //   role: string,
  //   status: string,
  //   dept: string,
  //   rating: number
  // }>
  return request(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
};

export const terminateAdminUser = (id) => {
  // MAKE API CALL
  // Placeholder endpoint for revoking user access while preserving separate delete behavior.
  return request(`/users/${id}/terminate`, {
    method: "PATCH",
  });
};

export const deleteAdminUser = (id) => {
  // MAKE API CALL
  return request(`/users/${id}`, {
    method: "DELETE",
  });
};

export const getAdminSettings = () => {
  // API CALL
  // Expected response:
  // {
  //   smtp?: boolean,
  //   maintenance?: boolean,
  //   registration?: boolean,
  //   aiAssistant?: boolean,
  //   auditLog?: boolean,
  //   twoFactor?: boolean,
  //   maxInterns?: number,
  //   platformName?: string
  // }
  // or
  // {
  //   data?: AdminSettings
  // }
  return request("/admin/settings");
};

export const updateAdminSettings = (settings) => {
  // API CALL
  // Expected request body:
  // {
  //   smtp: boolean,
  //   maintenance: boolean,
  //   registration: boolean,
  //   aiAssistant: boolean,
  //   auditLog: boolean,
  //   twoFactor: boolean,
  //   maxInterns: number,
  //   platformName: string
  // }
  return request("/admin/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
};

export const resetAdminUserData = () => {
  // API CALL
  return request("/admin/reset-user-data", {
    method: "POST",
  });
};

export const deleteAdminPlatform = () => {
  // API CALL
  return request("/admin/platform", {
    method: "DELETE",
  });
};

export const getUserSettings = () => {
  // API CALL
  // Expected response:
  // {
  //   notifications?: boolean,
  //   privateAccount?: boolean,
  //   twoFactor?: boolean,
  //   darkMode?: boolean,
  //   language?: string,
  //   availableLanguages?: string[]
  // }
  // or
  // {
  //   data?: UserSettings
  // }
  return request("/users/settings");
};

export const updateUserSettings = (settings) => {
  // API CALL
  // Expected request body:
  // Partial<{
  //   notifications: boolean,
  //   privateAccount: boolean,
  //   twoFactor: boolean,
  //   darkMode: boolean,
  //   language: string
  // }>
  return request("/users/settings", {
    method: "PATCH",
    body: JSON.stringify(settings),
  });
};

export const deactivateCurrentUser = () => {
  // API CALL
  return request("/users/me/deactivate", {
    method: "POST",
  });
};

export const deleteCurrentUser = (payload = {}) => {
  // API CALL
  // Expected request body:
  // {
  //   reason?: string
  // }
  return request("/users/me", {
    method: "DELETE",
    body: JSON.stringify(payload),
  });
};

export const getAdminReports = () => {
  // API CALL
  // Expected response:
  // Array<{
  //   id?: string | number,
  //   _id?: string | number,
  //   title?: string,
  //   name?: string,
  //   intern?: string,
  //   internName?: string,
  //   user?: string,
  //   status?: string,
  //   score?: number,
  //   rating?: number,
  //   date?: string,
  //   submittedAt?: string,
  //   createdAt?: string,
  //   downloadUrl?: string,
  //   fileUrl?: string,
  //   url?: string
  // }>
  // or
  // {
  //   data?: Report[],
  //   reports?: Report[],
  //   items?: Report[]
  // }
  return request("/admin/reports");
};

export const approveAdminReport = (id, payload = {}) => {
  // API CALL
  // Expected request body:
  // {
  //   status?: string,
  //   score?: number
  // }
  return request(`/admin/reports/${id}/approve`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const getUserReports = () => {
  // API CALL
  // Expected response:
  // Array<Report>
  // or
  // {
  //   data?: Report[],
  //   reports?: Report[],
  //   items?: Report[]
  // }
  return request("/users/reports");
};

export const createUserReport = (report) => {
  // API CALL
  // Expected request body:
  // {
  //   title: string,
  //   summary?: string
  // }
  return request("/users/reports", {
    method: "POST",
    body: JSON.stringify(report),
  });
};
