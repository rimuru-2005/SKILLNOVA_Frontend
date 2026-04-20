// ══════════════════════════════════════════════
//  ADMIN — pages/Announcements.jsx
// ══════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Loader2, Plus, Pin, Trash2, Megaphone, X } from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from "../../services/apiClient";

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
      (item.title || item.content || item.desc || item.message || item.text || item.id || item._id),
  );

const getSingleAnnouncement = (payload) => {
  const candidates = [payload?.data, payload?.announcement, payload?.item, payload];
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
  const [actionState, setActionState] = useState({ id: null, type: "" });
  const [error, setError] = useState("");

  const loadAnnouncements = async () => {
    setLoading(true);

    try {
      const response = await getAnnouncements();
      setItems(getAnnouncementList(response).map(normalizeAnnouncement).filter(Boolean));
      setError("");
    } catch (loadError) {
      console.error("Error loading announcements:", loadError);
      setItems([]);
      setError("Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const closeForm = () => {
    setShowForm(false);
    setForm(DEFAULT_FORM);
  };

  const handleToggleForm = () => {
    if (showForm) {
      closeForm();
      return;
    }

    setShowForm(true);
  };

  const handlePost = async () => {
    const title = form.title.trim();
    const content = form.desc.trim();

    if (!title || !content || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await createAnnouncement({
        title,
        content,
        priority: form.priority,
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
      closeForm();
    } catch (createError) {
      console.error("Error creating announcement:", createError);
      setError("Failed to post announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePinToggle = async (id) => {
    const announcement = items.find((item) => item.id === id);
    if (!announcement) return;

    try {
      setActionState({ id, type: "pin" });
      setError("");

      const response = await updateAnnouncement(id, {
        pinned: !announcement.pinned,
      });

      const updatedAnnouncement = normalizeAnnouncement(getSingleAnnouncement(response));

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === id
            ? updatedAnnouncement || { ...item, pinned: !item.pinned }
            : item,
        ),
      );
    } catch (updateError) {
      console.error("Error updating announcement pin:", updateError);
      setError("Failed to update the pin state.");
    } finally {
      setActionState({ id: null, type: "" });
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionState({ id, type: "delete" });
      setError("");

      await deleteAnnouncement(id);
      setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    } catch (deleteError) {
      console.error("Error deleting announcement:", deleteError);
      setError("Failed to delete announcement.");
    } finally {
      setActionState({ id: null, type: "" });
    }
  };

  const filtered = items
    .filter((item) => filter === "All" || item.priority === filter)
    .sort((left, right) => Number(right.pinned) - Number(left.pinned));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Announcements"
        subtitle="Create and manage platform-wide announcements"
        action={
          <button
            type="button"
            onClick={handleToggleForm}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            <Plus size={15} /> {showForm ? "Close Form" : "New Announcement"}
          </button>
        }
      />

      {showForm && (
        <Card className="p-5 border-blue-200 bg-blue-50/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Create Announcement</h3>
            <button
              type="button"
              onClick={closeForm}
              disabled={submitting}
              className="text-slate-400 hover:text-slate-600 disabled:opacity-60"
            >
              <X size={16} />
            </button>
          </div>
          <div className="space-y-3">
            <input
              value={form.title}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, title: event.target.value }))
              }
              placeholder="Announcement title…"
              disabled={submitting}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <textarea
              value={form.desc}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, desc: event.target.value }))
              }
              placeholder="Write the announcement message…"
              rows={3}
              disabled={submitting}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-slate-500">Priority:</label>
              <div className="flex gap-2">
                {PRIORITIES.map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() =>
                      setForm((currentForm) => ({ ...currentForm, priority }))
                    }
                    disabled={submitting}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      form.priority === priority
                        ? priority === "High"
                          ? "bg-red-500 text-white"
                          : priority === "Medium"
                            ? "bg-amber-500 text-white"
                            : "bg-emerald-500 text-white"
                        : "bg-white border border-slate-200 text-slate-600"
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handlePost}
                disabled={submitting || !form.title.trim() || !form.desc.trim()}
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

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === item
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <Card className="p-6">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" />
              Loading announcements...
            </div>
          </Card>
        ) : filtered.length > 0 ? (
          filtered.map((announcement) => {
            const isBusy = actionState.id === announcement.id;

            return (
              <Card
                key={announcement.id}
                className={`p-5 ${announcement.pinned ? "border-l-4 border-l-blue-500" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {announcement.pinned && (
                        <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                          <Pin size={11} /> Pinned
                        </span>
                      )}
                      <Badge variant={PRIORITY_VARIANTS[announcement.priority]}>
                        {announcement.priority}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900">{announcement.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {getCreatedAtLabel(announcement.createdAt)}
                    </p>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handlePinToggle(announcement.id)}
                      title={announcement.pinned ? "Unpin" : "Pin"}
                      disabled={isBusy}
                      className={`p-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed ${
                        announcement.pinned
                          ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                          : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      {isBusy && actionState.type === "pin" ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Pin size={14} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(announcement.id)}
                      title="Delete"
                      disabled={isBusy}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isBusy && actionState.type === "delete" ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
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
