// ══════════════════════════════════════════════
//  ADMIN — pages/AdminPanel.jsx  (User Management)
// ══════════════════════════════════════════════

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
  X,
  Loader2,
} from "lucide-react";
import { Card, Badge, Avatar, SectionHeader } from "../../shared/components/UI";
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  terminateAdminUser,
  updateAdminUser,
} from "../../services/apiClient";

const ROLE_VARIANT = { Admin: "purple", Intern: "default" };
const STATUS_VARIANT = { Active: "success", Inactive: "gray" };
const ROLE_OPTIONS = ["Intern", "Admin"];
const STATUS_OPTIONS = ["Active", "Inactive"];
const DEFAULT_FORM = {
  name: "",
  email: "",
  dept: "",
  role: "Intern",
  status: "Active",
  rating: "",
};

const getInitials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "NU";

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

const normalizeRole = (value) =>
  String(value || "").trim().toLowerCase() === "admin" ? "Admin" : "Intern";

const normalizeStatus = (value) =>
  ["inactive", "terminated", "disabled"].includes(
    String(value || "").trim().toLowerCase(),
  )
    ? "Inactive"
    : "Active";

const getUserList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const isUserLike = (item) =>
  Boolean(
    item &&
      typeof item === "object" &&
      (item.id ||
        item._id ||
        item.name ||
        item.fullName ||
        item.username ||
        item.email),
  );

const getSingleUser = (payload) => {
  const candidates = [payload?.data, payload?.user, payload?.item, payload];
  return candidates.find(isUserLike) || null;
};

const normalizeUser = (item) => {
  if (!item || typeof item !== "object") return null;

  const name =
    item.name ||
    item.fullName ||
    item.username ||
    item.email ||
    String(item.id ?? item._id ?? "User");

  const parsedRating = Number.parseFloat(item.rating ?? item.score);

  return {
    ...item,
    id: item.id ?? item._id ?? item.email ?? name,
    name,
    email: item.email || "",
    role: normalizeRole(item.role),
    dept: item.dept || item.department || item.team || "",
    status: normalizeStatus(item.status),
    avatar: item.avatar || item.initials || getInitials(name),
    rating: Number.isNaN(parsedRating) ? null : Number(parsedRating.toFixed(1)),
  };
};

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [formError, setFormError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeAction, setActiveAction] = useState({ id: null, type: "" });

  const filtered = users.filter((user) => {
    const query = search.toLowerCase();

    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setFormError("");
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const loadUsers = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      setError("");
      //API CALL
      const response = await getAdminUsers();
      setUsers(getUserList(response).map(normalizeUser).filter(Boolean));
    } catch (loadError) {
      console.error("Error fetching users:", loadError);
      setUsers([]);
      setError("Failed to load users.");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async () => {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const dept = form.dept.trim();
    const rating = form.rating.trim() ? Number.parseFloat(form.rating) : null;

    if (!name || !email || !dept) {
      setFormError("Name, email and department are required.");
      return;
    }

    if (!isValidEmail(email)) {
      setFormError("Enter a valid email address.");
      return;
    }

    if (users.some((user) => user.email.toLowerCase() === email)) {
      setFormError("A user with this email already exists.");
      return;
    }

    if (rating !== null && (Number.isNaN(rating) || rating < 0 || rating > 10)) {
      setFormError("Rating must be a number between 0 and 10.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      setError("");

      const payload = {
        name,
        email,
        dept,
        role: normalizeRole(form.role),
        status: normalizeStatus(form.status),
        avatar: getInitials(name),
        rating,
      };

      // MAKE API CALL
      const response = await createAdminUser(payload);
      const createdUser = normalizeUser(getSingleUser(response));

      if (createdUser) {
        setUsers((currentUsers) => [createdUser, ...currentUsers]);
      } else {
        await loadUsers(false);
      }

      closeForm();
    } catch (createError) {
      console.error("Error creating user:", createError);
      setFormError("Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRole = async (id) => {
    const user = users.find((item) => item.id === id);
    if (!user) return;

    const nextRole = user.role === "Admin" ? "Intern" : "Admin";

    try {
      setActiveAction({ id, type: "role" });
      setError("");

      // MAKE API CALL
      const response = await updateAdminUser(id, { role: nextRole });
      const updatedUser = normalizeUser(getSingleUser(response));

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === id
            ? updatedUser || { ...item, role: nextRole }
            : item,
        ),
      );
    } catch (updateError) {
      console.error("Error updating role:", updateError);
      setError("Failed to update user role.");
    } finally {
      setActiveAction({ id: null, type: "" });
    }
  };

  const toggleStatus = async (id) => {
    const user = users.find((item) => item.id === id);
    if (!user) return;

    const nextStatus = user.status === "Active" ? "Inactive" : "Active";

    try {
      setActiveAction({ id, type: "status" });
      setError("");

      // MAKE API CALL
      const response = await updateAdminUser(id, { status: nextStatus });
      const updatedUser = normalizeUser(getSingleUser(response));

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === id
            ? updatedUser || { ...item, status: nextStatus }
            : item,
        ),
      );
    } catch (updateError) {
      console.error("Error updating status:", updateError);
      setError("Failed to update user status.");
    } finally {
      setActiveAction({ id: null, type: "" });
    }
  };

  const deleteUser = async (id) => {
    try {
      setActiveAction({ id, type: "delete" });
      setError("");

      // MAKE API CALL
      await deleteAdminUser(id);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));
    } catch (deleteError) {
      console.error("Error deleting user:", deleteError);
      setError("Failed to delete user.");
    } finally {
      setActiveAction({ id: null, type: "" });
    }
  };

  const terminateUser = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to terminate this user? This will permanently revoke their access.",
      )
    ) {
      return;
    }

    try {
      setActiveAction({ id, type: "terminate" });
      setError("");

      // MAKE API CALL
      await terminateAdminUser(id);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));
    } catch (terminateError) {
      console.error("Error terminating user:", terminateError);
      setError("Failed to terminate user.");
    } finally {
      setActiveAction({ id: null, type: "" });
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="User Management"
        subtitle="Manage intern roles, status and platform access"
        action={
          <button
            type="button"
            disabled={loading || submitting}
            className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "#ff6d34" }}
            onClick={() => (showForm ? closeForm() : setShowForm(true))}
            onMouseEnter={(e) => {
              if (!loading && !submitting) {
                e.currentTarget.style.background = "#e85d25";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ff6d34";
            }}
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? "Close Form" : "Add User"}
          </button>
        }
      />

      {showForm && (
        <Card className="p-5 border-orange-200 bg-orange-50/40">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Add New User
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Create an intern or admin account entry from the backend API.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={submitting}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <input
                value={form.name}
                onChange={(e) => {
                  setForm((currentForm) => ({
                    ...currentForm,
                    name: e.target.value,
                  }));
                  setFormError("");
                }}
                disabled={submitting}
                placeholder="Full name"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
              />
              <input
                value={form.email}
                onChange={(e) => {
                  setForm((currentForm) => ({
                    ...currentForm,
                    email: e.target.value,
                  }));
                  setFormError("");
                }}
                disabled={submitting}
                placeholder="Email address"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
              />
              <input
                value={form.dept}
                onChange={(e) => {
                  setForm((currentForm) => ({
                    ...currentForm,
                    dept: e.target.value,
                  }));
                  setFormError("");
                }}
                disabled={submitting}
                placeholder="Department"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
              />
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    role: e.target.value,
                  }))
                }
                disabled={submitting}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    status: e.target.value,
                  }))
                }
                disabled={submitting}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <input
                value={form.rating}
                onChange={(e) => {
                  setForm((currentForm) => ({
                    ...currentForm,
                    rating: e.target.value,
                  }));
                  setFormError("");
                }}
                disabled={submitting}
                placeholder="Rating"
                inputMode="decimal"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {formError && (
                <p className="text-sm text-red-600 font-medium">{formError}</p>
              )}
              <div className="sm:ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddUser}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-white transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  style={{ background: "#ff6d34" }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.background = "#e85d25";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ff6d34";
                  }}
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {submitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <Card className="p-10">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Loading users...
          </div>
        </Card>
      ) : (
        <>
          <div className="flex gap-3 flex-wrap">
            {[
              {
                label: "Total Users",
                value: users.length,
                bg: "rgba(37,99,235,0.12)",
                color: "#2563eb",
              },
              {
                label: "Active",
                value: users.filter((user) => user.status === "Active").length,
                bg: "rgba(5,150,105,0.12)",
                color: "#059669",
              },
              {
                label: "Inactive",
                value: users.filter((user) => user.status === "Inactive").length,
                bg: "rgba(148,163,184,0.12)",
                color: "var(--muted)",
              },
              {
                label: "Admins",
                value: users.filter((user) => user.role === "Admin").length,
                bg: "rgba(124,58,237,0.12)",
                color: "#7c3aed",
              },
            ].map((summary) => (
              <div
                key={summary.label}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: summary.bg, color: summary.color }}
              >
                <Users size={14} />
                {summary.value} {summary.label}
              </div>
            ))}
          </div>

          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--muted)" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email…"
              className="w-full pl-9 py-2.5 text-sm rounded-lg focus:outline-none transition"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            />
          </div>

          <Card className="overflow-hidden p-0">
            <div className="sn-table-scroll">
              <table className="w-full text-sm min-w-[44rem]">
                <thead>
                  <tr
                    style={{
                      background: "var(--bg)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {[
                      "User",
                      "Role",
                      "Department",
                      "Rating",
                      "Status",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider ${header === "Actions" ? "text-center" : "text-left"}`}
                        style={{ color: "var(--muted)" }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => {
                    const isBusy = activeAction.id === user.id;

                    return (
                      <tr
                        key={user.id}
                        className="transition"
                        style={{ borderBottom: "1px solid var(--border)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            document.documentElement.classList.contains("dark")
                              ? "rgba(255,255,255,0.03)"
                              : "#f9fafb";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar initials={user.avatar} size="sm" />
                            <div>
                              <p
                                className="font-medium"
                                style={{ color: "var(--text)" }}
                              >
                                {user.name}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: "var(--muted)" }}
                              >
                                {user.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <Badge variant={ROLE_VARIANT[user.role]}>
                            {user.role}
                          </Badge>
                        </td>

                        <td
                          className="px-5 py-4"
                          style={{ color: "var(--muted)" }}
                        >
                          {user.dept || "Not assigned"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                            ⭐ {user.rating ?? "--"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <Badge variant={STATUS_VARIANT[user.status]}>
                            {user.status}
                          </Badge>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => toggleRole(user.id)}
                              title="Toggle Role"
                              disabled={isBusy}
                              className="p-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                              style={{ color: "#2563eb" }}
                              onMouseEnter={(e) => {
                                if (!isBusy) {
                                  e.currentTarget.style.background =
                                    "rgba(37,99,235,0.1)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                              }}
                            >
                              {isBusy && activeAction.type === "role" ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <ShieldCheck size={15} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleStatus(user.id)}
                              title="Toggle Status"
                              disabled={isBusy}
                              className="p-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                              style={{ color: "#059669" }}
                              onMouseEnter={(e) => {
                                if (!isBusy) {
                                  e.currentTarget.style.background =
                                    "rgba(5,150,105,0.1)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                              }}
                            >
                              {isBusy && activeAction.type === "status" ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <UserCheck size={15} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => terminateUser(user.id)}
                              title="Terminate User"
                              disabled={isBusy}
                              className="p-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                              style={{ color: "#f59e0b" }}
                              onMouseEnter={(e) => {
                                if (!isBusy) {
                                  e.currentTarget.style.background =
                                    "rgba(245,158,11,0.1)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                              }}
                            >
                              {isBusy && activeAction.type === "terminate" ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <UserX size={15} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteUser(user.id)}
                              title="Delete User"
                              disabled={isBusy}
                              className="p-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                              style={{ color: "#dc2626" }}
                              onMouseEnter={(e) => {
                                if (!isBusy) {
                                  e.currentTarget.style.background =
                                    "rgba(220,38,38,0.1)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                              }}
                            >
                              {isBusy && activeAction.type === "delete" ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-sm"
                        style={{ color: "var(--muted)" }}
                      >
                        {users.length === 0
                          ? "No users available from the API yet."
                          : "No users match your search."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
