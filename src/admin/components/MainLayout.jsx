import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout = ({ page, onNavigate, onLogout, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
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

  // ✅ Fetch user + notifications (replace with real API later)
  useEffect(() => {
    // TEMP MOCK (replace with API)
    setUser({
      name: "TEST USER 🔥",
      role: "Hacker",
      initials: "TU",
    });

    setNotifications([
      { text: "New report submitted", time: "5m ago", type: "primary" },
      { text: "System update scheduled", time: "2h ago", type: "secondary" },
    ]);
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
        <Sidebar active={page} onNavigate={onNavigate} onLogout={onLogout} />
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