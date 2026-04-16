// ══════════════════════════════════════════════
//  USER — pages/Profile.jsx
// ══════════════════════════════════════════════

import { useState } from "react";
import { Edit, Save, User, Mail, Briefcase, GraduationCap, Link } from "lucide-react";
import { Card, SectionHeader } from "../../shared/components/UI";

const FIELDS = [
  { label: "Full Name",     key: "name",       type: "text",  icon: User          },
  { label: "Email",         key: "email",      type: "email", icon: Mail          },
  { label: "Role",          key: "role",       type: "text",  icon: Briefcase     },
  { label: "Department",    key: "department", type: "text",  icon: null          },
  { label: "College",       key: "college",    type: "text",  icon: GraduationCap },
  { label: "Year of Study", key: "year",       type: "text",  icon: null          },
  { label: "Date of Birth", key: "dob",        type: "date",  icon: null          },
  { label: "LinkedIn",      key: "linkedin",   type: "url",   icon: Link          },
];

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name:       "Rahul Sharma",
    email:      "rahul@skillnova.com",
    role:       "AI/ML Intern",
    department: "Artificial Intelligence",
    college:    "ABC Engineering College",
    dob:        "2003-05-12",
    year:       "Final Year",
    linkedin:   "https://linkedin.com/in/rahul",
    skills:     "Python, Machine Learning, Data Analysis",
  });

  const handleChange = e => setProfile({ ...profile, [e.target.name]: e.target.value });

  return (
    <div className="max-w-3xl space-y-6 w-full min-w-0">
      <SectionHeader title="My Profile" subtitle="Manage your profile information" />

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
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", borderColor: "var(--card)" }}
            >
              RS
            </div>
            <div className="pb-1 flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 break-words">{profile.name}</h2>
              <p className="text-sm text-slate-500">{profile.role} · {profile.department}</p>
            </div>
            <div className="pb-1 w-full sm:w-auto flex-shrink-0">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition"
                >
                  <Edit size={14} /> Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => setEditing(false)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition"
                >
                  <Save size={14} /> Save Changes
                </button>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            {FIELDS.map(({ label, key, type, icon: Icon }) => (
              <div key={key}>
                <label className="text-xs font-medium text-slate-500 mb-1 block">{label}</label>
                <div className="relative">
                  {Icon && (
                    <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  )}
                  <input
                    type={type}
                    name={key}
                    value={profile[key]}
                    disabled={!editing}
                    onChange={handleChange}
                    className={`w-full py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition disabled:opacity-60 ${Icon ? "pl-8 pr-3" : "px-3"}`}
                  />
                </div>
              </div>
            ))}

            {/* Skills – full width */}
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Skills</label>
              <textarea
                name="skills"
                value={profile.skills}
                disabled={!editing}
                onChange={handleChange}
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