// ══════════════════════════════════════════════
//  USER — pages/KnowledgeBase.jsx
// ══════════════════════════════════════════════

import { useEffect, useState } from "react";
import {
  Search,
  BookOpen,
  Eye,
  ThumbsUp,
  ChevronRight,
  ChevronLeft,
  Clock,
  User,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import {
  getKnowledgeArticles,
  submitKnowledgeArticleFeedback,
} from "../../services/apiClient";

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
  const dateValue = item.date || item.createdAt || item.updatedAt;
  const parsedDate = dateValue ? new Date(dateValue) : null;

  return {
    ...item,
    id: item.id ?? item._id ?? `${item.title || "article"}-${dateValue || Date.now()}`,
    title: item.title || "Untitled article",
    category: item.category || "General",
    author: item.author || item.createdBy || item.owner || "Unknown author",
    views: Number.isNaN(parsedViews) ? 0 : parsedViews,
    helpful: Number.isNaN(parsedHelpful) ? 0 : parsedHelpful,
    verified: Boolean(item.verified),
    tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
    content: item.content || item.body || item.summary || "",
    date:
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toLocaleDateString()
        : dateValue || "Unknown date",
  };
};

const getCategories = (articles) => [
  "All",
  ...Array.from(new Set(articles.map((article) => article.category).filter(Boolean))),
];

const getContentSections = (content) =>
  String(content || "")
    .split(/\n{2,}/)
    .map((section) => section.trim())
    .filter(Boolean);

const ArticleDetail = ({
  article,
  onBack,
  onFeedback,
  feedbackLoading,
  feedbackError,
}) => {
  const contentSections = getContentSections(article.content);

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-5 font-medium max-w-full"
      >
        <ChevronLeft size={15} /> Back to Knowledge Base
      </button>

      <div className="max-w-3xl">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="default">{article.category}</Badge>
          {article.verified && <Badge variant="success">✓ Verified</Badge>}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 break-words">{article.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6 pb-5 border-b border-slate-200">
          <span className="flex items-center gap-1.5">
            <User size={13} /> {article.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} /> {article.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye size={13} /> {article.views} views
          </span>
        </div>

        <Card className="p-6 space-y-4">
          {contentSections.length > 0 ? (
            contentSections.map((section, index) => (
              <p key={`${article.id}-${index}`} className="text-slate-600 leading-relaxed">
                {section}
              </p>
            ))
          ) : (
            <p className="text-slate-600 leading-relaxed">
              No detailed content is available for this article yet.
            </p>
          )}
        </Card>

        {feedbackError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {feedbackError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6 flex-wrap">
          <p className="text-sm text-slate-500">Was this helpful?</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onFeedback(true)}
              disabled={feedbackLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {feedbackLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ThumbsUp size={14} />
              )}
              Yes ({article.helpful})
            </button>
            <button
              type="button"
              onClick={() => onFeedback(false)}
              disabled={feedbackLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const KnowledgeBase = () => {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const loadArticles = async () => {
    setLoading(true);

    try {
      setLoadError("");
      const response = await getKnowledgeArticles();
      const normalizedArticles = getArticleList(response)
        .map(normalizeArticle)
        .filter(Boolean);

      setArticles(normalizedArticles);
      setSelected((currentSelected) => {
        if (!currentSelected) return currentSelected;
        return normalizedArticles.find((article) => article.id === currentSelected.id) || null;
      });
    } catch (error) {
      console.error("Error loading knowledge base articles:", error);
      setArticles([]);
      setSelected(null);
      setLoadError("Failed to load knowledge base articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleRetry = () => {
    loadArticles();
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleCategorySelect = (nextCategory) => {
    setCategory(nextCategory);
  };

  const handleBackToList = () => {
    setSelected(null);
    setFeedbackError("");
  };

  const handleArticleOpen = (article) => {
    const viewedArticle = {
      ...article,
      views: article.views + 1,
    };

    setArticles((currentArticles) =>
      currentArticles.map((currentArticle) =>
        currentArticle.id === article.id ? viewedArticle : currentArticle,
      ),
    );
    setSelected(viewedArticle);
    setFeedbackError("");
  };

  const handleHelpfulClick = () => {
    handleFeedback(true);
  };

  const handleNotHelpfulClick = () => {
    handleFeedback(false);
  };

  const handleFeedback = async (helpful) => {
    if (!selected) return;

    try {
      setFeedbackLoading(true);
      setFeedbackError("");

      const response = await submitKnowledgeArticleFeedback(selected.id, { helpful });
      const updatedArticle = normalizeArticle(
        response?.data ?? response?.article ?? response?.item ?? response,
      );

      if (updatedArticle) {
        setArticles((currentArticles) =>
          currentArticles.map((article) =>
            article.id === updatedArticle.id ? updatedArticle : article,
          ),
        );
        setSelected(updatedArticle);
        return;
      }

      if (helpful) {
        const optimisticArticle = { ...selected, helpful: selected.helpful + 1 };
        setArticles((currentArticles) =>
          currentArticles.map((article) =>
            article.id === selected.id ? optimisticArticle : article,
          ),
        );
        setSelected(optimisticArticle);
      }
    } catch (error) {
      console.error("Error submitting article feedback:", error);
      setFeedbackError("Failed to submit feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (selected) {
    return (
      <ArticleDetail
        article={selected}
        onBack={handleBackToList}
        onFeedback={(helpful) => (helpful ? handleHelpfulClick() : handleNotHelpfulClick())}
        feedbackLoading={feedbackLoading}
        feedbackError={feedbackError}
      />
    );
  }

  const categories = getCategories(articles);
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
          subtitle="Find guides, documentation and tutorials"
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
          subtitle="Find guides, documentation and tutorials"
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
      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {loadError}
        </div>
      )}

      <div className="kb-hero rounded-xl p-5 sm:p-8 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Knowledge Base</h1>
        <p className="text-slate-500 text-sm mt-1 mb-5">Find guides, documentation and tutorials</p>
        <div className="relative max-w-lg mx-auto">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={handleSearchChange}
            placeholder={articles.length > 0 ? `Search ${articles.length}+ articles…` : "Search articles…"}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleCategorySelect(item)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              category === item
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-400">
        {filtered.length} article{filtered.length !== 1 ? "s" : ""} found
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((article) => (
          <Card
            key={article.id}
            hover
            className="p-5 flex flex-col"
            onClick={() => handleArticleOpen(article)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <BookOpen size={15} className="text-blue-600" />
              </div>
              {article.verified && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle size={12} /> Verified
                </span>
              )}
            </div>

            <h3 className="font-semibold text-slate-900 leading-snug mb-1 flex-1">{article.title}</h3>
            <p className="text-xs text-slate-400 mb-3">
              {article.category} · {article.date}
            </p>

            <div className="flex flex-wrap gap-1 mb-3">
              {article.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Eye size={11} /> {article.views}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp size={11} /> {article.helpful}
              </span>
              <span className="text-blue-600 font-medium flex items-center gap-1">
                Read <ChevronRight size={11} />
              </span>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>No articles match your search.</p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
