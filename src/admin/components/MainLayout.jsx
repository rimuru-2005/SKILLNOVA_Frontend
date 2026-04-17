import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { request } from "../../services/api";

const PLATFORM_SETTINGS_ENDPOINT = "/platform/settings";
const ANNOUNCEMENTS_ENDPOINT = "/announcements";

const getInitials = (value, fallback = "") => {
  if (!value || typeof value !== "string") return fallback;

  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return fallback;

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

const getPlatformInitials = (profile) => {
  const platformLabel =
    profile?.platformInitials ||
    profile?.platformName ||
    profile?.name ||
    profile?.company ||
    profile?.organization ||
    profile?.orgName ||
    profile?.siteName;

  return getInitials(platformLabel, "U");
};

const formatRelativeTime = (value) => {
  if (!value) return "New";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "New";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

const normalizeNotifications = (payload) => {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.announcements)
      ? payload.announcements
      : Array.isArray(payload?.items)
        ? payload.items
        : [];

  return items.slice(0, 6).map((item) => ({
    text:
      item?.title ||
      item?.message ||
      item?.text ||
      "New announcement",
    time: formatRelativeTime(
      item?.createdAt || item?.updatedAt || item?.date || item?.publishedAt
    ),
    type: item?.priority === "high" || item?.pinned ? "primary" : "secondary",
  }));
};

const MainLayout = ({ page, onNavigate, onLogout, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [platformInitials, setPlatformInitials] = useState("U");
  const [notifications, setNotifications] = useState([]);

  // ✅ Dynamic page titles (can later come from backend)
  const pageTitles = {
    "admin-dashboard": "Admin Overview",
    "admin-users": "User Management",
    "admin-management": "Intern Management",
    "admin-knowledge": "Knowledge Base",
    "admin-reports": "Reports",
    "admin-analytics": "Analytics",
    "admin-announcements": "Announcements",
    "admin-settings": "Admin Settings",
  };

  const title = pageTitles[page] ?? "Admin";

  // ✅ Fetch user + notifications
  useEffect(() => {
    const loadLayoutData = async () => {
      const [userResult, platformResult, announcementsResult] = await Promise.allSettled([
        // API CALL
        request("/users/me"),
        // Placeholder endpoint for platform/site metadata until backend adds it.
        // API CALL
        request(PLATFORM_SETTINGS_ENDPOINT),
        // API CALL
        request(ANNOUNCEMENTS_ENDPOINT),
      ]);

      if (userResult.status === "fulfilled") {
        const profile = userResult.value;
        setUser({
          ...profile,
          name: profile?.name || "Admin",
          role: profile?.role || "Administrator",
          initials: getInitials(profile?.name, "A"),
        });
      } else {
        console.error("Failed to load admin header data:", userResult.reason);
        setUser({
          name: "Admin",
          role: "Administrator",
          initials: "A",
        });
      }

      if (platformResult.status === "fulfilled") {
        setPlatformInitials(getPlatformInitials(platformResult.value));
      } else {
        console.warn(
          `Failed to load platform metadata from ${PLATFORM_SETTINGS_ENDPOINT}:`,
          platformResult.reason
        );
        setPlatformInitials("U");
      }

      if (announcementsResult.status === "fulfilled") {
        setNotifications(normalizeNotifications(announcementsResult.value));
      } else {
        console.warn(
          `Failed to load notifications from ${ANNOUNCEMENTS_ENDPOINT}:`,
          announcementsResult.reason
        );
        setNotifications([]);
      }
    };

    loadLayoutData();
  }, []);

  // UI behavior (unchanged)
  useEffect(() => {
    setMobileOpen(false);
  }, [page]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      className="flex h-screen overflow-hidden transition-colors duration-200"
      style={{ background: "var(--bg)" }}
    >
      <div className="hidden md:block">
        <Sidebar
          active={page}
          onNavigate={onNavigate}
          onLogout={onLogout}
          platformInitials={platformInitials}
        />
      </div>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <Sidebar
              active={page}
              onNavigate={onNavigate}
              onLogout={onLogout}
              forceMobileExpanded
              platformInitials={platformInitials}
            />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ✅ FIXED HEADER CALL */}
        <Header
          title={title}
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          user={user || {}}
          notifications={notifications || []}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
