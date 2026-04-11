// Dashboard.jsx — Nexus-Support HelpDesk Frontend
// Stack: React 18 + Tailwind CSS
// API Base: http://localhost:8080/api

import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const API = "http://localhost:8080/api";

const PRIORITY_META = {
  HIGH:     { label: "High",     dot: "bg-orange-400", badge: "text-orange-500 bg-orange-50  border border-orange-300" },
  CRITICAL: { label: "Critical", dot: "bg-red-400",    badge: "text-red-500    bg-red-50     border border-red-300"    },
  LOW:      { label: "Low",      dot: "bg-green-400",  badge: "text-green-600  bg-green-50   border border-green-300"  },
  MEDIUM:   { label: "Medium",   dot: "bg-yellow-400", badge: "text-yellow-600 bg-yellow-50  border border-yellow-300" },
};

const STATUS_META = {
  OPEN:        { label: "Open",        badge: "text-red-500    bg-white border border-red-400"    },
  IN_PROGRESS: { label: "In Progress", badge: "text-yellow-600 bg-white border border-yellow-400" },
  CLOSED:      { label: "Closed",      badge: "text-green-600  bg-white border border-green-400"  },
};

// ─────────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// SVG Icons
// ─────────────────────────────────────────────────────────────
const IconTicket = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <path d="M13 5v2M13 17v2M13 11v2"/>
  </svg>
);
const IconAlert = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconClock = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconCheck = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconSearch = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconFilter = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const IconUser = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    <line x1="12" y1="11" x2="12" y2="13"/><line x1="10" y1="13" x2="14" y2="13"/>
  </svg>
);
const IconBarChart = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconChevron = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function Header({ activeTab, setActiveTab }) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-orange-500 rounded-full flex items-center justify-center overflow-hidden">
            <div className="w-8 h-8 bg-orange-300 rounded-full -translate-y-2" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-none">HelpDesk</h1>
            <p className="text-xs text-gray-400 mt-0.5">Ticket Management System</p>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav className="flex bg-gray-100 rounded-full p-1 gap-1">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === "tickets"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <IconTicket className="w-4 h-4" />
            Tickets
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === "analytics"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <IconBarChart className="w-4 h-4" />
            Analytics
          </button>
        </nav>
      </div>
    </header>
  );
}

function StatCard({ icon, label, value, iconBg }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-4xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function MetricsGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        icon={<IconTicket className="w-7 h-7 text-orange-500" />}
        label="Total Tickets"
        value={stats.total}
        iconBg="bg-orange-50"
      />
      <StatCard
        icon={<IconAlert className="w-7 h-7 text-red-500" />}
        label="Open"
        value={stats.open}
        iconBg="bg-red-50"
      />
      <StatCard
        icon={<IconClock className="w-7 h-7 text-yellow-500" />}
        label="In Progress"
        value={stats.inProgress}
        iconBg="bg-yellow-50"
      />
      <StatCard
        icon={<IconCheck className="w-7 h-7 text-green-500" />}
        label="Closed"
        value={stats.closed}
        iconBg="bg-green-50"
      />
    </div>
  );
}

function AddUserForm({ onUserAdded }) {
  const [name, setName]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setError("Name is required."); return; }
    setLoading(true);
    setError("");
    try {
      const user = await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
      });
      onUserAdded(user);
      setName("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <h2 className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-5">
        <IconUser className="w-5 h-5 text-orange-500" />
        Add User
      </h2>
      <div className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Enter user name..."
          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
        >
          {loading ? "Adding…" : "Add User"}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}

function RaiseTicketForm({ users, onTicketRaised }) {
  const [userId,   setUserId]   = useState("");
  const [issue,    setIssue]    = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async () => {
    if (!userId)        { setError("Please select a user.");        return; }
    if (!issue.trim())  { setError("Please describe the issue.");   return; }
    setLoading(true);
    setError("");
    try {
      const ticket = await apiFetch("/tickets", {
        method: "POST",
        body: JSON.stringify({
          userId:           parseInt(userId, 10),
          issueDescription: issue.trim(),
          priority,
        }),
      });
      onTicketRaised(ticket);
      setUserId("");
      setIssue("");
      setPriority("MEDIUM");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const dot = PRIORITY_META[priority]?.dot ?? "bg-gray-400";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <h2 className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-5">
        <IconTicket className="w-5 h-5 text-orange-500" />
        Raise Ticket
      </h2>

      <div className="flex flex-col gap-3">
        {/* User dropdown */}
        <div className="relative">
          <select
            value={userId}
            onChange={(e) => { setUserId(e.target.value); setError(""); }}
            className="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
          >
            <option value="">Select user…</option>
            {users.map((u) => (
              <option key={u.userId} value={u.userId}>{u.name}</option>
            ))}
          </select>
          <IconChevron className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Issue input */}
        <input
          type="text"
          value={issue}
          onChange={(e) => { setIssue(e.target.value); setError(""); }}
          placeholder="Describe the issue…"
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
        />

        {/* Priority dropdown */}
        <div className="relative">
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${dot} pointer-events-none`} />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full appearance-none pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
          >
            {Object.entries(PRIORITY_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <IconChevron className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold rounded-xl transition-colors mt-1"
        >
          {loading ? "Raising…" : "Raise Ticket"}
        </button>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const meta = PRIORITY_META[priority] ?? { label: priority, badge: "text-gray-500 bg-gray-100" };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${meta.badge}`}>
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? { label: status, badge: "text-gray-500 border border-gray-300" };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${meta.badge}`}>
      {meta.label}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// Next legal status for the state machine
const NEXT_STATUS = {
  OPEN:        "IN_PROGRESS",
  IN_PROGRESS: "CLOSED",
  CLOSED:      null,
};

function TicketTable({ tickets, onTicketUpdated }) {
  const [search,   setSearch]   = useState("");
  const [statusF,  setStatusF]  = useState("");
  const [priorityF, setPriorityF] = useState("");
  const [updating, setUpdating] = useState(null);

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.ticketId.toLowerCase().includes(q) ||
      t.userName.toLowerCase().includes(q) ||
      t.issueDescription.toLowerCase().includes(q);
    const matchStatus   = !statusF   || t.status   === statusF;
    const matchPriority = !priorityF || t.priority === priorityF;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleUpdate = async (ticket) => {
    const nextStatus = NEXT_STATUS[ticket.status];
    if (!nextStatus) return;
    setUpdating(ticket.ticketId);
    try {
      const updated = await apiFetch(`/tickets/${ticket.ticketId}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });
      onTicketUpdated(updated);
    } catch (e) {
      alert("Update failed: " + e.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Table header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-900 mb-4">All Tickets</h2>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <IconSearch className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, or issue…"
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <IconFilter className="w-4 h-4 text-gray-400" />
            <div className="relative">
              <select
                value={statusF}
                onChange={(e) => setStatusF(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
              >
                <option value="">All Statuses</option>
                {Object.entries(STATUS_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <IconChevron className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Priority filter */}
          <div className="relative">
            <select
              value={priorityF}
              onChange={(e) => setPriorityF(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
            >
              <option value="">All Priorities</option>
              {Object.entries(PRIORITY_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <IconChevron className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {["Ticket ID", "User Name", "Issue", "Priority", "Created", "Status", "Action"].map((h) => (
                <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                  No tickets match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.ticketId} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800 whitespace-nowrap">
                    {t.ticketId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {t.userName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {t.issueDescription}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(t.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {NEXT_STATUS[t.status] ? (
                      <button
                        onClick={() => handleUpdate(t)}
                        disabled={updating === t.ticketId}
                        className="text-sm font-bold text-gray-800 hover:text-orange-500 transition-colors disabled:opacity-50"
                      >
                        {updating === t.ticketId ? "…" : "Update"}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300 font-medium">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsTab({ tickets, stats }) {
  const priorityCounts = Object.keys(PRIORITY_META).reduce((acc, p) => {
    acc[p] = tickets.filter((t) => t.priority === p).length;
    return acc;
  }, {});
  const maxCount = Math.max(...Object.values(priorityCounts), 1);

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Priority breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-700 mb-5">Tickets by Priority</h3>
        <div className="flex flex-col gap-4">
          {Object.entries(PRIORITY_META).map(([k, v]) => (
            <div key={k} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-16 text-right">{v.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${v.dot}`}
                  style={{ width: `${(priorityCounts[k] / maxCount) * 100}%`, minWidth: priorityCounts[k] ? "12px" : 0 }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700 w-4">{priorityCounts[k]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status donut (CSS-only) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
        <h3 className="text-sm font-bold text-gray-700 mb-5 self-start">Status Distribution</h3>
        <div className="flex gap-8 mt-2">
          {Object.entries(STATUS_META).map(([k, v]) => {
            const count = tickets.filter((t) => t.status === k).length;
            const pct   = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            return (
              <div key={k} className="flex flex-col items-center gap-1">
                <div className="text-3xl font-bold text-gray-900">{pct}%</div>
                <StatusBadge status={k} />
                <div className="text-xs text-gray-400">{count} tickets</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Recent Activity</h3>
        <div className="flex flex-col gap-3">
          {tickets.slice(0, 5).map((t) => (
            <div key={t.ticketId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold text-orange-500">{t.ticketId}</span>
                <span className="text-sm text-gray-700 truncate max-w-xs">{t.issueDescription}</span>
              </div>
              <div className="flex items-center gap-3">
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No ticket data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Root App
// ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("tickets");
  const [tickets,   setTickets]   = useState([]);
  const [users,     setUsers]     = useState([]);
  const [stats,     setStats]     = useState({ total: 0, open: 0, inProgress: 0, closed: 0 });
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [apiError,  setApiError]  = useState("");

  // ── Data fetching ──────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [ticketData, userData, statsData] = await Promise.all([
        apiFetch("/tickets"),
        apiFetch("/users"),
        apiFetch("/tickets/stats"),
      ]);
      setTickets(ticketData);
      setUsers(userData);
      setStats(statsData);
      setApiError("");
    } catch (e) {
      setApiError("Could not reach the API. Showing demo data.");
      // ── Demo seed (mirrors the screenshot) ──
      setUsers([
        { userId: 1, name: "Alice Johnson" },
        { userId: 2, name: "Bob Smith" },
      ]);
      setTickets([
        { ticketId: "T-001", userId: 1, userName: "Alice Johnson", issueDescription: "Cannot login to the system",    priority: "HIGH",     status: "OPEN",        createdAt: new Date().toISOString() },
        { ticketId: "T-002", userId: 2, userName: "Bob Smith",     issueDescription: "Payment failed on checkout",   priority: "CRITICAL", status: "IN_PROGRESS", createdAt: new Date().toISOString() },
        { ticketId: "T-003", userId: 1, userName: "Alice Johnson", issueDescription: "Profile picture not uploading", priority: "LOW",     status: "CLOSED",      createdAt: new Date().toISOString() },
      ]);
      setStats({ total: 3, open: 1, inProgress: 1, closed: 1 });
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived stats update ───────────────────────────────────
  const recomputeStats = useCallback((updatedTickets) => {
    const total      = updatedTickets.length;
    const open       = updatedTickets.filter((t) => t.status === "OPEN").length;
    const inProgress = updatedTickets.filter((t) => t.status === "IN_PROGRESS").length;
    const closed     = updatedTickets.filter ((t) => t.status === "CLOSED").length;
    setStats({ total, open, inProgress, closed });
  }, []);

  // ── Handlers ──────────────────────────────────────────────
  const handleUserAdded = useCallback((user) => {
    setUsers((prev) => [...prev, user]);
  }, []);

  const handleTicketRaised = useCallback((ticket) => {
    setTickets((prev) => {
      const updated = [ticket, ...prev];
      recomputeStats(updated);
      return updated;
    });
  }, [recomputeStats]);

  const handleTicketUpdated = useCallback((updatedTicket) => {
    setTickets((prev) => {
      const updated = prev.map((t) =>
        t.ticketId === updatedTicket.ticketId ? updatedTicket : t
      );
      recomputeStats(updated);
      return updated;
    });
  }, [recomputeStats]);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-8 py-8 flex flex-col gap-6">
        {/* API warning banner */}
        {apiError && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-4 py-2.5 rounded-xl">
            ⚠ {apiError}
          </div>
        )}

        {activeTab === "tickets" ? (
          <>
            {/* Metrics */}
            {loadingTickets ? (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-24 animate-pulse" />
                ))}
              </div>
            ) : (
              <MetricsGrid stats={stats} />
            )}

            {/* Action modules */}
            <div className="grid grid-cols-2 gap-4">
              <AddUserForm  onUserAdded={handleUserAdded} />
              <RaiseTicketForm users={users} onTicketRaised={handleTicketRaised} />
            </div>

            {/* Data table */}
            <TicketTable tickets={tickets} onTicketUpdated={handleTicketUpdated} />
          </>
        ) : (
          <AnalyticsTab tickets={tickets} stats={stats} />
        )}
      </main>
    </div>
  );
}
