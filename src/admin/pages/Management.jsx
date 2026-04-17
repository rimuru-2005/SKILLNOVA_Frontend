import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, ClipboardList } from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import { request } from "../../services/api";
const Management = () => {
  const [interns, setInterns] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch interns from API with auth
  const fetchInterns = async () => {
    setLoading(true);
    try {
      // API Call
      const response = await request("/interns");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data); // Debug log

      // Handle both response formats
      if (data.success && Array.isArray(data.data)) {
        setInterns(data.data);
      } else if (Array.isArray(data)) {
        setInterns(data);
      } else {
        console.error("Unexpected data format:", data);
        setInterns([]);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching interns:", err);
      setError("Failed to load interns");
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (id) => {
    try {
      // API Call
      const response = await request(`/interns/${id}/attendance`, {
        method: "PATCH",
      });
      const updatedIntern = await response.json();
      setInterns((prev) => prev.map((i) => (i.id === id ? updatedIntern : i)));
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  const toggleStatus = async (id) => {
    try {
      // API CALL
      const response = await request(`/interns/${id}/status`, {
        method: "PATCH",
      });
      const updatedIntern = await response.json();
      setInterns((prev) => prev.map((i) => (i.id === id ? updatedIntern : i)));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  // ... rest of your component remains the same (the JSX)

  const filtered = interns.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.department.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return <div className="p-8 text-center">Loading interns...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Intern Management"
        subtitle="Manage intern attendance, tasks, status and ratings"
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 text-blue-700 rounded-xl p-4">
          <p className="text-2xl font-bold">{interns.length}</p>
          <p className="text-xs font-medium mt-0.5 opacity-70">Total Interns</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 rounded-xl p-4">
          <p className="text-2xl font-bold">
            {interns.filter((i) => i.attendance === "Present").length}
          </p>
          <p className="text-xs font-medium mt-0.5 opacity-70">Present Today</p>
        </div>
        <div className="bg-red-50 text-red-700 rounded-xl p-4">
          <p className="text-2xl font-bold">
            {interns.filter((i) => i.attendance === "Absent").length}
          </p>
          <p className="text-xs font-medium mt-0.5 opacity-70">Absent Today</p>
        </div>
        <div className="bg-violet-50 text-violet-700 rounded-xl p-4">
          <p className="text-2xl font-bold">
            {interns.filter((i) => i.status === "Active").length}
          </p>
          <p className="text-xs font-medium mt-0.5 opacity-70">Active Status</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search interns by name or department…"
          className="w-full pl-9 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="sn-table-scroll">
        <table className="w-full text-sm min-w-[52rem]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {["Name", "Department", "Attendance", "Current Task", "Rating", "Status", "Actions"].map(h => (
                <th
                  key={h}
                  className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${h === "Actions" ? "text-center" : "text-left"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(intern => (
              <tr key={intern.id} className="hover:bg-slate-50 transition">

                {/* Name */}
                <td className="px-5 py-4 font-medium text-slate-900 whitespace-nowrap">
                  {intern.name}
                </td>

                {/* Department */}
                <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                  {intern.department}
                </td>

                {/* Attendance */}
                <td className="px-5 py-4">
                  <Badge variant={intern.attendance === "Present" ? "success" : "danger"}>
                    {intern.attendance}
                  </Badge>
                </td>

                {/* Task */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-slate-600 whitespace-nowrap">
                    <ClipboardList size={13} className="flex-shrink-0 text-slate-400" />
                    {intern.task}
                  </div>
                </td>

                {/* Rating */}
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    ⭐ {intern.rating} / 10
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <Badge variant={intern.status === "Active" ? "purple" : "gray"}>
                    {intern.status}
                  </Badge>
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => toggleAttendance(intern.id)}
                      title="Toggle Attendance"
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    >
                      <CheckCircle size={15} />
                    </button>
                    <button
                      onClick={() => toggleStatus(intern.id)}
                      title="Toggle Active Status"
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <XCircle size={15} />
                    </button>
                  </div>
                </td>

              </tr>
            ))}

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