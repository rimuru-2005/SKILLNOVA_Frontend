import { useState, useEffect } from "react";
import { Loader2, Pin, Megaphone } from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import {
  getAnnouncements,
  getUserAnnouncementPins,
  setUserAnnouncementPin,
} from "../../services/apiClient";

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

const normalizeAnnouncement = (item, pinnedIds) => {
  if (!item || typeof item !== "object") return null;

  const createdAt =
    item.createdAt ||
    item.updatedAt ||
    item.date ||
    item.publishedAt ||
    new Date().toISOString();
  const id = item.id ?? item._id ?? `${item.title || "announcement"}-${createdAt}`;

  return {
    ...item,
    id,
    title: item.title || "Untitled announcement",
    content: item.content || item.desc || item.message || item.text || "",
    priority: normalizePriority(item.priority),
    pinned: Boolean(item.pinned) || pinnedIds.includes(id),
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

  const loadAnnouncements = async () => {
    setLoading(true);

    try {
      const [pinnedIds, response] = await Promise.all([
        getUserAnnouncementPins(),
        getAnnouncements(),
      ]);
      const nextItems = getAnnouncementList(response)
        .map((item) => normalizeAnnouncement(item, pinnedIds))
        .filter(Boolean);

      setItems(nextItems);
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

  const handlePinToggle = async (id) => {
    const announcement = items.find((item) => item.id === id);
    if (!announcement) return;

    const nextPinnedState = !announcement.pinned;

    await setUserAnnouncementPin(id, nextPinnedState);

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, pinned: nextPinnedState } : item,
      ),
    );
  };

  const filtered = items
    .filter((item) => filter === "All" || item.priority === filter)
    .sort((left, right) => Number(right.pinned) - Number(left.pinned));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Announcements"
        subtitle="Stay updated with platform and internship news"
        action={<span className="text-sm text-slate-400">{items.filter((item) => item.pinned).length} pinned</span>}
      />

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

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <Card className="p-6">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" />
              Loading announcements...
            </div>
          </Card>
        ) : filtered.length > 0 ? (
          filtered.map((announcement) => (
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

                <button
                  type="button"
                  onClick={() => handlePinToggle(announcement.id)}
                  className={`p-1.5 rounded-lg transition flex-shrink-0 ${
                    announcement.pinned
                      ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                      : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                  title={announcement.pinned ? "Unpin" : "Pin"}
                >
                  <Pin size={15} />
                </button>
              </div>
            </Card>
          ))
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
