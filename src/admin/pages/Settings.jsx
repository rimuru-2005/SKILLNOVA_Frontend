// ══════════════════════════════════════════════
//  ADMIN — pages/Settings.jsx
// ══════════════════════════════════════════════

import { useEffect, useState } from "react";
import {
  Shield,
  AlertTriangle,
  Loader2,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { Card, Toggle, SectionHeader } from "../../shared/components/UI";
import {
  clearStoredAuthSession,
  deleteAdminPlatform,
  getAdminSettings,
  resetAdminUserData,
  updateAdminSettings,
} from "../../services/apiClient";

const normalizeAdminSettings = (payload) => {
  const source = payload?.data ?? payload;

  if (!source || typeof source !== "object") {
    return null;
  }

  return {
    smtp: Boolean(source.smtp),
    maintenance: Boolean(source.maintenance),
    registration: Boolean(source.registration),
    aiAssistant: Boolean(source.aiAssistant),
    auditLog: Boolean(source.auditLog),
    twoFactor: Boolean(source.twoFactor),
    maxInterns:
      source.maxInterns === null || source.maxInterns === undefined
        ? ""
        : String(source.maxInterns),
    platformName: source.platformName ?? source.name ?? "",
  };
};

const Settings = ({ onLogout }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dangerAction, setDangerAction] = useState("");

  const loadSettings = async () => {
    setLoading(true);

    try {
      setError("");
      // API CALL
      const response = await getAdminSettings();
      const normalized = normalizeAdminSettings(response);

      if (!normalized) {
        throw new Error("Invalid settings payload");
      }

      setSettings(normalized);
    } catch (loadError) {
      console.error("Error loading admin settings:", loadError);
      setSettings(null);
      setError("Failed to load admin settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateField = (key, value) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [key]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!settings) return;

    const platformName = settings.platformName.trim();
    const maxInterns = Number.parseInt(settings.maxInterns, 10);

    if (!platformName) {
      setError("Platform name is required.");
      return;
    }

    if (!Number.isInteger(maxInterns) || maxInterns < 1) {
      setError("Max interns must be a whole number greater than 0.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // API CALL
      await updateAdminSettings({
        ...settings,
        platformName,
        maxInterns,
      });

      setSettings((currentSettings) => ({
        ...currentSettings,
        platformName,
        maxInterns: String(maxInterns),
      }));
      setSuccess("Settings saved successfully.");
    } catch (saveError) {
      console.error("Error saving admin settings:", saveError);
      setError("Failed to save admin settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setDangerAction("reset");
      setError("");
      setSuccess("");

      // API CALL
      await resetAdminUserData();

      setConfirmReset(false);
      setSuccess("All user data has been reset.");
    } catch (resetError) {
      console.error("Error resetting user data:", resetError);
      setError("Failed to reset all user data.");
    } finally {
      setDangerAction("");
    }
  };

  const handleDeletePlatform = async () => {
    try {
      setDangerAction("delete");
      setError("");
      setSuccess("");

      // API CALL
      await deleteAdminPlatform();

      clearStoredAuthSession();
      setConfirmDelete(false);
      if (typeof onLogout === "function") {
        onLogout();
      }
    } catch (deleteError) {
      console.error("Error deleting platform:", deleteError);
      setError("Failed to delete the platform.");
      setDangerAction("");
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        <SectionHeader
          title="Admin Settings"
          subtitle="Configure platform-wide settings and permissions"
        />
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={15} className="animate-spin" />
            Loading settings...
          </div>
        </Card>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="max-w-2xl space-y-4">
        <SectionHeader
          title="Admin Settings"
          subtitle="Configure platform-wide settings and permissions"
        />
        <Card className="p-5 space-y-4">
          <p className="text-sm text-red-600">
            {error || "Unable to load admin settings."}
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
      title: "Platform",
      icon: Shield,
      rows: [
        {
          label: "Platform Name",
          sub: "The name shown in header and emails",
          ctrl: (
            <input
              value={settings.platformName}
              onChange={(e) => updateField("platformName", e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none w-40"
            />
          ),
        },
        {
          label: "Max Interns",
          sub: "Maximum number of intern accounts",
          ctrl: (
            <input
              type="number"
              min="1"
              value={settings.maxInterns}
              onChange={(e) => updateField("maxInterns", e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none w-24"
            />
          ),
        },
        {
          label: "Open Registration",
          sub: "Allow new interns to self-register",
          ctrl: (
            <Toggle
              checked={settings.registration}
              onChange={() => updateField("registration", !settings.registration)}
            />
          ),
        },
        {
          label: "Maintenance Mode",
          sub: "Take the platform offline for maintenance",
          ctrl: (
            <Toggle
              checked={settings.maintenance}
              onChange={() => updateField("maintenance", !settings.maintenance)}
            />
          ),
        },
      ],
    },
    {
      title: "Email & Notifications",
      icon: null,
      rows: [
        {
          label: "SMTP Notifications",
          sub: "Send automated email alerts to interns",
          ctrl: (
            <Toggle
              checked={settings.smtp}
              onChange={() => updateField("smtp", !settings.smtp)}
            />
          ),
        },
      ],
    },
    {
      title: "Security",
      icon: null,
      rows: [
        {
          label: "Two-Factor Auth",
          sub: "Require 2FA for all admin accounts",
          ctrl: (
            <Toggle
              checked={settings.twoFactor}
              onChange={() => updateField("twoFactor", !settings.twoFactor)}
            />
          ),
        },
        {
          label: "Audit Logging",
          sub: "Log all admin actions for compliance",
          ctrl: (
            <Toggle
              checked={settings.auditLog}
              onChange={() => updateField("auditLog", !settings.auditLog)}
            />
          ),
        },
      ],
    },
    {
      title: "Features",
      icon: null,
      rows: [
        {
          label: "AI Assistant",
          sub: "Enable the AI knowledge assistant for interns",
          ctrl: (
            <Toggle
              checked={settings.aiAssistant}
              onChange={() => updateField("aiAssistant", !settings.aiAssistant)}
            />
          ),
        },
      ],
    },
  ];

  return (
    <div className="max-w-2xl space-y-4">
      <SectionHeader
        title="Admin Settings"
        subtitle="Configure platform-wide settings and permissions"
      />

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="px-4 py-3 rounded-xl text-sm bg-green-50 border border-green-200 text-green-700">
          {success}
        </div>
      )}

      {sections.map((section) => (
        <Card key={section.title} className="p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            {section.icon && (
              <section.icon size={14} className="text-violet-500" />
            )}
            {section.title}
          </h3>
          <div className="space-y-4">
            {section.rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">
                    {row.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{row.sub}</p>
                </div>
                {row.ctrl}
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white rounded-xl text-sm font-medium transition"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <Card className="p-5 border-red-200 bg-red-50">
        <h3 className="text-sm font-semibold text-red-600 mb-1 flex items-center gap-2">
          <AlertTriangle size={14} /> Danger Zone
        </h3>
        <p className="text-xs text-red-400 mb-4">
          These actions are irreversible. Proceed with extreme caution.
        </p>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-white border border-red-100">
            <div className="flex items-start gap-2 flex-1">
              <RotateCcw
                size={15}
                className="mt-0.5 text-red-500 flex-shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Reset All User Data
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Wipes all intern records and submissions.
                </p>
              </div>
            </div>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition border border-red-200 w-full sm:w-auto"
              >
                Reset Data
              </button>
            ) : (
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={dangerAction === "reset"}
                  className="flex-1 sm:flex-none px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition"
                >
                  {dangerAction === "reset" ? "Resetting..." : "Yes, Reset"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  disabled={dangerAction === "reset"}
                  className="flex-1 sm:flex-none px-3 py-2 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition border border-slate-200"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-white border border-red-100">
            <div className="flex items-start gap-2 flex-1">
              <Trash2
                size={15}
                className="mt-0.5 text-red-600 flex-shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Delete Platform
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Permanently deletes the platform and all associated data.
                </p>
              </div>
            </div>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition w-full sm:w-auto"
              >
                Delete Platform
              </button>
            ) : (
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleDeletePlatform}
                  disabled={dangerAction === "delete"}
                  className="flex-1 sm:flex-none px-3 py-2 bg-red-700 text-white rounded-lg text-sm font-medium hover:bg-red-800 disabled:opacity-50 transition"
                >
                  {dangerAction === "delete" ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={dangerAction === "delete"}
                  className="flex-1 sm:flex-none px-3 py-2 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition border border-slate-200"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
