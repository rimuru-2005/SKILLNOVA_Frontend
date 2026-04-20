// ══════════════════════════════════════════════
//  ADMIN — pages/Announcements.jsx
// ══════════════════════════════════════════════

import { useState, useEffect } from "react";
import { Loader2, Plus, Pin, Trash2, Megaphone, X } from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import { request } from "../../services/api";

const PRIORITY_VARIANTS = { High: "danger", Medium: "warning", Low: "success" };
const PRIORITIES = ["High", "Medium", "Low"];
const FILTERS = ["All", "High", "Medium", "Low"];
const DEFAULT_FORM = { title: "", desc: "", priority: "Medium" };

const normalizePriority = (value) => {
  if (typeof value !== "string") return "Medium";

  const normalized = value.trim().toLowerCase();

  if (normalized === "high") return "High";
  if (normalized === "low") return "Low";
  return "Medium";
};

const getAnnouncementList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.announcements)) return payload.announcements;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const isAnnouncementLike = (item) =>
  Boolean(
    item &&
      typeof item === "object" &&
      (item.title ||
        item.content ||
        item.desc ||
        item.message ||
        item.text ||
        item.id ||
        item._id),
  );

const getSingleAnnouncement = (payload) => {
  const candidates = [
    payload?.data,
    payload?.announcement,
    payload?.item,
    payload,
  ];

  return candidates.find(isAnnouncementLike) || null;
};

const normalizeAnnouncement = (item) => {
  if (!item || typeof item !== "object") return null;

  const createdAt =
    item.createdAt ||
    item.updatedAt ||
    item.date ||
    item.publishedAt ||
    new Date().toISOString();

  return {
    ...item,
    id: item.id ?? item._id ?? `${item.title || "announcement"}-${createdAt}`,
    title: item.title || "Untitled announcement",
    content: item.content || item.desc || item.message || item.text || "",
    priority: normalizePriority(item.priority),
    pinned: Boolean(item.pinned),
    createdAt,
  };
};

const getCreatedAtLabel = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recently" : date.toLocaleDateString();
};

const Announcements = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadAnnouncements = async () => {
      setLoading(true);
      try {
        const response = await request("/announcements");
        const nextItems = getAnnouncementList(response)
          .map(normalizeAnnouncement)
          .filter(Boolean);

        if (!isMounted) return;
        setItems(nextItems);
        setError("");
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setItems([]);
        setError("Failed to load announcements.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!localStorage.getItem("token")) {
      localStorage.setItem("token", "demo-admin-token");
    }

    loadAnnouncements();

    return () => {
      isMounted = false;
    };
  }, []);

  const togglePin = (id) =>
    setItems((is) =>
      is.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a)),
    );

  const handlePost = async () => {
    const title = form.title.trim();
    const content = form.desc.trim();

    if (!title || !content || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await request("/announcements", {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
          priority: form.priority,
        }),
      });

      const createdAnnouncement = normalizeAnnouncement(
        getSingleAnnouncement(response) || {
          id: `temp-${Date.now()}`,
          title,
          content,
          priority: form.priority,
          pinned: false,
          createdAt: new Date().toISOString(),
        },
      );

      setItems((currentItems) => [createdAnnouncement, ...currentItems]);

      setForm(DEFAULT_FORM);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError("Failed to post announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = async (id) => {
    if (deletingId !== null) return;

    setDeletingId(id);
    setError("");

    try {
      await request(`/announcements/${id}`, {
        method: "DELETE",
      });

      setItems((currentItems) => currentItems.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete announcement.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = items
    .filter((a) => filter === "All" || a.priority === filter)
    .sort((a, b) => b.pinned - a.pinned);
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Announcements"
        subtitle="Create and manage platform-wide announcements"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            <Plus size={15} /> New Announcement
          </button>
        }
      />

      {/* Create Form */}
      {showForm && (
        <Card className="p-5 border-blue-200 bg-blue-50/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Create Announcement
            </h3>
            <button
              onClick={() => setShowForm(false)}
              disabled={submitting}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>
          <div className="space-y-3">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Announcement title…"
              disabled={submitting}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <textarea
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder="Write the announcement message…"
              rows={3}
              disabled={submitting}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-slate-500">
                Priority:
              </label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    onClick={() => setForm({ ...form, priority: p })}
                    disabled={submitting}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      form.priority === p
                        ? p === "High"
                          ? "bg-red-500 text-white"
                          : p === "Medium"
                            ? "bg-amber-500 text-white"
                            : "bg-emerald-500 text-white"
                        : "bg-white border border-slate-200 text-slate-600"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={handlePost}
                disabled={
                  submitting || !form.title.trim() || !form.desc.trim()
                }
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === f
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {loading && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-10 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Loading announcements...
          </div>
        )}

        {!loading &&
          filtered.map((a) => (
          <Card
            key={a.id}
            className={`p-5 ${a.pinned ? "border-l-4 border-l-blue-500" : ""}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {a.pinned && (
                    <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                      <Pin size={11} /> Pinned
                    </span>
                  )}
                  <Badge variant={PRIORITY_VARIANTS[a.priority]}>
                    {a.priority}
                  </Badge>
                </div>
                <h3 className="font-semibold text-slate-900">{a.title}</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  {a.content}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  {getCreatedAtLabel(a.createdAt)}
                </p>
              </div>

              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => togglePin(a.id)}
                  title={a.pinned ? "Unpin" : "Pin"}
                  className={`p-2 rounded-lg transition ${
                    a.pinned
                      ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                      : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Pin size={14} />
                </button>
                <button
                  onClick={() => deleteItem(a.id)}
                  title="Delete"
                  disabled={deletingId === a.id}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deletingId === a.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </div>
          </Card>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Megaphone size={40} className="mx-auto mb-3 opacity-30" />
            <p>No announcements found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;


// problems:-  PIN State not handled