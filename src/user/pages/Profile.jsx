import { useState, useEffect } from "react";
import {
  Edit,
  Save,
  User,
  Mail,
  Briefcase,
  GraduationCap,
  Link,
  Loader2,
} from "lucide-react";
import { Card, SectionHeader } from "../../shared/components/UI";
import { getCurrentUser, updateCurrentUser } from "../../services/apiClient";

const FIELDS = [
  { label: "Full Name", key: "name", type: "text", icon: User, placeHolder: "Your Name" },
  { label: "Email", key: "email", type: "email", icon: Mail, placeHolder: "Your Email" },
  { label: "Role", key: "role", type: "text", icon: Briefcase, placeHolder: "Your Role" },
  { label: "Department", key: "department", type: "text", icon: null, placeHolder: "Your Department Of Work" },
  { label: "College", key: "college", type: "text", icon: GraduationCap, placeHolder: "Your College Name" },
  { label: "Year of Study", key: "year", type: "text", icon: null, placeHolder: "Your Year Of Study" },
  { label: "Date of Birth", key: "dob", type: "date", icon: null },
  { label: "LinkedIn", key: "linkedin", type: "url", icon: Link, placeHolder: "Your LinkedIn ID" },
];

const defaultProfile = {
  name: "",
  email: "",
  role: "",
  department: "",
  college: "",
  dob: "",
  year: "",
  linkedin: "",
  skills: "",
};

const normalizeProfile = (payload) => ({
  ...defaultProfile,
  ...(payload && typeof payload === "object" ? payload : {}),
  department:
    payload?.department ??
    payload?.dept ??
    payload?.team ??
    defaultProfile.department,
  skills: Array.isArray(payload?.skills)
    ? payload.skills.join(", ")
    : payload?.skills ?? defaultProfile.skills,
});

const getInitials = (value) =>
  String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState(defaultProfile);

  const fetchProfile = async () => {
    setLoading(true);

    try {
      const data = await getCurrentUser();
      setProfile(normalizeProfile(data));
      setError("");
    } catch (loadError) {
      console.error("Failed to load profile:", loadError);
      setProfile(defaultProfile);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (event) => {
    setProfile((currentProfile) => ({
      ...currentProfile,
      [event.target.name]: event.target.value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await updateCurrentUser(profile);
      setProfile(normalizeProfile(response?.data ?? response));
      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (saveError) {
      console.error("Failed to save profile:", saveError);
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6 w-full min-w-0">
        <SectionHeader title="My Profile" subtitle="Manage your profile information" />
        <Card className="p-6">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Loading profile...
          </div>
        </Card>
      </div>
    );
  }

  if (error && !profile.name && !profile.email) {
    return (
      <div className="max-w-3xl space-y-6 w-full min-w-0">
        <SectionHeader title="My Profile" subtitle="Manage your profile information" />
        <Card className="p-5 space-y-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={fetchProfile}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6 w-full min-w-0">
      <SectionHeader title="My Profile" subtitle="Manage your profile information" />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <Card className="overflow-hidden">
        <div
          className="h-24 w-full"
          style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
        />

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-6">
            <div
              className="w-20 h-20 rounded-xl border-4 flex items-center justify-center text-2xl font-bold text-white shadow-lg flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                borderColor: "var(--card)",
              }}
            >
              {getInitials(profile.name)}
            </div>
            <div className="pb-1 flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 break-words">{profile.name || "Your Name"}</h2>
              <p className="text-sm text-slate-500">
                {profile.role || "Role"} · {profile.department || "Department"}
              </p>
            </div>
            <div className="pb-1 w-full sm:w-auto flex-shrink-0">
              <button
                type="button"
                onClick={editing ? handleSave : () => setEditing(true)}
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving...
                  </>
                ) : editing ? (
                  <>
                    <Save size={14} /> Save Changes
                  </>
                ) : (
                  <>
                    <Edit size={14} /> Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {FIELDS.map(({ label, key, type, icon: Icon, placeHolder }) => (
              <div key={key}>
                <label className="text-xs font-medium text-slate-500 mb-1 block">{label}</label>
                <div className="relative">
                  {Icon && (
                    <Icon
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  )}
                  <input
                    type={type}
                    name={key}
                    value={profile[key] ?? ""}
                    placeholder={placeHolder}
                    disabled={!editing || saving}
                    onChange={handleChange}
                    className={`w-full py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition disabled:opacity-60 ${
                      Icon ? "pl-8 pr-3" : "px-3"
                    }`}
                  />
                </div>
              </div>
            ))}

            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Skills</label>
              <textarea
                name="skills"
                value={profile.skills ?? ""}
                disabled={!editing || saving}
                onChange={handleChange}
                placeholder="Your Skills..."
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-none disabled:opacity-60"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
