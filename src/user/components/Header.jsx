import { useState, useEffect } from "react";
import { Bell, Search, Sun, Moon, Menu } from "lucide-react";

const Header = ({
  title,
  onMenuToggle,
  user,
  notifications = [],
  searchPlaceholder = "Search...",
  notificationTitle = "Notifications",
  markAllText = "Mark all read",
  themeColor = "#ff6d34",
  secondaryColor = "#00bea3",
}) => {
  const [showNotif, setShowNotif] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className="h-16 flex items-center px-3 sm:px-6 gap-2 sm:gap-4 flex-shrink-0 transition-colors duration-200"
      style={{
        background: "var(--card)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 rounded-lg transition-colors cursor-pointer -ml-2 mr-1"
        style={{ color: "var(--muted)" }}
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1
          className="text-base font-bold truncate"
          style={{ color: "var(--text)" }}
        >
          {title}
        </h1>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--muted)" }}
        />
        <input
          className="pl-9 pr-4 py-2 text-sm rounded-lg w-64 focus:outline-none transition-all duration-200"
          placeholder={searchPlaceholder}
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#ff6d34")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 relative">
        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-lg transition-colors cursor-pointer"
          style={{ color: "var(--muted)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = dark
              ? "rgba(255,255,255,0.06)"
              : "#f3f4f6")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => setShowNotif(!showNotif)}
          className="relative p-2 rounded-lg transition-colors cursor-pointer"
          style={{ color: "var(--muted)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = dark
              ? "rgba(255,255,255,0.06)"
              : "#f3f4f6")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <Bell size={18} />
          {notifications.length > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: themeColor }}
            />
          )}
        </button>

        {showNotif && (
          <div
            className="absolute right-0 top-12 w-[min(calc(100vw-1.5rem),20rem)] sm:w-80 max-h-[70vh] overflow-y-auto rounded-2xl shadow-xl z-50"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text)" }}
              >
                {notificationTitle}
              </p>
              <button
                className="text-xs cursor-pointer hover:underline"
                style={{ color: themeColor }}
              >
                {markAllText}
              </button>
            </div>

            {notifications.map((n, i) => (
              <div
                key={i}
                className="px-4 py-3 flex gap-3 cursor-pointer transition-colors"
                style={{ borderBottom: "1px solid var(--border)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = dark
                    ? "rgba(255,255,255,0.04)"
                    : "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{
                    background:
                      n.type === "primary" ? themeColor : secondaryColor,
                  }}
                />
                <div>
                  <p
                    className="text-xs leading-snug"
                    style={{ color: "var(--text)" }}
                  >
                    {n.text}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--muted)" }}
                  >
                    {n.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User */}
      <div
        className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3"
        style={{ borderLeft: "1px solid var(--border)" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md"
          style={{
            background: `linear-gradient(135deg, ${themeColor}, ${secondaryColor})`,
          }}
        >
          {user?.initials}
        </div>
        <div className="hidden md:block">
          <p
            className="text-xs font-semibold leading-none"
            style={{ color: "var(--text)" }}
          >
            {user?.name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {user?.role}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;