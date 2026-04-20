// ══════════════════════════════════════════════
//  USER — pages/Analytics.jsx  (Redesigned)
// ══════════════════════════════════════════════

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle,
  Clock,
  Award,
  Zap,
  Loader2,
} from "lucide-react";
import { Card, StatCard, SectionHeader } from "../../shared/components/UI";
import { getUserAnalyticsData } from "../../services/apiClient";

const MotionDiv = motion.div;
const CHART_C = ["#ff6d34", "#00bea3", "#7c3aed", "#2563eb", "#f59e0b"];

const STAT_ICONS = {
  "Tasks Completed": CheckCircle,
  "Learning Activity": Clock,
  Performance: Award,
  "Active Skills": Zap,
};

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    setLoading(true);

    try {
      const response = await getUserAnalyticsData();
      setAnalytics(response);
      setError("");
    } catch (loadError) {
      console.error("Error loading user analytics:", loadError);
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
        <SectionHeader title="Analytics" subtitle="Loading your performance overview" />
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
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
        <SectionHeader title="Analytics" subtitle="Track your progress and trends" />
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
      {analytics.partialData && (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.25)",
            color: "#b45309",
          }}
        >
          Some analytics sections could not be refreshed, so a few charts may be incomplete.
        </div>
      )}

      <MotionDiv
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden shadow-lg"
        style={{ background: "linear-gradient(135deg, #2D3436 0%, #1a1f20 60%, #2D3436 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #ff6d34 1px, transparent 1px), radial-gradient(circle at 80% 20%, #00bea3 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: "linear-gradient(90deg, #ff6d34, #00bea3)" }}
        />

        <div className="relative p-4 sm:p-7">
          <p className="text-sm font-medium" style={{ color: "#00bea3" }}>
            Performance Overview
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">My Analytics Dashboard</h1>
          <p className="mt-1 text-sm" style={{ color: "#9ca3af" }}>
            Track your internship progress, performance trends, and skill development.
          </p>
          <div className="flex gap-3 mt-5 flex-wrap">
            {analytics.heroChips.map((item) => (
              <div
                key={item.label}
                className="rounded-xl px-4 py-2.5 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{
                  background: "rgba(255,109,52,0.15)",
                  border: "1px solid rgba(255,109,52,0.3)",
                }}
              >
                <p className="font-bold text-lg leading-none text-white">{item.value}</p>
                <p className="text-xs mt-1" style={{ color: "#ff6d34" }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </MotionDiv>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {analytics.statCards.map((card, index) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={STAT_ICONS[card.title] || CheckCircle}
            color={card.color}
            trend={card.trend}
            subtitle={card.subtitle}
            delay={0.1 + index * 0.1}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="p-5 lg:col-span-3" delay={0.5}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              Monthly Performance Trend
            </h3>
            <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted)" }}>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: "#ff6d34" }} />
                Activity
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: "#00bea3" }} />
                Tasks
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics.monthlyTrend}>
              <defs>
                <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6d34" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ff6d34" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tasksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00bea3" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00bea3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  fontSize: 12,
                  background: "var(--card)",
                  color: "var(--text)",
                }}
              />
              <Area type="monotone" dataKey="activity" stroke="#ff6d34" fill="url(#hoursGrad)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="tasks" stroke="#00bea3" fill="url(#tasksGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 lg:col-span-2 flex flex-col items-center justify-center" delay={0.6}>
          <h3 className="text-sm font-semibold mb-2 self-start" style={{ color: "var(--text)" }}>
            Overall Score
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              startAngle={180}
              endAngle={0}
              data={[{ name: "Score", value: analytics.performanceScore, fill: "#ff6d34" }]}
              barSize={12}
            >
              <RadialBar background={{ fill: "var(--border)" }} dataKey="value" cornerRadius={6} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center -mt-8">
            <p className="text-3xl font-bold" style={{ color: "#ff6d34" }}>
              {analytics.performanceScore}%
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Performance Score
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5" delay={0.7}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>
            Skill Learning Distribution
          </h3>
          {analytics.skillDistribution.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie
                    data={analytics.skillDistribution}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {analytics.skillDistribution.map((_, index) => (
                      <Cell key={index} fill={CHART_C[index % CHART_C.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      fontSize: 12,
                      background: "var(--card)",
                      color: "var(--text)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5 flex-1">
                {analytics.skillDistribution.map((item, index) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_C[index % CHART_C.length] }} />
                        <span style={{ color: "var(--text)" }}>{item.name}</span>
                      </span>
                      <span className="font-bold" style={{ color: "var(--text)" }}>
                        {item.value}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${item.value}%`, background: CHART_C[index % CHART_C.length] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-sm" style={{ color: "var(--muted)" }}>
              Skill analytics are not available yet.
            </div>
          )}
        </Card>

        <Card className="p-5" delay={0.8}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>
            Task Progress by Category
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.taskProgress} layout="vertical">
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="task"
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  fontSize: 12,
                  background: "var(--card)",
                  color: "var(--text)",
                }}
                formatter={(value) => [`${value}%`, "Completion"]}
              />
              <Bar dataKey="completion" radius={[0, 6, 6, 0]} barSize={16}>
                {analytics.taskProgress.map((_, index) => (
                  <Cell key={index} fill={CHART_C[index % CHART_C.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5" delay={0.9}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            Key Strengths & Competencies
          </h3>
          <div
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: "rgba(0,190,163,0.12)", color: "#00bea3" }}
          >
            Based on current analytics
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {analytics.strengths.map((item, index) => (
            <div
              key={item.label}
              className="text-center p-4 rounded-xl transition-all hover:-translate-y-1"
              style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
            >
              <div className="relative w-14 h-14 mx-auto mb-3">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="var(--border)" strokeWidth="4" />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke={CHART_C[index % CHART_C.length]}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(item.score / 100) * 150.8} 150.8`}
                  />
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                  style={{ color: "var(--text)" }}
                >
                  {item.score}
                </span>
              </div>
              <p className="text-xs font-medium" style={{ color: "var(--text)" }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5" delay={1.0}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>
          Weekly Learning Activity
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={analytics.weeklyActivity}>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid var(--border)",
                fontSize: 12,
                background: "var(--card)",
                color: "var(--text)",
              }}
            />
            <Bar dataKey="activity" radius={[6, 6, 0, 0]} barSize={32}>
              {analytics.weeklyActivity.map((_, index) => (
                <Cell key={index} fill={index % 2 === 0 ? "#ff6d34" : "#00bea3"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default Analytics;
