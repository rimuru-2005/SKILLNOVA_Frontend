import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import {
  getInterns,
  updateInternAttendance,
  updateInternStatus,
} from "../../services/apiClient";

const getInternList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.interns)) return payload.interns;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const normalizeIntern = (item) => {
  if (!item || typeof item !== "object") return null;

  const rating = Number.parseFloat(item.rating ?? item.score);

  return {
    ...item,
    id: item.id ?? item._id ?? item.email ?? item.name ?? `intern-${Date.now()}`,
    name: item.name || item.fullName || "Unknown intern",
    department: item.department || item.dept || "General",
    attendance:
      String(item.attendance || "").trim().toLowerCase() === "absent"
        ? "Absent"
        : "Present",
    task: item.task || item.currentTask || item.assignment || "No active task",
    status:
      String(item.status || "").trim().toLowerCase() === "inactive"
        ? "Inactive"
        : "Active",
    rating: Number.isNaN(rating) ? 0 : Number(rating.toFixed(1)),
  };
};

const Management = () => {
  const [interns, setInterns] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionState, setActionState] = useState({ id: null, type: "" });

  const fetchInterns = async () => {
    setLoading(true);

    try {
      const response = await getInterns();
      setInterns(getInternList(response).map(normalizeIntern).filter(Boolean));
      setError("");
    } catch (loadError) {
      console.error("Error fetching interns:", loadError);
      setInterns([]);
      setError("Failed to load interns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  const toggleAttendance = async (id) => {
    try {
      setActionState({ id, type: "attendance" });
      setError("");

      const updatedIntern = normalizeIntern(await updateInternAttendance(id));
      setInterns((currentInterns) =>
        currentInterns.map((intern) =>
          intern.id === id
            ? updatedIntern || {
                ...intern,
                attendance: intern.attendance === "Present" ? "Absent" : "Present",
              }
            : intern,
        ),
      );
    } catch (updateError) {
      console.error("Error updating attendance:", updateError);
      setError("Failed to update attendance.");
    } finally {
      setActionState({ id: null, type: "" });
    }
  };

  const toggleStatus = async (id) => {
    try {
      setActionState({ id, type: "status" });
      setError("");

      const updatedIntern = normalizeIntern(await updateInternStatus(id));
      setInterns((currentInterns) =>
        currentInterns.map((intern) =>
          intern.id === id
            ? updatedIntern || {
                ...intern,
                status: intern.status === "Active" ? "Inactive" : "Active",
              }
            : intern,
        ),
      );
    } catch (updateError) {
      console.error("Error updating status:", updateError);
      setError("Failed to update status.");
    } finally {
      setActionState({ id: null, type: "" });
    }
  };

  const filtered = interns.filter(
    (intern) =>
      intern.name.toLowerCase().includes(search.toLowerCase()) ||
      intern.department.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Intern Management"
          subtitle="Manage intern attendance, tasks, status and ratings"
        />
        <Card className="p-6">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Loading interns...
          </div>
        </Card>
      </div>
    );
  }

  if (!interns.length && error) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Intern Management"
          subtitle="Manage intern attendance, tasks, status and ratings"
        />
        <Card className="p-5 space-y-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={fetchInterns}
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
        title="Intern Management"
        subtitle="Manage intern attendance, tasks, status and ratings"
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 text-blue-700 rounded-xl p-4">
          <p className="text-2xl font-bold">{interns.length}</p>
          <p className="text-xs font-medium mt-0.5 opacity-70">Total Interns</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 rounded-xl p-4">
          <p className="text-2xl font-bold">
            {interns.filter((intern) => intern.attendance === "Present").length}
          </p>
          <p className="text-xs font-medium mt-0.5 opacity-70">Present Today</p>
        </div>
        <div className="bg-red-50 text-red-700 rounded-xl p-4">
          <p className="text-2xl font-bold">
            {interns.filter((intern) => intern.attendance === "Absent").length}
          </p>
          <p className="text-xs font-medium mt-0.5 opacity-70">Absent Today</p>
        </div>
        <div className="bg-violet-50 text-violet-700 rounded-xl p-4">
          <p className="text-2xl font-bold">
            {interns.filter((intern) => intern.status === "Active").length}
          </p>
          <p className="text-xs font-medium mt-0.5 opacity-70">Active Status</p>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search interns by name or department…"
          className="w-full pl-9 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
        />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="sn-table-scroll">
          <table className="w-full text-sm min-w-[52rem]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Name", "Department", "Attendance", "Current Task", "Rating", "Status", "Actions"].map((header) => (
                  <th
                    key={header}
                    className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${
                      header === "Actions" ? "text-center" : "text-left"
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((intern) => {
                const isBusy = actionState.id === intern.id;

                return (
                  <tr key={intern.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 font-medium text-slate-900 whitespace-nowrap">
                      {intern.name}
                    </td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                      {intern.department}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={intern.attendance === "Present" ? "success" : "danger"}>
                        {intern.attendance}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-slate-600 whitespace-nowrap">
                        <ClipboardList size={13} className="flex-shrink-0 text-slate-400" />
                        {intern.task}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                        ⭐ {intern.rating} / 10
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={intern.status === "Active" ? "purple" : "gray"}>
                        {intern.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleAttendance(intern.id)}
                          title="Toggle Attendance"
                          disabled={isBusy}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isBusy && actionState.type === "attendance" ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <CheckCircle size={15} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(intern.id)}
                          title="Toggle Active Status"
                          disabled={isBusy}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isBusy && actionState.type === "status" ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <XCircle size={15} />
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
                    No interns match your search.
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

export default Management;
