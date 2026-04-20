import { request } from "./api";
import { findAuthUser, getAuthUsers } from "../auth/utils/mockAuth";

// Centralized API client for frontend integration.
// Each function below is the single place that knows the endpoint path and HTTP method.
// As backend routes stabilize, update this file first and keep component code focused on UI.

const AUTH_SESSION_STORAGE_KEY = "skillnova-auth-session";

const readAuthSession = () => {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return {
      role: parsed.role === "admin" ? "admin" : "intern",
      email: String(parsed.email || "").trim().toLowerCase(),
      token: parsed.token || localStorage.getItem("token") || null,
    };
  } catch {
    return null;
  }
};

const writeAuthSession = (session) => {
  localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
};

const getAuthUserByEmail = (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return getAuthUsers().find((user) => user.email.toLowerCase() === normalizedEmail) || null;
};

const isMissingAuthEndpointError = (error) =>
  !error?.status || [404, 405, 501].includes(error.status);

// Auth
export const getStoredAuthSession = () => {
  return readAuthSession();
};

export const persistAuthSession = ({ role, email, token = null }) => {
  const session = {
    role: role === "admin" ? "admin" : "intern",
    email: String(email || "").trim().toLowerCase(),
    token: token || null,
  };

  writeAuthSession(session);

  if (session.token) {
    localStorage.setItem("token", session.token);
  } else {
    localStorage.removeItem("token");
  }

  return session;
};

export const clearStoredAuthSession = () => {
  localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  localStorage.removeItem("token");
};

export const loginUser = async (email, password) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  try {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: normalizedEmail, password }),
    });

    return {
      role: data?.role === "admin" ? "admin" : "intern",
      email: String(data?.email || normalizedEmail).trim().toLowerCase(),
      token: data?.token || null,
    };
  } catch (error) {
    const fallbackUser = findAuthUser(normalizedEmail, password);

    if (fallbackUser) {
      return {
        role: fallbackUser.role,
        email: fallbackUser.email,
        token: null,
        usingFallback: true,
      };
    }

    throw error;
  }
};

export const sendAdminOtp = async (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  try {
    return await request("/auth/admin/send-otp", {
      method: "POST",
      body: JSON.stringify({ email: normalizedEmail }),
    });
  } catch (error) {
    const fallbackUser = getAuthUserByEmail(normalizedEmail);

    if (isMissingAuthEndpointError(error) && fallbackUser?.role === "admin") {
      return { message: "Demo OTP ready" };
    }

    throw error;
  }
};

export const verifyAdminOtp = async (email, otp) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  try {
    return await request("/auth/admin/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email: normalizedEmail, otp }),
    });
  } catch (error) {
    const fallbackUser = getAuthUserByEmail(normalizedEmail);

    if (isMissingAuthEndpointError(error) && fallbackUser?.role === "admin") {
      if (otp === "123456") {
        return { token: `demo-admin-token-${normalizedEmail}` };
      }

      throw new Error("Invalid OTP code. Use 123456 for demo.");
    }

    throw error;
  }
};

export const verifyUserTwoFactor = async (email, code) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  try {
    return await request("/auth/user/verify-2fa", {
      method: "POST",
      body: JSON.stringify({ email: normalizedEmail, code }),
    });
  } catch (error) {
    const fallbackUser = getAuthUserByEmail(normalizedEmail);

    if (isMissingAuthEndpointError(error) && fallbackUser?.role !== "admin") {
      if (code === "654321") {
        return { token: `demo-user-token-${normalizedEmail}` };
      }

      throw new Error("Invalid authenticator code. Use 654321 for demo.");
    }

    throw error;
  }
};

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

export const createAnnouncement = (announcement) => {
  // API CALL
  // Expected request body:
  // {
  //   title: string,
  //   content: string,
  //   priority?: string
  // }
  return request("/announcements", {
    method: "POST",
    body: JSON.stringify(announcement),
  });
};

export const updateAnnouncement = (id, payload) => {
  // API CALL
  // Expected request body:
  // Partial<{
  //   title: string,
  //   content: string,
  //   priority: string,
  //   pinned: boolean
  // }>
  return request(`/announcements/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteAnnouncement = (id) => {
  // API CALL
  return request(`/announcements/${id}`, {
    method: "DELETE",
  });
};

const USER_ANNOUNCEMENT_PINS_STORAGE_KEY = "user-announcement-pins";

const readAnnouncementPins = () => {
  try {
    const raw = localStorage.getItem(USER_ANNOUNCEMENT_PINS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAnnouncementPins = (ids) => {
  localStorage.setItem(USER_ANNOUNCEMENT_PINS_STORAGE_KEY, JSON.stringify(ids));
};

export const getUserAnnouncementPins = async () => {
  // LOCAL PERSISTENCE FALLBACK
  // Replace with a backend endpoint when available.
  return readAnnouncementPins();
};

export const setUserAnnouncementPin = async (id, pinned) => {
  // LOCAL PERSISTENCE FALLBACK
  // Replace with a backend endpoint when available.
  const currentPins = readAnnouncementPins();
  const nextPins = pinned
    ? Array.from(new Set([...currentPins, id]))
    : currentPins.filter((item) => item !== id);

  writeAnnouncementPins(nextPins);
  return nextPins;
};

const QA_STORAGE_KEY = "qa-questions";
const DEFAULT_QA_QUESTIONS = [
  {
    id: 1,
    title: "How do I submit my weekly internship report?",
    category: "Reports",
    votes: 14,
    answers: 4,
    author: "Rahul Sharma",
    time: "2h ago",
  },
  {
    id: 2,
    title: "Where can I find project documentation?",
    category: "Knowledge Base",
    votes: 9,
    answers: 3,
    author: "Priya Patel",
    time: "5h ago",
  },
  {
    id: 3,
    title: "How do I schedule a meeting with my mentor?",
    category: "Meetings",
    votes: 6,
    answers: 2,
    author: "Amit Verma",
    time: "1d ago",
  },
  {
    id: 4,
    title: "What format should my weekly report be in?",
    category: "Reports",
    votes: 4,
    answers: 1,
    author: "Sneha Reddy",
    time: "2d ago",
  },
];

const readQaQuestions = () => {
  try {
    const raw = localStorage.getItem(QA_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_QA_QUESTIONS;
  } catch {
    return DEFAULT_QA_QUESTIONS;
  }
};

const writeQaQuestions = (questions) => {
  localStorage.setItem(QA_STORAGE_KEY, JSON.stringify(questions));
};

export const getQaQuestions = async () => {
  // LOCAL PERSISTENCE FALLBACK
  // Replace with a backend endpoint when available.
  return readQaQuestions();
};

export const createQaQuestion = async (payload) => {
  // LOCAL PERSISTENCE FALLBACK
  // Replace with a backend endpoint when available.
  const nextQuestion = {
    id: Date.now(),
    title: payload.title,
    category: payload.category || "Projects",
    votes: 0,
    answers: 0,
    author: payload.author || "You",
    time: "Just now",
  };

  const nextQuestions = [nextQuestion, ...readQaQuestions()];
  writeQaQuestions(nextQuestions);
  return nextQuestion;
};

export const upvoteQaQuestion = async (id) => {
  // LOCAL PERSISTENCE FALLBACK
  // Replace with a backend endpoint when available.
  let updatedQuestion = null;

  const nextQuestions = readQaQuestions().map((question) => {
    if (question.id !== id) {
      return question;
    }

    updatedQuestion = { ...question, votes: question.votes + 1 };
    return updatedQuestion;
  });

  writeQaQuestions(nextQuestions);
  return updatedQuestion;
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

export const getAiAssistantBootstrap = async () => {
  const [suggestionsResult, capabilitiesResult, welcomeResult] = await Promise.allSettled([
    getAiSuggestions(),
    getAiCapabilities(),
    getAiWelcomeMessage(),
  ]);

  if (
    suggestionsResult.status === "rejected" &&
    capabilitiesResult.status === "rejected" &&
    welcomeResult.status === "rejected"
  ) {
    throw new Error("AI assistant bootstrap unavailable");
  }

  return {
    suggestions:
      suggestionsResult.status === "fulfilled"
        ? suggestionsResult.value?.data ?? suggestionsResult.value ?? []
        : [],
    capabilities:
      capabilitiesResult.status === "fulfilled"
        ? capabilitiesResult.value?.data ?? capabilitiesResult.value ?? []
        : [],
    welcomeMessage:
      welcomeResult.status === "fulfilled"
        ? welcomeResult.value?.message || "Hello! How can I help you today?"
        : "Hello! How can I help you today?",
    partialData:
      suggestionsResult.status === "rejected" ||
      capabilitiesResult.status === "rejected" ||
      welcomeResult.status === "rejected",
  };
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

export const getAdminKnowledgeArticles = () => {
  // API CALL
  // Expected response:
  // Array<{
  //   id?: string | number,
  //   _id?: string | number,
  //   title?: string,
  //   category?: string,
  //   author?: string,
  //   views?: number,
  //   helpful?: number,
  //   verified?: boolean,
  //   date?: string,
  //   createdAt?: string,
  //   updatedAt?: string,
  //   tags?: string[],
  //   content?: string,
  //   summary?: string
  // }>
  // or
  // {
  //   data?: Article[],
  //   articles?: Article[],
  //   items?: Article[]
  // }
  return request("/admin/knowledge/articles");
};

export const createAdminKnowledgeArticle = (article) => {
  // API CALL
  // Expected request body:
  // {
  //   title: string,
  //   category: string,
  //   content?: string,
  //   summary?: string
  // }
  return request("/admin/knowledge/articles", {
    method: "POST",
    body: JSON.stringify(article),
  });
};

export const updateAdminKnowledgeArticle = (id, payload) => {
  // API CALL
  // Expected request body:
  // Partial<{
  //   verified: boolean,
  //   title: string,
  //   category: string,
  //   content: string,
  //   summary: string
  // }>
  return request(`/admin/knowledge/articles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteAdminKnowledgeArticle = (id) => {
  // API CALL
  return request(`/admin/knowledge/articles/${id}`, {
    method: "DELETE",
  });
};

export const getKnowledgeArticles = () => {
  // API CALL
  // Expected response:
  // Array<Article>
  // or
  // {
  //   data?: Article[],
  //   articles?: Article[],
  //   items?: Article[]
  // }
  return request("/knowledge/articles");
};

export const submitKnowledgeArticleFeedback = (id, payload) => {
  // API CALL
  // Expected request body:
  // {
  //   helpful: boolean
  // }
  return request(`/knowledge/articles/${id}/feedback`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// Dashboard
const getDashboardList = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const parseDashboardDate = (value) => {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeDashboardStatus = (value, fallback = "Pending") => {
  const normalized = String(value || "").trim().toLowerCase();

  if (["reviewed", "approved", "verified"].includes(normalized)) return "Reviewed";
  if (["active", "present"].includes(normalized)) return "Active";
  if (["inactive", "absent"].includes(normalized)) return "Inactive";
  return fallback;
};

const formatDashboardRelativeTime = (date) => {
  if (!(date instanceof Date)) return "New";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

const getDashboardDays = (count) => {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (count - index - 1));
    return date;
  });
};

const buildDashboardDailyCounts = (items, count) => {
  const days = getDashboardDays(count);

  return days.map((date) => {
    const dayKey = date.toDateString();

    return {
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      count: items.filter((item) => item.timestamp?.toDateString() === dayKey).length,
    };
  });
};

const normalizeDashboardProfile = (item) => {
  if (!item || typeof item !== "object") {
    return {
      name: "User",
      role: "Member",
      score: null,
      attendance: null,
      skills: [],
    };
  }

  const score = Number.parseFloat(item.rating ?? item.score ?? item.performance);
  const attendance = Number.parseFloat(
    item.attendanceRate ?? item.attendancePercentage ?? item.attendance,
  );

  return {
    name: item.name || "User",
    role: item.role || "Member",
    score: Number.isNaN(score) ? null : Number(score.toFixed(1)),
    attendance: Number.isNaN(attendance) ? null : Math.round(attendance),
    skills:
      typeof item.skills === "string"
        ? item.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        : Array.isArray(item.skills)
          ? item.skills.filter(Boolean)
          : [],
  };
};

const normalizeDashboardIntern = (item) => {
  if (!item || typeof item !== "object") return null;

  const rating = Number.parseFloat(item.rating ?? item.score);

  return {
    id: item.id ?? item._id ?? item.email ?? item.name ?? "intern",
    name: item.name || item.fullName || "Unknown intern",
    department: item.department || item.dept || "General",
    attendance:
      String(item.attendance || "").trim().toLowerCase() === "absent" ? "Absent" : "Present",
    status: normalizeDashboardStatus(item.status, "Active"),
    rating: Number.isNaN(rating) ? null : Number(rating.toFixed(1)),
    createdAt: parseDashboardDate(item.createdAt || item.date || item.joinedAt),
  };
};

const normalizeDashboardUser = (item) => {
  if (!item || typeof item !== "object") return null;

  return {
    id: item.id ?? item._id ?? item.email ?? item.name ?? "user",
    name: item.name || item.fullName || "Unknown user",
    status: normalizeDashboardStatus(item.status, "Active"),
    role: item.role || "User",
    createdAt: parseDashboardDate(item.createdAt || item.updatedAt || item.date),
  };
};

const normalizeDashboardReport = (item) => {
  if (!item || typeof item !== "object") return null;

  const score = Number.parseFloat(item.score ?? item.rating);
  const timestamp = parseDashboardDate(
    item.date || item.submittedAt || item.createdAt || item.updatedAt,
  );

  return {
    id: item.id ?? item._id ?? item.title ?? "report",
    title: item.title || item.name || "Untitled report",
    status: normalizeDashboardStatus(item.status),
    score: Number.isNaN(score) ? null : Number(score.toFixed(1)),
    timestamp,
    actor: item.intern || item.internName || item.user || "Unknown user",
  };
};

const normalizeDashboardArticle = (item) => {
  if (!item || typeof item !== "object") return null;

  return {
    id: item.id ?? item._id ?? item.title ?? "article",
    title: item.title || "Untitled article",
    category: item.category || "General",
    verified: Boolean(item.verified),
    timestamp: parseDashboardDate(item.updatedAt || item.createdAt || item.date),
  };
};

const normalizeDashboardAnnouncement = (item) => {
  if (!item || typeof item !== "object") return null;

  return {
    id: item.id ?? item._id ?? item.title ?? "announcement",
    title: item.title || item.message || item.text || "New announcement",
    priority: String(item.priority || "").toLowerCase(),
    pinned: Boolean(item.pinned),
    timestamp: parseDashboardDate(
      item.createdAt || item.updatedAt || item.date || item.publishedAt,
    ),
  };
};

const normalizeDashboardMilestone = (item, index) => {
  if (!item || typeof item !== "object") return null;

  return {
    id: item.id ?? `milestone-${index}`,
    title: item.title || item.name || `Task ${index + 1}`,
    status: String(item.status || "").trim().toLowerCase() || "not-started",
  };
};

const buildAdminRecentActions = ({ reports, users, articles, announcements }) => {
  return [
    ...reports
      .filter((item) => item.timestamp)
      .map((item) => ({
        action: item.status === "Reviewed" ? "Report reviewed" : "Report submitted",
        detail: `${item.title} · ${item.actor}`,
        time: formatDashboardRelativeTime(item.timestamp).replace(" ago", ""),
        sortValue: item.timestamp.getTime(),
        color: item.status === "Reviewed" ? "green" : "orange",
      })),
    ...users
      .filter((item) => item.createdAt)
      .map((item) => ({
        action: "User updated",
        detail: `${item.name} · ${item.role}`,
        time: formatDashboardRelativeTime(item.createdAt).replace(" ago", ""),
        sortValue: item.createdAt.getTime(),
        color: item.status === "Active" ? "green" : "dark",
      })),
    ...articles
      .filter((item) => item.timestamp)
      .map((item) => ({
        action: item.verified ? "Article verified" : "Article updated",
        detail: item.title,
        time: formatDashboardRelativeTime(item.timestamp).replace(" ago", ""),
        sortValue: item.timestamp.getTime(),
        color: item.verified ? "green" : "orange",
      })),
    ...announcements
      .filter((item) => item.timestamp)
      .map((item) => ({
        action: "Announcement posted",
        detail: item.title,
        time: formatDashboardRelativeTime(item.timestamp).replace(" ago", ""),
        sortValue: item.timestamp.getTime(),
        color: item.pinned || item.priority === "high" ? "orange" : "dark",
      })),
  ]
    .sort((left, right) => right.sortValue - left.sortValue)
    .slice(0, 5);
};

const buildUserRecentActivity = ({ reports, announcements, articles }) => {
  return [
    ...reports
      .filter((item) => item.timestamp)
      .map((item) => ({
        icon: item.status === "Reviewed" ? "✅" : "📄",
        text:
          item.status === "Reviewed"
            ? `Report reviewed: ${item.title}`
            : `Submitted report: ${item.title}`,
        time: formatDashboardRelativeTime(item.timestamp),
        sortValue: item.timestamp.getTime(),
      })),
    ...announcements
      .filter((item) => item.timestamp)
      .map((item) => ({
        icon: item.pinned || item.priority === "high" ? "📢" : "🔔",
        text: item.title,
        time: formatDashboardRelativeTime(item.timestamp),
        sortValue: item.timestamp.getTime(),
      })),
    ...articles
      .filter((item) => item.timestamp)
      .map((item) => ({
        icon: "📚",
        text: `Knowledge update: ${item.title}`,
        time: formatDashboardRelativeTime(item.timestamp),
        sortValue: item.timestamp.getTime(),
      })),
  ]
    .sort((left, right) => right.sortValue - left.sortValue)
    .slice(0, 4);
};

const getDashboardSkillDistribution = (distribution, skills) => {
  if (Array.isArray(distribution) && distribution.length > 0) {
    return distribution
      .map((item) => ({
        name: item?.name || item?.label || "Skill",
        value: Number.parseFloat(item?.value) || 0,
      }))
      .filter((item) => item.value > 0);
  }

  if (!Array.isArray(skills) || skills.length === 0) return [];

  const limitedSkills = skills.slice(0, 5);
  const percentage = Math.floor(100 / limitedSkills.length);
  const remainder = 100 - percentage * limitedSkills.length;

  return limitedSkills.map((skill, index) => ({
    name: skill,
    value: percentage + (index === 0 ? remainder : 0),
  }));
};

const getDashboardPendingTasks = (milestones, reports) => {
  const milestoneTasks = milestones
    .filter((item) => item.status !== "completed")
    .map((item) => ({
      title: item.title,
      priority: item.status === "in-progress" ? "High" : "Medium",
      due: item.status === "in-progress" ? "In Progress" : "Planned",
    }));

  if (milestoneTasks.length > 0) {
    return milestoneTasks.slice(0, 4);
  }

  return reports
    .filter((item) => item.status === "Pending")
    .slice(0, 4)
    .map((item) => ({
      title: item.title,
      priority: "High",
      due: "Pending",
    }));
};

// Dashboard service aggregator.
// When backend endpoints like `/admin/dashboard` or `/users/dashboard` are available,
// update only these functions and keep dashboard components unchanged.
export const getAdminDashboardData = async () => {
  const results = await Promise.allSettled([
    getCurrentUser(),
    getInterns(),
    getAdminUsers(),
    getAdminReports(),
    getAdminKnowledgeArticles(),
    getAnnouncements(),
  ]);

  const [profileResult, internsResult, usersResult, reportsResult, articlesResult, announcementsResult] =
    results;

  const profile = normalizeDashboardProfile(
    profileResult.status === "fulfilled" ? profileResult.value : null,
  );
  const interns =
    internsResult.status === "fulfilled"
      ? getDashboardList(internsResult.value).map(normalizeDashboardIntern).filter(Boolean)
      : [];
  const users =
    usersResult.status === "fulfilled"
      ? getDashboardList(usersResult.value, ["users"]).map(normalizeDashboardUser).filter(Boolean)
      : [];
  const reports =
    reportsResult.status === "fulfilled"
      ? getDashboardList(reportsResult.value, ["reports"]).map(normalizeDashboardReport).filter(Boolean)
      : [];
  const articles =
    articlesResult.status === "fulfilled"
      ? getDashboardList(articlesResult.value, ["articles"]).map(normalizeDashboardArticle).filter(Boolean)
      : [];
  const announcements =
    announcementsResult.status === "fulfilled"
      ? getDashboardList(announcementsResult.value, ["announcements"])
          .map(normalizeDashboardAnnouncement)
          .filter(Boolean)
      : [];

  const failedSections = results.filter((result) => result.status === "rejected").length;

  if (
    failedSections === results.length ||
    (!interns.length && !users.length && !reports.length && !articles.length && !announcements.length)
  ) {
    throw new Error("Dashboard data unavailable");
  }

  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  const reportsThisWeek = reports.filter((item) => item.timestamp && item.timestamp >= weekAgo);
  const activeUsers =
    users.filter((item) => item.status === "Active").length ||
    interns.filter((item) => item.status === "Active").length;
  const pendingReviews = reports.filter((item) => item.status === "Pending").length;
  const scoredReports = reports.map((item) => item.score).filter((item) => item !== null);
  const avgScore = scoredReports.length
    ? (scoredReports.reduce((sum, value) => sum + value, 0) / scoredReports.length).toFixed(1)
    : "0.0";
  const presentCount = interns.filter((item) => item.attendance === "Present").length;
  const attendanceRate = interns.length ? Math.round((presentCount / interns.length) * 100) : 0;

  const reportTrend = buildDashboardDailyCounts(reports, 5);
  const userTrend = buildDashboardDailyCounts(
    users.map((item) => ({ timestamp: item.createdAt })).filter((item) => item.timestamp),
    5,
  );
  const weeklyActivity = reportTrend.map((item, index) => ({
    day: item.label,
    reports: item.count,
    users: userTrend[index]?.count ?? 0,
  }));

  const activityTrend = buildDashboardDailyCounts(
    [
      ...reports.map((item) => ({ timestamp: item.timestamp })),
      ...articles.map((item) => ({ timestamp: item.timestamp })),
      ...announcements.map((item) => ({ timestamp: item.timestamp })),
    ].filter((item) => item.timestamp),
    7,
  ).map((item) => ({
    day: item.label,
    activity: item.count,
  }));

  return {
    profile,
    partialData: failedSections > 0,
    heroLabel: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    heroStats: [
      {
        value: String(interns.length),
        label: "Total Interns",
        change: `${presentCount} present`,
      },
      {
        value: String(activeUsers),
        label: "Active Users",
        change: `${users.length || interns.length} total tracked`,
      },
      {
        value: String(reportsThisWeek.length),
        label: "Reports This Week",
        change: `${pendingReviews} pending`,
      },
      {
        value: String(articles.length),
        label: "KB Articles",
        change: `${articles.filter((item) => item.verified).length} verified`,
      },
    ],
    statCards: [
      {
        title: "Pending Reviews",
        value: String(pendingReviews),
        color: "#ff6d34",
      },
      {
        title: "Avg Score",
        value: `${avgScore}/10`,
        color: "#00bea3",
      },
      {
        title: "Attendance Rate",
        value: `${attendanceRate}%`,
        color: "#00bea3",
      },
      {
        title: "Announcements",
        value: String(announcements.length),
        color: "#ff6d34",
      },
    ],
    weeklyActivity,
    recentActions: buildAdminRecentActions({ reports, users, articles, announcements }),
    activityTrend,
  };
};

export const getUserDashboardData = async () => {
  const results = await Promise.allSettled([
    getCurrentUser(),
    getUserReports(),
    getReports(),
    getAnnouncements(),
    getKnowledgeArticles(),
  ]);

  const [profileResult, userReportsResult, projectResult, announcementsResult, knowledgeResult] =
    results;

  const profile = normalizeDashboardProfile(
    profileResult.status === "fulfilled" ? profileResult.value : null,
  );
  const reports =
    userReportsResult.status === "fulfilled"
      ? getDashboardList(userReportsResult.value, ["reports"])
          .map(normalizeDashboardReport)
          .filter(Boolean)
      : [];
  const projectSource = projectResult.status === "fulfilled" ? projectResult.value ?? {} : {};
  const milestones = Array.isArray(projectSource?.milestones)
    ? projectSource.milestones.map(normalizeDashboardMilestone).filter(Boolean)
    : [];
  const analytics = Array.isArray(projectSource?.analytics)
    ? projectSource.analytics
        .map((item, index) => ({
          label: item?.name || `Step ${index + 1}`,
          value: Number.parseFloat(item?.progress) || 0,
        }))
        .filter((item) => item.value >= 0)
    : [];
  const distribution = Array.isArray(projectSource?.distribution)
    ? projectSource.distribution
    : [];
  const announcements =
    announcementsResult.status === "fulfilled"
      ? getDashboardList(announcementsResult.value, ["announcements"])
          .map(normalizeDashboardAnnouncement)
          .filter(Boolean)
      : [];
  const articles =
    knowledgeResult.status === "fulfilled"
      ? getDashboardList(knowledgeResult.value, ["articles"])
          .map(normalizeDashboardArticle)
          .filter(Boolean)
      : [];

  const failedSections = results.filter((result) => result.status === "rejected").length;

  if (
    failedSections === results.length ||
    (!reports.length && !milestones.length && !announcements.length && !articles.length)
  ) {
    throw new Error("Dashboard data unavailable");
  }

  const completedTasks = milestones.filter((item) => item.status === "completed").length;
  const pendingTasks = getDashboardPendingTasks(milestones, reports);
  const reviewedReports = reports.filter((item) => item.status === "Reviewed").length;
  const reportScores = reports.map((item) => item.score).filter((item) => item !== null);
  const avgScore =
    profile.score ??
    (reportScores.length
      ? Number(
          (reportScores.reduce((sum, value) => sum + value, 0) / reportScores.length).toFixed(1),
        )
      : null);
  const attendanceOrReviewRate =
    profile.attendance ??
    (reports.length ? Math.round((reviewedReports / reports.length) * 100) : 0);
  const attendanceLabel = profile.attendance !== null ? "Attendance" : "Review Rate";

  return {
    profile,
    partialData: failedSections > 0,
    heroDate: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    heroSummary: {
      pendingTasks: pendingTasks.length,
      unreadAnnouncements:
        announcements.filter((item) => item.pinned || item.priority === "high").length ||
        announcements.length,
    },
    heroChips: [
      {
        value: String(completedTasks),
        label: "Tasks Done",
      },
      {
        value: `${attendanceOrReviewRate}%`,
        label: attendanceLabel,
      },
      {
        value: avgScore !== null ? String(avgScore) : "N/A",
        label: "Score",
      },
    ],
    statCards: [
      {
        title: "Assigned Tasks",
        value: String(milestones.length || reports.length),
        trend: pendingTasks.length > 0 ? `${pendingTasks.length} pending` : undefined,
        color: "#ff6d34",
      },
      {
        title: "Completed",
        value: String(completedTasks || reviewedReports),
        trend: milestones.length > 0 ? `${completedTasks} finished` : `${reviewedReports} reviewed`,
        color: "#00bea3",
      },
      {
        title: attendanceLabel,
        value: `${attendanceOrReviewRate}%`,
        subtitle:
          profile.attendance !== null
            ? "Based on your profile"
            : `${reviewedReports}/${reports.length || 0} reviewed`,
        color: "#ff6d34",
      },
      {
        title: "Performance",
        value: avgScore !== null ? `${avgScore}/10` : "N/A",
        trend: reportScores.length > 0 ? `${reportScores.length} scored reports` : undefined,
        color: "#00bea3",
      },
    ],
    chartActivity:
      analytics.length > 0 ? analytics : buildDashboardDailyCounts(reports, 7).map((item) => ({
        label: item.label,
        value: item.count,
      })),
    skillDistribution: getDashboardSkillDistribution(distribution, profile.skills),
    recentActivity: buildUserRecentActivity({ reports, announcements, articles }),
    pendingTasks,
  };
};

const getDashboardRecentMonths = (count) => {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    date.setMonth(date.getMonth() - (count - index - 1));
    return date;
  });
};

const buildDashboardMonthlyCounts = (items, count) => {
  const months = getDashboardRecentMonths(count);

  return months.map((date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    return {
      label: date.toLocaleDateString("en-US", { month: "short" }),
      count: items.filter(
        (item) =>
          item.timestamp &&
          item.timestamp.getFullYear() === year &&
          item.timestamp.getMonth() === month,
      ).length,
    };
  });
};

const getDashboardRecentWeeks = (count) => {
  return Array.from({ length: count }, (_, index) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay() - 7 * (count - index - 1));
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return {
      label: `W${index + 1}`,
      start,
      end,
    };
  });
};

const buildDashboardWeeklyReportCounts = (reports, count) => {
  return getDashboardRecentWeeks(count).map((week) => ({
    week: week.label,
    submitted: reports.filter(
      (item) => item.timestamp && item.timestamp >= week.start && item.timestamp <= week.end,
    ).length,
    reviewed: reports.filter(
      (item) =>
        item.timestamp &&
        item.status === "Reviewed" &&
        item.timestamp >= week.start &&
        item.timestamp <= week.end,
    ).length,
  }));
};

const buildDashboardDepartmentDistribution = (interns) => {
  const counts = interns.reduce((accumulator, intern) => {
    const key = intern.department || "General";
    accumulator.set(key, (accumulator.get(key) || 0) + 1);
    return accumulator;
  }, new Map());

  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
};

const buildAdminTaskSummary = (interns, reports) => {
  return interns.map((intern) => ({
    name: intern.name,
    department: intern.department,
    score: intern.rating ?? 0,
    tasks: reports.filter((report) => report.actor === intern.name).length,
    status: intern.status,
  }));
};

const buildUserTaskProgress = (analytics, skillDistribution, reports) => {
  if (Array.isArray(analytics) && analytics.length > 0) {
    return analytics
      .slice(0, 5)
      .map((item) => ({
        task: item.label || item.name || "Task",
        completion: Math.max(0, Math.min(100, Number.parseFloat(item.value) || 0)),
      }));
  }

  if (Array.isArray(skillDistribution) && skillDistribution.length > 0) {
    return skillDistribution.slice(0, 5).map((item) => ({
      task: item.name,
      completion: Math.max(0, Math.min(100, Number.parseFloat(item.value) || 0)),
    }));
  }

  return reports.slice(0, 5).map((item, index) => ({
    task: item.title || `Task ${index + 1}`,
    completion: item.status === "Reviewed" ? 100 : 60,
  }));
};

const buildUserStrengths = (skillDistribution, profile, reports) => {
  const strengths = [];

  skillDistribution.slice(0, 3).forEach((item) => {
    strengths.push({
      label: item.name,
      score: Math.max(55, Math.min(100, Number.parseFloat(item.value) || 0)),
    });
  });

  if (profile.attendance !== null) {
    strengths.push({
      label: "Consistency",
      score: profile.attendance,
    });
  }

  const reviewedReports = reports.filter((item) => item.status === "Reviewed").length;
  if (reports.length > 0) {
    strengths.push({
      label: "Execution",
      score: Math.round((reviewedReports / reports.length) * 100),
    });
  }

  if (profile.score !== null) {
    strengths.push({
      label: "Performance",
      score: Math.round(Math.min(100, profile.score * 10)),
    });
  }

  return strengths.slice(0, 5);
};

// Analytics service aggregators.
// If backend adds `/admin/analytics` or `/users/analytics`,
// update only these two functions and keep page components unchanged.
export const getAdminAnalyticsData = async () => {
  const results = await Promise.allSettled([
    getInterns(),
    getAdminReports(),
    getAdminKnowledgeArticles(),
    getAnnouncements(),
  ]);

  const [internsResult, reportsResult, articlesResult, announcementsResult] = results;

  const interns =
    internsResult.status === "fulfilled"
      ? getDashboardList(internsResult.value).map(normalizeDashboardIntern).filter(Boolean)
      : [];
  const reports =
    reportsResult.status === "fulfilled"
      ? getDashboardList(reportsResult.value, ["reports"])
          .map(normalizeDashboardReport)
          .filter(Boolean)
      : [];
  const articles =
    articlesResult.status === "fulfilled"
      ? getDashboardList(articlesResult.value, ["articles"])
          .map(normalizeDashboardArticle)
          .filter(Boolean)
      : [];
  const announcements =
    announcementsResult.status === "fulfilled"
      ? getDashboardList(announcementsResult.value, ["announcements"])
          .map(normalizeDashboardAnnouncement)
          .filter(Boolean)
      : [];

  const failedSections = results.filter((result) => result.status === "rejected").length;

  if (failedSections === results.length || (!interns.length && !reports.length && !articles.length)) {
    throw new Error("Analytics data unavailable");
  }

  const scoredInterns = interns.map((item) => item.rating).filter((item) => item !== null);
  const reviewedReports = reports.filter((item) => item.status === "Reviewed").length;
  const answeredRate = reports.length ? Math.round((reviewedReports / reports.length) * 100) : 0;
  const avgPerformance = scoredInterns.length
    ? (scoredInterns.reduce((sum, value) => sum + value, 0) / scoredInterns.length).toFixed(1)
    : "0.0";

  return {
    partialData: failedSections > 0,
    statCards: [
      {
        title: "Total Reports",
        value: String(reports.length),
        trend: `${reviewedReports} reviewed`,
        color: "#2563EB",
      },
      {
        title: "Avg Performance",
        value: `${avgPerformance}/10`,
        trend: `${interns.length} interns tracked`,
        color: "#7C3AED",
      },
      {
        title: "KB Articles",
        value: String(articles.length),
        trend: `${articles.filter((item) => item.verified).length} verified`,
        color: "#059669",
      },
      {
        title: "Questions Answered",
        value: `${answeredRate}%`,
        trend: `${announcements.length} announcements`,
        color: "#D97706",
      },
    ],
    performanceData: interns.map((intern) => ({
      name: intern.name.split(" ")[0] || intern.name,
      score: intern.rating ?? 0,
    })),
    departmentData: buildDashboardDepartmentDistribution(interns),
    weeklyReports: buildDashboardWeeklyReportCounts(reports, 4),
    activityTrend: buildDashboardDailyCounts(
      [
        ...reports.map((item) => ({ timestamp: item.timestamp })),
        ...articles.map((item) => ({ timestamp: item.timestamp })),
        ...announcements.map((item) => ({ timestamp: item.timestamp })),
      ].filter((item) => item.timestamp),
      7,
    ).map((item) => ({
      day: item.label,
      activity: item.count,
    })),
    taskSummary: buildAdminTaskSummary(interns, reports),
  };
};

export const getUserAnalyticsData = async () => {
  const results = await Promise.allSettled([
    getCurrentUser(),
    getUserReports(),
    getReports(),
    getKnowledgeArticles(),
  ]);

  const [profileResult, reportsResult, projectResult, knowledgeResult] = results;

  const profile = normalizeDashboardProfile(
    profileResult.status === "fulfilled" ? profileResult.value : null,
  );
  const reports =
    reportsResult.status === "fulfilled"
      ? getDashboardList(reportsResult.value, ["reports"])
          .map(normalizeDashboardReport)
          .filter(Boolean)
      : [];
  const projectSource = projectResult.status === "fulfilled" ? projectResult.value ?? {} : {};
  const analytics = Array.isArray(projectSource?.analytics)
    ? projectSource.analytics
        .map((item, index) => ({
          label: item?.name || `Step ${index + 1}`,
          value: Number.parseFloat(item?.progress) || 0,
        }))
        .filter((item) => item.value >= 0)
    : [];
  const distribution = Array.isArray(projectSource?.distribution)
    ? projectSource.distribution
    : [];
  const articles =
    knowledgeResult.status === "fulfilled"
      ? getDashboardList(knowledgeResult.value, ["articles"])
          .map(normalizeDashboardArticle)
          .filter(Boolean)
      : [];

  const failedSections = results.filter((result) => result.status === "rejected").length;

  if (
    failedSections === results.length ||
    (!reports.length && !analytics.length && !distribution.length && !articles.length)
  ) {
    throw new Error("Analytics data unavailable");
  }

  const skillDistribution = getDashboardSkillDistribution(distribution, profile.skills);
  const taskProgress = buildUserTaskProgress(analytics, skillDistribution, reports);
  const completedReports = reports.filter((item) => item.status === "Reviewed").length;
  const performanceScore =
    profile.score !== null
      ? Math.round(Math.min(100, profile.score * 10))
      : reports.length
        ? Math.round((completedReports / reports.length) * 100)
        : 0;
  const currentMonthReports = buildDashboardMonthlyCounts(reports, 1)[0]?.count ?? 0;
  const monthlyTrend = buildDashboardMonthlyCounts(reports, 6).map((item, index) => {
    const relatedProgress = analytics[index]?.value ?? performanceScore / 2;
    return {
      month: item.label,
      activity: Number((item.count * 3 + relatedProgress / 10).toFixed(1)),
      tasks: item.count,
    };
  });
  const weeklyActivity = buildDashboardDailyCounts(
    [
      ...reports.map((item) => ({ timestamp: item.timestamp })),
      ...articles.map((item) => ({ timestamp: item.timestamp })),
    ].filter((item) => item.timestamp),
    7,
  ).map((item) => ({
    day: item.label,
    activity: item.count,
  }));
  const strengths = buildUserStrengths(skillDistribution, profile, reports);

  return {
    partialData: failedSections > 0,
    heroChips: [
      { value: `${performanceScore}%`, label: "Performance" },
      { value: String(currentMonthReports), label: "This Month" },
      { value: String(completedReports), label: "Tasks Done" },
      {
        value:
          profile.score !== null
            ? profile.score.toFixed(1)
            : reports.length
              ? ((reports.map((item) => item.score).filter((item) => item !== null).reduce((sum, value) => sum + value, 0) /
                  Math.max(1, reports.map((item) => item.score).filter((item) => item !== null).length))).toFixed(1)
              : "0.0",
        label: "Avg Rating",
      },
    ],
    statCards: [
      {
        title: "Tasks Completed",
        value: String(completedReports),
        trend: `${reports.length} reports total`,
        color: "#00bea3",
      },
      {
        title: "Learning Activity",
        value: `${Number((monthlyTrend.reduce((sum, item) => sum + item.activity, 0)).toFixed(1))}`,
        trend: `${currentMonthReports} this month`,
        color: "#ff6d34",
      },
      {
        title: "Performance",
        value: `${performanceScore}%`,
        trend: profile.score !== null ? `${profile.score.toFixed(1)}/10 score` : undefined,
        color: "#7c3aed",
      },
      {
        title: "Active Skills",
        value: String(skillDistribution.length || profile.skills.length),
        subtitle: "Tracked from profile",
        color: "#f59e0b",
      },
    ],
    monthlyTrend,
    performanceScore,
    skillDistribution,
    taskProgress,
    strengths,
    weeklyActivity,
  };
};
