// ══════════════════════════════════════════════
//  USER — pages/Dashboard.jsx  (UptoSkills Branded)
// ══════════════════════════════════════════════

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ClipboardList,
  CalendarCheck,
  TrendingUp,
  MessageSquare,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, StatCard, SectionHeader } from "../../shared/components/UI";
import { getUserDashboardData } from "../../services/apiClient";

const MotionDiv = motion.div;
const CHART_C = ["#ff6d34", "#00bea3", "#2D3436", "#f97316", "#06b6d4"];

const STAT_ICONS = {
  "Assigned Tasks": ClipboardList,
  Completed: CheckCircle,
  Attendance: CalendarCheck,
  "Review Rate": CalendarCheck,
  Performance: TrendingUp,
};

const Dashboard = ({ onNavigate }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const response = await getUserDashboardData();
      setDashboard(response);
      setError("");
    } catch (loadError) {
      console.error("Error loading user dashboard:", loadError);
      setDashboard(null);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Dashboard" subtitle="Loading your overview" />
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
            <Loader2 size={15} className="animate-spin" />
            Loading dashboard...
          </div>
        </Card>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Dashboard" subtitle="Your learning overview" />
        <Card className="p-5 space-y-4">
          <p className="text-sm text-red-600">{error || "Unable to load dashboard."}</p>
          <button
            type="button"
            onClick={loadDashboard}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pb-16">
      {dashboard.partialData && (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.25)",
            color: "#b45309",
          }}
        >
          Some dashboard sections could not be refreshed, so a few cards may be incomplete.
        </div>
      )}

      <MotionDiv
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-xl overflow-hidden shadow-lg"
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
            {dashboard.heroDate}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Good morning, {dashboard.profile.name}! 👋
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#9ca3af" }}>
            You have {dashboard.heroSummary.pendingTasks} pending tasks and{" "}
            {dashboard.heroSummary.unreadAnnouncements} unread announcement
            {dashboard.heroSummary.unreadAnnouncements === 1 ? "" : "s"}
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            {dashboard.heroChips.map((item) => (
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
        {dashboard.statCards.map((card, index) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={STAT_ICONS[card.title] || ClipboardList}
            color={card.color}
            trend={card.trend}
            subtitle={card.subtitle}
            delay={0.1 + index * 0.1}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="p-5 lg:col-span-3" delay={0.5}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>
            Weekly Learning Activity
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dashboard.chartActivity}>
              <defs>
                <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6d34" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ff6d34" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  fontSize: 12,
                  background: "var(--card)",
                  color: "var(--text)",
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#ff6d34" fill="url(#actGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 lg:col-span-2" delay={0.6}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>
            Skill Distribution
          </h3>
          {dashboard.skillDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={dashboard.skillDistribution}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={65}
                    innerRadius={35}
                    paddingAngle={3}
                  >
                    {dashboard.skillDistribution.map((_, index) => (
                      <Cell key={index} fill={CHART_C[index % CHART_C.length]} />
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
              <div className="space-y-1.5 mt-2">
                {dashboard.skillDistribution.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: CHART_C[index % CHART_C.length] }}
                      />
                      <span style={{ color: "var(--muted)" }}>{item.name}</span>
                    </div>
                    <span className="font-semibold" style={{ color: "var(--text)" }}>
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[190px] flex items-center justify-center text-sm" style={{ color: "var(--muted)" }}>
              Skill data is not available yet.
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5" delay={0.7}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>
            Recent Activity
          </h3>
          <div className="space-y-3">
            {dashboard.recentActivity.length > 0 ? (
              dashboard.recentActivity.map((item, index) => (
                <div
                  key={`${item.text}-${index}`}
                  className="flex items-center gap-3 py-2"
                  style={{
                    borderBottom:
                      index < dashboard.recentActivity.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <span className="text-base">{item.icon}</span>
                  <p className="text-sm flex-1" style={{ color: "var(--text)" }}>
                    {item.text}
                  </p>
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>
                    {item.time}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                No recent activity is available yet.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-5" delay={0.8}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>
            Pending Tasks
          </h3>
          <div className="space-y-1">
            {dashboard.pendingTasks.length > 0 ? (
              dashboard.pendingTasks.map((task, index) => (
                <div
                  key={`${task.title}-${index}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition"
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = document.documentElement.classList.contains("dark")
                      ? "rgba(255,255,255,0.04)"
                      : "#f9fafb";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "transparent";
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      background:
                        task.priority === "High"
                          ? "#ff6d34"
                          : task.priority === "Medium"
                            ? "#f59e0b"
                            : "#d1d5db",
                    }}
                  />
                  <p className="text-sm flex-1" style={{ color: "var(--text)" }}>
                    {task.title}
                  </p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background:
                        task.due === "In Progress" || task.due === "Pending"
                          ? "rgba(255,109,52,0.15)"
                          : "rgba(148,163,184,0.15)",
                      color:
                        task.due === "In Progress" || task.due === "Pending"
                          ? "#ff6d34"
                          : "var(--muted)",
                    }}
                  >
                    {task.due}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                You have no pending tasks right now.
              </p>
            )}
          </div>
        </Card>
      </div>

      {onNavigate && (
        <button
          onClick={() => onNavigate("qa")}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:scale-110 transition-transform duration-300 z-50 group"
          style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
          title="Q&A Forum"
        >
          <MessageSquare className="text-white w-6 h-6" />
          <span
            className="absolute right-full mr-4 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none"
          >
            Q&A Forum
          </span>
        </button>
      )}
    </div>
  );
};

export default Dashboard;
