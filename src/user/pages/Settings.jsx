// ══════════════════════════════════════════════
//  USER — pages/Settings.jsx
// ══════════════════════════════════════════════

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Power, Trash2 } from "lucide-react";
import { Card, Toggle, SectionHeader } from "../../shared/components/UI";
import {
  deactivateCurrentUser,
  deleteCurrentUser,
  getUserSettings,
  updateUserSettings,
} from "../../services/apiClient";

const applyDarkMode = (enabled) => {
  document.documentElement.classList.toggle("dark", enabled);
  localStorage.setItem("theme", enabled ? "dark" : "light");
};

const normalizeUserSettings = (payload) => {
  const source = payload?.data ?? payload;

  if (!source || typeof source !== "object") {
    return null;
  }

  const language = source.language ?? "";
  const availableLanguages = Array.isArray(source.availableLanguages)
    ? source.availableLanguages.filter(Boolean)
    : [];

  return {
    notifications: Boolean(source.notifications),
    privateAccount: Boolean(source.privateAccount),
    twoFactor: Boolean(source.twoFactor),
    darkMode: Boolean(source.darkMode),
    language,
    availableLanguages:
      availableLanguages.length > 0
        ? availableLanguages
        : language
          ? [language]
          : [],
  };
};

const Settings = ({ onLogout }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [actionError, setActionError] = useState("");
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [deleteText, setDeleteText] = useState("");
  const [deleteReason, setDeleteReason] = useState("");

  const loadSettings = async () => {
    setLoading(true);

    try {
      setSaveError("");
      setActionError("");
      // API CALL
      const response = await getUserSettings();
      const normalized = normalizeUserSettings(response);

      if (!normalized) {
        throw new Error("Invalid user settings payload");
      }

      setSettings(normalized);
      applyDarkMode(normalized.darkMode);
    } catch (loadError) {
      console.error("Error loading user settings:", loadError);
      setSettings(null);
      setActionError("Failed to load your settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const persistSetting = async (key, value, rollbackValue) => {
    try {
      setSaveError("");
      // API CALL
      await updateUserSettings({ [key]: value });
    } catch (saveSettingError) {
      console.error(`Error saving setting "${key}":`, saveSettingError);

      setSettings((currentSettings) =>
        currentSettings
          ? { ...currentSettings, [key]: rollbackValue }
          : currentSettings,
      );

      if (key === "darkMode") {
        applyDarkMode(rollbackValue);
      }

      setSaveError("Could not save that change. Please try again.");
    }
  };

  const updateSetting = (key, value) => {
    if (!settings) return;

    const previousValue = settings[key];

    setSettings((currentSettings) => ({
      ...currentSettings,
      [key]: value,
    }));

    if (key === "darkMode") {
      applyDarkMode(value);
    }

    persistSetting(key, value, previousValue);
  };

  const handleDeactivate = async () => {
    try {
      setActionLoading("deactivate");
      setActionError("");

      // API CALL
      await deactivateCurrentUser();

      localStorage.removeItem("token");
      if (typeof onLogout === "function") {
        onLogout();
      }
    } catch (deactivateError) {
      console.error("Error deactivating account:", deactivateError);
      setActionError("Could not deactivate your account.");
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading("delete");
      setActionError("");

      // API CALL
      await deleteCurrentUser({
        reason: deleteReason.trim() || undefined,
      });

      localStorage.removeItem("token");
      if (typeof onLogout === "function") {
        onLogout();
      }
    } catch (deleteError) {
      console.error("Error deleting account:", deleteError);
      setActionError("Could not delete your account.");
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl space-y-4 px-4 sm:px-0">
        <SectionHeader
          title="Settings"
          subtitle="Manage your account and preferences"
        />
        <Card className="p-5">
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--muted)" }}
          >
            <Loader2 size={15} className="animate-spin" />
            Loading settings...
          </div>
        </Card>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="w-full max-w-2xl space-y-4 px-4 sm:px-0">
        <SectionHeader
          title="Settings"
          subtitle="Manage your account and preferences"
        />
        <Card className="p-5 space-y-4">
          <p className="text-sm text-red-600">
            {actionError || "Unable to load your settings."}
          </p>
          <button
            type="button"
            onClick={loadSettings}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  const sections = [
    {
      title: "Appearance",
      rows: [
        {
          label: "Dark Mode",
          sub: "Switch to a darker interface",
          ctrl: (
            <Toggle
              checked={settings.darkMode}
              onChange={() => updateSetting("darkMode", !settings.darkMode)}
            />
          ),
        },
      ],
    },
    {
      title: "Security",
      rows: [
        {
          label: "Two-Factor Authentication",
          sub: "Require an extra layer of security when logging in",
          ctrl: (
            <Toggle
              checked={settings.twoFactor}
              onChange={() => updateSetting("twoFactor", !settings.twoFactor)}
            />
          ),
        },
      ],
    },
    {
      title: "Notifications",
      rows: [
        {
          label: "Email Notifications",
          sub: "Receive updates and alerts via email",
          ctrl: (
            <Toggle
              checked={settings.notifications}
              onChange={() =>
                updateSetting("notifications", !settings.notifications)
              }
            />
          ),
        },
      ],
    },
    {
      title: "Privacy",
      rows: [
        {
          label: "Private Account",
          sub: "Only admins can view your full profile",
          ctrl: (
            <Toggle
              checked={settings.privateAccount}
              onChange={() =>
                updateSetting("privateAccount", !settings.privateAccount)
              }
            />
          ),
        },
      ],
    },
    {
      title: "Language",
      rows: [
        {
          label: "Display Language",
          sub: "Choose your preferred interface language",
          fullWidth: true,
          ctrl: (
            <select
              value={settings.language}
              onChange={(e) => updateSetting("language", e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg cursor-pointer focus:outline-none w-full sm:w-auto"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            >
              {settings.availableLanguages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          ),
        },
      ],
    },
  ];

  return (
    <div className="w-full max-w-2xl space-y-4 px-4 sm:px-0">
      <SectionHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      {saveError && (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.25)",
            color: "#b45309",
          }}
        >
          {saveError}
        </div>
      )}

      {actionError && (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(220,38,38,0.08)",
            border: "1px solid rgba(220,38,38,0.2)",
            color: "#dc2626",
          }}
        >
          {actionError}
        </div>
      )}

      {sections.map((section) => (
        <Card key={section.title} className="p-4 sm:p-5">
          <h3
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--text)" }}
          >
            {section.title}
          </h3>
          <div className="space-y-4">
            {section.rows.map((row) => (
              <div
                key={row.label}
                className={`flex gap-3 ${
                  row.fullWidth
                    ? "flex-col sm:flex-row sm:items-center sm:justify-between"
                    : "flex-row items-center justify-between"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    {row.label}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--muted)" }}
                  >
                    {row.sub}
                  </p>
                </div>
                <div className={row.fullWidth ? "w-full sm:w-auto" : "flex-shrink-0"}>
                  {row.ctrl}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Card className="p-4 sm:p-5" style={{ borderColor: "rgba(220,38,38,0.2)" }}>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} style={{ color: "#f59e0b" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            Account Status
          </h3>
        </div>

        <div className="space-y-3">
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Power
                size={18}
                className="mt-0.5 flex-shrink-0"
                style={{ color: "#f59e0b" }}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  Deactivate Account
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  Temporarily disable your account. You can reactivate it later.
                </p>
              </div>
            </div>

            {!confirmDeactivate ? (
              <button
                type="button"
                onClick={() => setConfirmDeactivate(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition w-full sm:w-auto flex-shrink-0"
                style={{
                  background: "rgba(245,158,11,0.15)",
                  color: "#f59e0b",
                  border: "1px solid rgba(245,158,11,0.3)",
                }}
              >
                Deactivate
              </button>
            ) : (
              <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={actionLoading === "deactivate"}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition"
                  style={{ background: "#f59e0b" }}
                >
                  {actionLoading === "deactivate" ? "Working..." : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeactivate(false)}
                  disabled={actionLoading === "deactivate"}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm font-medium transition"
                  style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl"
            style={{
              background: "rgba(220,38,38,0.06)",
              border: "1px solid rgba(220,38,38,0.15)",
            }}
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Trash2
                size={18}
                className="mt-0.5 flex-shrink-0"
                style={{ color: "#dc2626" }}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  Delete Account
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  Permanently delete your account and all associated data.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(true);
                setConfirmDeactivate(false);
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition w-full sm:w-auto flex-shrink-0"
              style={{ background: "#dc2626" }}
            >
              Delete
            </button>
          </div>
        </div>
      </Card>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div
            className="w-full max-w-md rounded-xl p-6 space-y-4 shadow-xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <h2 className="text-lg font-semibold text-red-500">Delete Account</h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              This action is permanent. Type `DELETE` to confirm.
            </p>

            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Reason for leaving (optional)"
              rows={3}
              className="w-full border p-2 rounded-lg text-sm resize-none"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />

            <input
              type="text"
              placeholder="Type DELETE to confirm"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              className="w-full border p-2 rounded-lg text-sm"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteText("");
                  setDeleteReason("");
                }}
                disabled={actionLoading === "delete"}
                className="px-4 py-2 rounded text-sm"
                style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteText !== "DELETE" || actionLoading === "delete"}
                className="px-4 py-2 rounded text-sm text-white disabled:opacity-50"
                style={{ background: "#dc2626" }}
              >
                {actionLoading === "delete" ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
