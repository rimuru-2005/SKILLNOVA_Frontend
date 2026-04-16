import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout = ({ page, onNavigate, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // ✅ Dynamic data
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // ✅ Page titles (kept structured like admin)
  const pageTitles = {
    dashboard: "Dashboard",
    knowledge: "Knowledge Base",
    qa: "Q&A Forum",
    reports: "My Reports",
    meetings: "AI Assistant",
    announcements: "Announcements",
    analytics: "Analytics",
    profile: "My Profile",
    settings: "Settings",
  };

  const title = pageTitles[page] ?? "Dashboard";

  // ✅ Fetch user + notifications (mock → replace with API)
  useEffect(() => {
    setUser({
      name: "Rahul Sharma",
      role: "AI/ML Intern",
      initials: "RS",
    });

    setNotifications([
      { text: "Report reviewed", time: "5m ago", type: "primary" },
      { text: "Meeting reminder", time: "1h ago", type: "secondary" },
    ]);
  }, []);

  // UI behavior
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
    <div className="flex h-screen overflow-hidden transition-colors duration-200" style={{ background: "var(--bg)" }}>

      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar active={page} onNavigate={onNavigate} />
      </div>

      {/* Mobile sidebar overlay */}
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
              forceMobileExpanded
            />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ✅ FIXED HEADER */}
        <Header
          title={title}
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          user={user || {}}
          notifications={notifications || []}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;