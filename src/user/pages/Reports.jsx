// ══════════════════════════════════════════════
//  USER — pages/Reports.jsx
// ══════════════════════════════════════════════

import { useEffect, useState } from "react";
import {
  Search,
  Upload,
  FileText,
  Download,
  Loader2,
  X,
} from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import { createUserReport, getUserReports } from "../../services/apiClient";

const DEFAULT_FORM = {
  title: "",
  summary: "",
};

const getReportList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.reports)) return payload.reports;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const normalizeStatus = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "reviewed" || normalized === "approved" || normalized === "verified") {
    return "Reviewed";
  }

  return "Pending";
};

const normalizeReport = (item) => {
  if (!item || typeof item !== "object") return null;

  const score = Number.parseFloat(item.score ?? item.rating);
  const dateValue = item.date || item.submittedAt || item.createdAt;
  const parsedDate = dateValue ? new Date(dateValue) : null;

  return {
    ...item,
    id: item.id ?? item._id ?? `${item.title || item.name || "report"}-${dateValue || Date.now()}`,
    title: item.title || item.name || "Untitled report",
    intern: item.intern || item.internName || item.user || "You",
    status: normalizeStatus(item.status),
    score: Number.isNaN(score) ? null : Number(score.toFixed(1)),
    date:
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toLocaleDateString()
        : dateValue || "Unknown date",
    downloadUrl: item.downloadUrl || item.fileUrl || item.url || "",
  };
};

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  const loadReports = async () => {
    setLoading(true);

    try {
      setError("");
      // API CALL
      const response = await getUserReports();
      setReports(getReportList(response).map(normalizeReport).filter(Boolean));
    } catch (loadError) {
      console.error("Error fetching user reports:", loadError);
      setReports([]);
      setError("Failed to load your reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const closeForm = () => {
    setShowForm(false);
    setForm(DEFAULT_FORM);
  };

  const handleCreateReport = async () => {
    const title = form.title.trim();
    const summary = form.summary.trim();

    if (!title) {
      setError("Report title is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // API CALL
      const response = await createUserReport({
        title,
        summary: summary || undefined,
      });

      const createdReport = normalizeReport(
        response?.data ?? response?.report ?? response?.item ?? response,
      );

      if (createdReport) {
        setReports((currentReports) => [createdReport, ...currentReports]);
      } else {
        await loadReports();
      }

      closeForm();
    } catch (createError) {
      console.error("Error creating report:", createError);
      setError("Failed to upload report.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = (report) => {
    if (!report.downloadUrl) {
      setError("This report does not have a downloadable file yet.");
      return;
    }

    window.open(report.downloadUrl, "_blank", "noopener,noreferrer");
  };

  const filtered = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      report.intern.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="My Reports"
        subtitle="View and manage your weekly progress reports"
        action={
          <button
            type="button"
            onClick={() => (showForm ? closeForm() : setShowForm(true))}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            {showForm ? <X size={15} /> : <Upload size={15} />}
            {showForm ? "Close Form" : "Upload Report"}
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {showForm && (
        <Card className="p-5 border-blue-200 bg-blue-50/40">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Upload New Report
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Create a new report entry from the backend.
              </p>
            </div>

            <input
              value={form.title}
              onChange={(e) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  title: e.target.value,
                }))
              }
              disabled={submitting}
              placeholder="Report title"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            <textarea
              value={form.summary}
              onChange={(e) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  summary: e.target.value,
                }))
              }
              disabled={submitting}
              placeholder="Short summary (optional)"
              rows={3}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateReport}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? "Uploading..." : "Create Report"}
              </button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <Card className="p-6">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Loading reports...
          </div>
        </Card>
      ) : (
        <>
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports…"
              className="w-full pl-9 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>

          <div className="space-y-3">
            {filtered.map((report) => (
              <Card key={report.id} hover className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="p-3 rounded-xl bg-blue-50 flex-shrink-0">
                      <FileText size={20} className="text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 break-words">
                        {report.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Submitted by {report.intern} · {report.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-shrink-0 sm:justify-end">
                    <Badge
                      variant={report.status === "Reviewed" ? "success" : "warning"}
                    >
                      {report.status}
                    </Badge>
                    {report.score !== null && (
                      <span className="text-sm font-bold text-slate-700">
                        {report.score}/10
                      </span>
                    )}
                    <button
                      onClick={() => handleDownload(report)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs hover:bg-slate-200 transition"
                    >
                      <Download size={13} /> Download
                    </button>
                  </div>
                </div>
              </Card>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                <p>
                  {reports.length === 0
                    ? "No reports are available from the backend yet."
                    : "No reports found."}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
