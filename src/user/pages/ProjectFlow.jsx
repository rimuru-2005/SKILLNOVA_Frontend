import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  PlayCircle,
  Settings,
  BarChart2,
  Activity,
  PieChart as PieIcon,
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
  CartesianGrid,
} from "recharts";
import { Card } from "../../shared/components/UI";
import { getReports } from "../../services/apiClient";

const MotionDiv = motion.div;
const CHART_COLORS = ["#00bea3", "#ff6d34", "#f59e0b", "#3b82f6"];

const iconMap = {
  Settings,
  CheckCircle,
  PlayCircle,
  Activity,
  Clock,
};

const ProjectFlow = () => {
  const [milestones, setMilestones] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      const data = await getReports();

      setMilestones(Array.isArray(data?.milestones) ? data.milestones : []);
      setAnalytics(Array.isArray(data?.analytics) ? data.analytics : []);
      setDistribution(Array.isArray(data?.distribution) ? data.distribution : []);
      setError("");
    } catch (loadError) {
      console.error("Failed to fetch project flow:", loadError);
      setMilestones([]);
      setAnalytics([]);
      setDistribution([]);
      setError("Failed to load project flow data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
          <Loader2 size={16} className="animate-spin" />
          Loading project data...
        </div>
      </Card>
    );
  }

  if (error && !milestones.length && !analytics.length && !distribution.length) {
    return (
      <Card className="p-6 space-y-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
        >
          Retry
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <MotionDiv
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-xl overflow-hidden shadow-lg p-6 sm:p-8"
        style={{ background: "linear-gradient(135deg, #1a1f20 0%, #2D3436 100%)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, #00bea3, #3b82f6)" }} />
        <h1 className="text-2xl sm:text-3xl font-bold text-white">SkillNova Platform</h1>
        <p className="mt-2 text-sm sm:text-base" style={{ color: "#9ca3af" }}>
          Current Project Phase: <span style={{ color: "#00bea3", fontWeight: 600 }}>Dynamic Overview</span>
        </p>
      </MotionDiv>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: "var(--text)" }}>
            <Activity className="w-5 h-5 text-blue-500" />
            Project Flow
          </h3>
          <div className="space-y-4">
            {milestones.length > 0 ? (
              milestones.map((milestone, index) => {
                const Icon = iconMap[milestone.icon] || Activity;
                const isCompleted = milestone.status === "completed";
                const isInProgress = milestone.status === "in-progress";

                return (
                  <div key={milestone.id ?? `${milestone.title}-${index}`} className="relative flex items-start gap-4">
                    {index !== milestones.length - 1 && (
                      <div
                        className="absolute left-[19px] top-8 bottom-[-16px] w-[2px]"
                        style={{ background: isCompleted ? "#00bea3" : "var(--border)" }}
                      />
                    )}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10"
                      style={{
                        background: isCompleted
                          ? "rgba(0,190,163,0.15)"
                          : isInProgress
                            ? "rgba(255,109,52,0.15)"
                            : "var(--card-hover)",
                        border: `1px solid ${isCompleted ? "#00bea3" : isInProgress ? "#ff6d34" : "var(--border)"}`,
                      }}
                    >
                      <Icon size={20} color={isCompleted ? "#00bea3" : isInProgress ? "#ff6d34" : "var(--muted)"} />
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                        {milestone.title}
                      </h4>
                      <span
                        className="text-xs uppercase tracking-wider font-bold mt-1 inline-block"
                        style={{ color: isCompleted ? "#00bea3" : isInProgress ? "#ff6d34" : "var(--muted)" }}
                      >
                        {String(milestone.status || "not-started").replace("-", " ")}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                No project milestones are available yet.
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}>
              <BarChart2 className="w-5 h-5 text-orange-500" />
              Progress Overview
            </h3>
            {analytics.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={analytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00bea3" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00bea3" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="progress" stroke="#00bea3" fillOpacity={1} fill="url(#colorProgress)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                No analytics overview is available yet.
              </p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}>
              <PieIcon className="w-5 h-5 text-purple-500" />
              Task Distribution
            </h3>
            {distribution.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width={150} height={150}>
                  <PieChart>
                    <Pie data={distribution} innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                      {distribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3 w-full">
                  {distribution.map((item, index) => (
                    <div key={item.name ?? index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[index % CHART_COLORS.length] }} />
                        <span style={{ color: "var(--muted)" }}>{item.name}</span>
                      </div>
                      <span className="font-semibold" style={{ color: "var(--text)" }}>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                No task distribution data is available yet.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectFlow;
