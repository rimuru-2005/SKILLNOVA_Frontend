import { useState, useEffect } from "react"; // Add useEffect
import { Edit, Save, User, Mail, Briefcase, GraduationCap, Link } from "lucide-react";
import { Card, SectionHeader } from "../../shared/components/UI";
import { request } from "../../services/api";

const FIELDS = [
  { label: "Full Name",     key: "name",       type: "text",  icon: User          , placeHolder: "Your Name"},
  { label: "Email",         key: "email",      type: "email", icon: Mail          , placeHolder: "Your Email"},
  { label: "Role",          key: "role",       type: "text",  icon: Briefcase     , placeHolder: "Your Role"},
  { label: "Department",    key: "department", type: "text",  icon: null          , placeHolder: "Your Department Of Work"},
  { label: "College",       key: "college",    type: "text",  icon: GraduationCap , placeHolder: "Your College Name"},
  { label: "Year of Study", key: "year",       type: "text",  icon: null          , placeHolder: "Your Year Of Study"},
  { label: "Date of Birth", key: "dob",        type: "date",  icon: null          , },
  { label: "LinkedIn",      key: "linkedin",   type: "url",   icon: Link          , placeHolder: "Your LinkedIn ID"},
];

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state [cite: 117]
  
  // Initialize with empty strings instead of hardcoded data
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

  const [profile, setProfile] = useState(defaultProfile);

  // Fetch real data when the page loads [cite: 115]
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await request("/users/me");
        setProfile(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load profile:", error);
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = e => setProfile({ ...profile, [e.target.name]: e.target.value });

  // Handle Save (Integration)
  const handleSave = async () => {
    try {
      await request("/users/me", {
        method: "PUT", // Or POST depending on your backend
        body: JSON.stringify(profile),
      });
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Update failed: " + error.message);
      setProfile(defaultProfile);
    } finally {
      setEditing(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Profile...</div>;

  return (
    <div className="max-w-3xl space-y-6 w-full min-w-0">
      <SectionHeader
        title="My Profile"
        subtitle="Manage your profile information"
      />

      <Card className="overflow-hidden">
        {/* Cover */}
        <div
          className="h-24 w-full"
          style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
        />

        <div className="px-6 pb-6">
          {/* Avatar + name */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-6">
            <div
              className="w-20 h-20 rounded-xl border-4 flex items-center justify-center text-2xl font-bold text-white shadow-lg flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                borderColor: "var(--card)",
              }}
            >
              RS
            </div>
            <div className="pb-1 flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 break-words">
                {profile.name}
              </h2>
              <p className="text-sm text-slate-500">
                {profile.role} · {profile.department}
              </p>
            </div>
            <div className="pb-1 w-full sm:w-auto flex-shrink-0">
              {/* customize the button to your likeing  */}
              <button
                onClick={editing ? handleSave : () => setEditing(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition"
              >
                {editing ? (
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

          {/* Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            {FIELDS.map(({ label, key, type, icon: Icon, placeHolder }) => (
              <div key={key}>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  {label}
                </label>
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
                    value={profile[key]}
                    placeholder={placeHolder}
                    disabled={!editing}
                    onChange={handleChange}
                    className={`w-full py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition disabled:opacity-60 ${Icon ? "pl-8 pr-3" : "px-3"}`}
                  />
                </div>
              </div>
            ))}

            {/* Skills – full width */}
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Skills
              </label>
              <textarea
                name="skills"
                value={profile.skills}
                disabled={!editing}
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