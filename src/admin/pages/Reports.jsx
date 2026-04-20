// ══════════════════════════════════════════════
//  ADMIN — pages/Reports.jsx
// ══════════════════════════════════════════════

import { useEffect, useState } from "react";
import {
  Search,
  FileText,
  Download,
  CheckCircle,
  Clock,
  Star,
  Loader2,
} from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import { approveAdminReport, getAdminReports } from "../../services/apiClient";

const FILTERS = ["All", "Pending", "Reviewed"];

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
    intern: item.intern || item.internName || item.user || "Unknown intern",
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
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionState, setActionState] = useState({ id: null, type: "" });

  const loadReports = async () => {
    setLoading(true);

    try {
      setError("");
      // API CALL
      const response = await getAdminReports();
      setReports(getReportList(response).map(normalizeReport).filter(Boolean));
    } catch (loadError) {
      console.error("Error fetching admin reports:", loadError);
      setReports([]);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const approveReport = async (id) => {
    try {
      setActionState({ id, type: "approve" });
      setError("");

      // API CALL
      const response = await approveAdminReport(id, { status: "Reviewed" });
      const approvedReport = normalizeReport(response?.data ?? response?.report ?? response?.item ?? response);

      setReports((currentReports) =>
        currentReports.map((report) => {
          if (report.id !== id) {
            return report;
          }

          return approvedReport || {
            ...report,
            status: "Reviewed",
            score: report.score ?? 7.5,
          };
        }),
      );
    } catch (approveError) {
      console.error("Error approving report:", approveError);
      setError("Failed to approve report.");
    } finally {
      setActionState({ id: null, type: "" });
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
      (filter === "All" || report.status === filter) &&
      (report.title.toLowerCase().includes(search.toLowerCase()) ||
        report.intern.toLowerCase().includes(search.toLowerCase())),
  );

  const pending = reports.filter((report) => report.status === "Pending").length;
  const reviewed = reports.filter((report) => report.status === "Reviewed").length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Intern Reports"
        subtitle="Review, approve and manage weekly progress reports"
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
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
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
              <FileText size={14} /> {reports.length} Total Reports
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
              <Clock size={14} /> {pending} Pending Review
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
              <CheckCircle size={14} /> {reviewed} Reviewed
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or intern name…"
                className="w-full pl-9 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === item
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((report) => {
              const isApproving =
                actionState.id === report.id && actionState.type === "approve";

              return (
                <Card key={report.id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div
                        className={`p-3 rounded-xl flex-shrink-0 ${
                          report.status === "Reviewed" ? "bg-emerald-50" : "bg-amber-50"
                        }`}
                      >
                        <FileText
                          size={20}
                          className={
                            report.status === "Reviewed"
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 break-words">
                          {report.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Submitted by{" "}
                          <span className="font-medium text-slate-600">
                            {report.intern}
                          </span>{" "}
                          · {report.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:justify-end flex-shrink-0">
                      <Badge
                        variant={report.status === "Reviewed" ? "success" : "warning"}
                      >
                        {report.status}
                      </Badge>

                      {report.score !== null ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                          <Star size={11} /> {report.score}/10
                        </span>
                      ) : (
                        <button
                          onClick={() => approveReport(report.id)}
                          disabled={isApproving}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isApproving ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <CheckCircle size={12} />
                          )}
                          {isApproving ? "Approving..." : "Approve"}
                        </button>
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
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                <p>
                  {reports.length === 0
                    ? "No reports are available from the backend yet."
                    : "No reports match your search."}
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
