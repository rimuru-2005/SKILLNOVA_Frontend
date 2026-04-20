// ══════════════════════════════════════════════
//  ADMIN — pages/KnowledgeBase.jsx
// ══════════════════════════════════════════════

import { useEffect, useState } from "react";
import {
  Search,
  BookOpen,
  Eye,
  ThumbsUp,
  CheckCircle,
  Plus,
  Trash2,
  ShieldCheck,
  X,
  Loader2,
} from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import {
  createAdminKnowledgeArticle,
  deleteAdminKnowledgeArticle,
  getAdminKnowledgeArticles,
  updateAdminKnowledgeArticle,
} from "../../services/apiClient";

const DEFAULT_FORM = { title: "", category: "General" };

const getArticleList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.articles)) return payload.articles;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const normalizeArticle = (item) => {
  if (!item || typeof item !== "object") return null;

  const parsedViews = Number.parseInt(item.views, 10);
  const parsedHelpful = Number.parseInt(item.helpful, 10);

  return {
    ...item,
    id: item.id ?? item._id ?? `${item.title || "article"}-${item.createdAt || Date.now()}`,
    title: item.title || "Untitled article",
    category: item.category || "General",
    author: item.author || item.createdBy || item.owner || "Unknown author",
    views: Number.isNaN(parsedViews) ? 0 : parsedViews,
    helpful: Number.isNaN(parsedHelpful) ? 0 : parsedHelpful,
    verified: Boolean(item.verified),
  };
};

const getCategoryOptions = (articles, includeAll = false) => {
  const uniqueCategories = Array.from(
    new Set(articles.map((article) => article.category).filter(Boolean)),
  );

  if (!uniqueCategories.includes("General")) {
    uniqueCategories.unshift("General");
  }

  return includeAll ? ["All", ...uniqueCategories] : uniqueCategories;
};

const KnowledgeBase = () => {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionState, setActionState] = useState({ id: null, type: "" });

  const loadArticles = async () => {
    setLoading(true);

    try {
      setLoadError("");
      const response = await getAdminKnowledgeArticles();
      setArticles(getArticleList(response).map(normalizeArticle).filter(Boolean));
    } catch (error) {
      console.error("Error loading admin knowledge articles:", error);
      setArticles([]);
      setLoadError("Failed to load knowledge base articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleToggleForm = () => {
    if (showForm) {
      closeForm();
      return;
    }

    setShowForm(true);
    setFormError("");
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleCategorySelect = (nextCategory) => {
    setCategory(nextCategory);
  };

  const handleTitleChange = (event) => {
    setForm((currentForm) => ({ ...currentForm, title: event.target.value }));
    setFormError("");
  };

  const handleFormCategoryChange = (event) => {
    setForm((currentForm) => ({ ...currentForm, category: event.target.value }));
    setFormError("");
  };

  const handleRetry = () => {
    loadArticles();
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(DEFAULT_FORM);
    setFormError("");
  };

  const handleAdd = async () => {
    const title = form.title.trim();
    const nextCategory = form.category.trim();

    if (!title) return;
    if (!nextCategory) {
      setFormError("Category is required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const response = await createAdminKnowledgeArticle({
        title,
        category: nextCategory,
      });

      const createdArticle = normalizeArticle(
        response?.data ?? response?.article ?? response?.item ?? response,
      );

      if (createdArticle) {
        setArticles((currentArticles) => [createdArticle, ...currentArticles]);
      } else {
        await loadArticles();
      }

      closeForm();
    } catch (error) {
      console.error("Error creating article:", error);
      setFormError("Failed to create article.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVerify = async (id) => {
    const article = articles.find((item) => item.id === id);
    if (!article) return;

    try {
      setActionState({ id, type: "verify" });

      const response = await updateAdminKnowledgeArticle(id, {
        verified: !article.verified,
      });

      const updatedArticle = normalizeArticle(
        response?.data ?? response?.article ?? response?.item ?? response,
      );

      setArticles((currentArticles) =>
        currentArticles.map((item) =>
          item.id === id
            ? updatedArticle || { ...item, verified: !item.verified }
            : item,
        ),
      );
    } catch (error) {
      console.error("Error updating article verification:", error);
      setLoadError("Failed to update article verification.");
    } finally {
      setActionState({ id: null, type: "" });
    }
  };

  const deleteArticle = async (id) => {
    try {
      setActionState({ id, type: "delete" });

      await deleteAdminKnowledgeArticle(id);
      setArticles((currentArticles) =>
        currentArticles.filter((article) => article.id !== id),
      );
    } catch (error) {
      console.error("Error deleting article:", error);
      setLoadError("Failed to delete article.");
    } finally {
      setActionState({ id: null, type: "" });
    }
  };

  const categories = getCategoryOptions(articles, true);
  const formCategories = getCategoryOptions(articles);

  const filtered = articles.filter(
    (article) =>
      (category === "All" || article.category === category) &&
      article.title.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Knowledge Base"
          subtitle="Manage articles, verify content and track engagement"
        />
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={15} className="animate-spin" />
            Loading knowledge base...
          </div>
        </Card>
      </div>
    );
  }

  if (loadError && articles.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Knowledge Base"
          subtitle="Manage articles, verify content and track engagement"
        />
        <Card className="p-5 space-y-4">
          <p className="text-sm text-red-600">{loadError}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Knowledge Base"
        subtitle="Manage articles, verify content and track engagement"
        action={
          <button
            type="button"
            onClick={handleToggleForm}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            <Plus size={15} /> Add Article
          </button>
        }
      />

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {loadError}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
          <BookOpen size={14} /> {articles.length} Total Articles
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
          <CheckCircle size={14} /> {articles.filter((article) => article.verified).length} Verified
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
          <Eye size={14} /> {articles.reduce((sum, article) => sum + article.views, 0)} Total Views
        </div>
      </div>

      {showForm && (
        <Card className="p-5 border-blue-200 bg-blue-50/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">New Article</h3>
            <button
              type="button"
              onClick={closeForm}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex gap-3">
            <input
              value={form.title}
              onChange={handleTitleChange}
              placeholder="Article title…"
              disabled={submitting}
              className="flex-1 px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <select
              value={form.category}
              onChange={handleFormCategoryChange}
              disabled={submitting}
              className="px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none"
            >
              {formCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              disabled={submitting}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Adding..." : "Add"}
            </button>
          </div>
          {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={handleSearchChange}
            placeholder="Search articles…"
            className="w-full pl-9 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleCategorySelect(item)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                category === item
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="sn-table-scroll">
          <table className="w-full text-sm min-w-[52rem]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Article", "Category", "Author", "Views", "Helpful", "Verified", "Actions"].map((header) => (
                  <th
                    key={header}
                    className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                      header === "Actions" ? "text-center" : "text-left"
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((article) => {
                const isBusy = actionState.id === article.id;

                return (
                  <tr key={article.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-blue-50 flex-shrink-0">
                          <BookOpen size={13} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-slate-900 line-clamp-1">{article.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="gray">{article.category}</Badge>
                    </td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{article.author}</td>
                    <td className="px-5 py-4 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {article.views}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      <span className="flex items-center gap-1">
                        <ThumbsUp size={12} /> {article.helpful}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {article.verified ? (
                        <Badge variant="success">✓ Verified</Badge>
                      ) : (
                        <Badge variant="warning">Unverified</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleVerify(article.id)}
                          title={article.verified ? "Unverify" : "Verify"}
                          disabled={isBusy}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isBusy && actionState.type === "verify" ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <ShieldCheck size={14} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteArticle(article.id)}
                          title="Delete"
                          disabled={isBusy}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isBusy && actionState.type === "delete" ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                    No articles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default KnowledgeBase;
