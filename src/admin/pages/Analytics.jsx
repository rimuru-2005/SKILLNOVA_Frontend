// ══════════════════════════════════════════════
//  ADMIN — pages/Analytics.jsx
// ══════════════════════════════════════════════

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  FileText,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Card, StatCard, SectionHeader } from "../../shared/components/UI";
import { CHART_COLORS } from "../../shared/utils/constants";
import { getAdminAnalyticsData } from "../../services/apiClient";

const STAT_ICONS = {
  "Total Reports": FileText,
  "Avg Performance": TrendingUp,
  "KB Articles": BookOpen,
  "Questions Answered": MessageSquare,
};

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    setLoading(true);

    try {
      const response = await getAdminAnalyticsData();
      setAnalytics(response);
      setError("");
    } catch (loadError) {
      console.error("Error loading admin analytics:", loadError);
      setAnalytics(null);
      setError("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Platform Analytics"
          subtitle="Insights across all interns, reports and platform activity"
        />
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={15} className="animate-spin" />
            Loading analytics...
          </div>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Platform Analytics"
          subtitle="Insights across all interns, reports and platform activity"
        />
        <Card className="p-5 space-y-4">
          <p className="text-sm text-red-600">{error || "Unable to load analytics."}</p>
          <button
            type="button"
            onClick={loadAnalytics}
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
        title="Platform Analytics"
        subtitle="Insights across all interns, reports and platform activity"
      />

      {analytics.partialData && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Some analytics sections could not be refreshed, so a few charts may be incomplete.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {analytics.statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={STAT_ICONS[card.title] || TrendingUp}
            color={card.color}
            trend={card.trend}
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Intern Performance Scores</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.performanceData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  fontSize: 12,
                  background: "var(--card)",
                  color: "var(--text)",
                }}
                formatter={(value) => [`${value}/10`, "Score"]}
              />
              <Bar dataKey="score" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Interns by Department</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={analytics.departmentData}
                dataKey="value"
                nameKey="name"
                outerRadius={75}
                innerRadius={40}
                paddingAngle={3}
              >
                {analytics.departmentData.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  fontSize: 12,
                  background: "var(--card)",
                  color: "var(--text)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {analytics.departmentData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="text-slate-600 truncate">{item.name}</span>
                <span className="font-semibold text-slate-800 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Report Submission vs Review</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.weeklyReports} barGap={4}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  fontSize: 12,
                  background: "var(--card)",
                  color: "var(--text)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="submitted" fill="#2563EB" radius={[3, 3, 0, 0]} name="Submitted" />
              <Bar dataKey="reviewed" fill="#059669" radius={[3, 3, 0, 0]} name="Reviewed" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Platform Activity Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics.activityTrend}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  fontSize: 12,
                  background: "var(--card)",
                  color: "var(--text)",
                }}
              />
              <Area
                type="monotone"
                dataKey="activity"
                stroke="#7C3AED"
                fill="url(#analyticsGrad)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5 overflow-hidden">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Intern Task Summary</h3>
        <div className="sn-table-scroll -mx-1">
          <table className="w-full text-sm min-w-[36rem]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Intern", "Department", "Score", "Tasks Completed", "Status"].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.taskSummary.map((item) => (
                <tr key={item.name} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-slate-500">{item.department}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      ⭐ {item.score}/10
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.tasks}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        item.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {analytics.taskSummary.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm">
                    No intern analytics are available yet.
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

export default Analytics;
