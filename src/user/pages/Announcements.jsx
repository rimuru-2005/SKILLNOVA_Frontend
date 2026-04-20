import { useState, useEffect } from "react";
import { Loader2, Pin, Megaphone } from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import { request } from "../../services/api";

const PRIORITY_VARIANTS = { High: "danger", Medium: "warning", Low: "success" };
const FILTERS = ["All", "High", "Medium", "Low"];

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
  const [loading, setLoading] = useState(true);
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

    loadAnnouncements();

    return () => {
      isMounted = false;
    };
  }, []);

  const togglePin = (id) =>
    setItems((currentItems) =>
      currentItems.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a)),
    );

  const filtered = items
    .filter((a) => filter === "All" || a.priority === filter)
    .sort((a, b) => b.pinned - a.pinned);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Announcements"
        subtitle="Stay updated with platform and internship news"
        action={
          <span className="text-sm text-slate-400">
            {items.filter((a) => a.pinned).length} pinned
          </span>
        }
      />

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

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

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

              <button
                onClick={() => togglePin(a.id)}
                className={`p-1.5 rounded-lg transition flex-shrink-0 ${
                  a.pinned
                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                    : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                }`}
                title={a.pinned ? "Unpin" : "Pin"}
              >
                <Pin size={15} />
              </button>
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