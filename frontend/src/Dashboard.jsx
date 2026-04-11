import { useState, useEffect, useCallback } from "react";

const API = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

const PRIORITY_META = {
  HIGH: {
    label: "High",
    dot: "bg-orange-400",
    badge: "text-orange-500 bg-orange-50 border border-orange-300",
    chart: "#f59e0b",
  },
  CRITICAL: {
    label: "Critical",
    dot: "bg-red-400",
    badge: "text-red-500 bg-red-50 border border-red-300",
    chart: "#ef4444",
  },
  LOW: {
    label: "Low",
    dot: "bg-green-400",
    badge: "text-green-600 bg-green-50 border border-green-300",
    chart: "#22c55e",
  },
  MEDIUM: {
    label: "Medium",
    dot: "bg-yellow-400",
    badge: "text-yellow-600 bg-yellow-50 border border-yellow-300",
    chart: "#eab308",
  },
};

const STATUS_META = {
  OPEN: {
    label: "Open",
    badge: "text-red-500 bg-white border border-red-400",
    chart: "#ef4444",
  },
  IN_PROGRESS: {
    label: "In Progress",
    badge: "text-yellow-600 bg-white border border-yellow-400",
    chart: "#f59e0b",
  },
  CLOSED: {
    label: "Closed",
    badge: "text-green-600 bg-white border border-green-400",
    chart: "#22c55e",
  },
};

const NEXT_STATUS = { OPEN: "IN_PROGRESS", IN_PROGRESS: "CLOSED", CLOSED: null };
const STATUS_ORDER = ["OPEN", "IN_PROGRESS", "CLOSED"];
const PRIORITY_ORDER = ["HIGH", "CRITICAL", "MEDIUM", "LOW"];

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

function HeadsetIcon({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
      <path d="M4 12a8 8 0 0 1 16 0" strokeLinecap="round" />
      <path d="M5 12v4a2 2 0 0 0 2 2h1v-6H7a2 2 0 0 0-2 2Z" />
      <path d="M19 12v4a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" />
      <path d="M9 19h6" strokeLinecap="round" />
    </svg>
  );
}

function TicketIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
      <path d="M4 8a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-3a2 2 0 0 0 0-4V8Z" />
      <path d="M12 6v12" strokeDasharray="2 2" />
    </svg>
  );
}

function ChartIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
      <path d="M4 20h16" strokeLinecap="round" />
      <path d="M7 17V8" strokeLinecap="round" />
      <path d="M12 17V4" strokeLinecap="round" />
      <path d="M17 17v-6" strokeLinecap="round" />
    </svg>
  );
}

function AlertIcon({ className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ClockIcon({ className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12.5 2.3 2.3 4.7-5.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({ label, value, bg, color, icon }) {
  return (
    <div className="bg-white rounded-[28px] border border-gray-200 shadow-sm px-6 py-7 flex items-center gap-5">
      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${bg}`}>
        <span className={color}>{icon}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-4xl font-bold tracking-tight text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="bg-white rounded-[30px] border border-gray-200 shadow-sm p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function EmptyChartState({ message }) {
  return (
    <div className="h-72 rounded-[28px] border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center px-6 text-center text-sm text-gray-400">
      {message}
    </div>
  );
}

function DonutChart({ segments, total, centerValue, centerLabel, size = 250, thickness = 36 }) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={thickness}
          />
          {total > 0 && segments.filter((segment) => segment.value > 0).map((segment) => {
            const dashLength = (segment.value / total) * circumference;
            const circle = (
              <circle
                key={segment.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={thickness}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={-currentOffset}
              />
            );
            currentOffset += dashLength;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold tracking-tight text-gray-900">{centerValue}</span>
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-400">{centerLabel}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-center gap-2 text-sm text-gray-500">
            <span className="h-3.5 w-3.5 rounded-sm" style={{ backgroundColor: segment.color }} />
            <span className="font-medium text-gray-500">{segment.label}</span>
            <span className="font-semibold text-gray-900">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VerticalBarChart({ bars }) {
  const maxValue = Math.max(4, ...bars.map((bar) => bar.value), 1);
  const axisLabels = Array.from({ length: maxValue + 1 }, (_, index) => maxValue - index);

  return (
    <div className="flex h-80 gap-4">
      <div className="hidden sm:flex h-[17.5rem] flex-col justify-between pb-10 text-sm font-medium text-gray-400">
        {axisLabels.map((label) => <span key={label}>{label}</span>)}
      </div>
      <div className="relative flex-1 h-[17.5rem]">
        {Array.from({ length: maxValue + 1 }, (_, index) => (
          <div
            key={index}
            className={`absolute left-0 right-0 ${index === 0 ? "border-t border-gray-300" : "border-t border-dashed border-gray-200"}`}
            style={{ bottom: `${(index / maxValue) * 100}%` }}
          />
        ))}
        <div className="absolute inset-0 flex items-end justify-around gap-4 pt-4">
          {bars.map((bar) => {
            const rawHeight = `${(bar.value / maxValue) * 100}%`;
            const minHeight = bar.value > 0 ? "12%" : "0%";
            return (
              <div key={bar.key} className="flex h-full w-full max-w-[160px] flex-1 flex-col items-center justify-end gap-4">
                <div className="relative flex h-full w-full items-end justify-center">
                  <span className="absolute -top-10 rounded-full border border-gray-100 bg-white px-3 py-1 text-xs font-semibold text-gray-500 shadow-sm">
                    {bar.value}
                  </span>
                  <div
                    className="w-full rounded-t-[22px] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                    style={{ height: `max(${rawHeight}, ${minHeight})`, backgroundColor: bar.color }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-500">{bar.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HorizontalBarChart({ bars }) {
  const maxValue = Math.max(4, ...bars.map((bar) => bar.value), 1);

  return (
    <div className="space-y-5 pt-2">
      {bars.map((bar) => (
        <div key={bar.key} className="grid grid-cols-[100px_minmax(0,1fr)_32px] sm:grid-cols-[140px_minmax(0,1fr)_40px] items-center gap-4">
          <div className="text-right text-sm font-medium leading-tight text-gray-500">{bar.label}</div>
          <div className="relative h-16 overflow-hidden rounded-2xl bg-gray-100">
            <div
              className="absolute inset-y-0 left-0 rounded-2xl"
              style={{
                width: `${Math.max((bar.value / maxValue) * 100, bar.value > 0 ? 18 : 0)}%`,
                background: "linear-gradient(90deg, #f97316 0%, #fb923c 100%)",
              }}
            />
          </div>
          <div className="text-sm font-semibold text-gray-900">{bar.value}</div>
        </div>
      ))}
    </div>
  );
}

function ResolutionRing({ value, size = 250, thickness = 24 }) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeValue = Math.max(0, Math.min(100, value));
  const dashLength = (safeValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#dcfce7"
            strokeWidth={thickness}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#22c55e"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold tracking-tight text-gray-900">{safeValue}%</span>
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-400">Resolved</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("tickets");
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, closed: 0 });
  const [apiError, setApiError] = useState("");
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("");
  const [priorityF, setPriorityF] = useState("");
  const [userName, setUserName] = useState("");
  const [userErr, setUserErr] = useState("");
  const [ticketUserId, setTicketUserId] = useState("");
  const [ticketIssue, setTicketIssue] = useState("");
  const [ticketPriority, setTicketPriority] = useState("MEDIUM");
  const [ticketErr, setTicketErr] = useState("");
  const [updating, setUpdating] = useState(null);

  const recompute = useCallback((ticketList) => {
    setStats({
      total: ticketList.length,
      open: ticketList.filter((ticket) => ticket.status === "OPEN").length,
      inProgress: ticketList.filter((ticket) => ticket.status === "IN_PROGRESS").length,
      closed: ticketList.filter((ticket) => ticket.status === "CLOSED").length,
    });
  }, []);

  useEffect(() => {
    Promise.all([apiFetch("/tickets"), apiFetch("/users"), apiFetch("/tickets/stats")])
      .then(([ticketList, userList, statsPayload]) => {
        setTickets(ticketList);
        setUsers(userList);
        setStats(statsPayload);
      })
      .catch((error) => {
        setApiError(`Backend not reachable (${error.message}). Showing demo data.`);
        setUsers([
          { userId: 1, name: "Alice Johnson" },
          { userId: 2, name: "Bob Smith" },
          { userId: 3, name: "Sophia Chen" },
          { userId: 4, name: "Marcus Rivera" },
          { userId: 5, name: "Priya Nair" },
          { userId: 6, name: "Emma Wilson" },
        ]);
        setTickets([
          { ticketId: "T-001", userId: 1, userName: "Alice Johnson", issueDescription: "Cannot login to the system", priority: "HIGH", status: "OPEN", createdAt: new Date().toISOString() },
          { ticketId: "T-002", userId: 2, userName: "Bob Smith", issueDescription: "Payment failed on checkout", priority: "CRITICAL", status: "IN_PROGRESS", createdAt: new Date().toISOString() },
          { ticketId: "T-003", userId: 1, userName: "Alice Johnson", issueDescription: "Profile picture not uploading", priority: "LOW", status: "CLOSED", createdAt: new Date().toISOString() },
          { ticketId: "T-005", userId: 3, userName: "Sophia Chen", issueDescription: "Billing page shows duplicate tax line on renewal", priority: "MEDIUM", status: "OPEN", createdAt: new Date().toISOString() },
          { ticketId: "T-006", userId: 4, userName: "Marcus Rivera", issueDescription: "Two-factor code not accepted after device change", priority: "HIGH", status: "CLOSED", createdAt: new Date().toISOString() },
          { ticketId: "T-007", userId: 5, userName: "Priya Nair", issueDescription: "Need a copy of the closed chat transcript", priority: "LOW", status: "OPEN", createdAt: new Date().toISOString() },
          { ticketId: "T-008", userId: 6, userName: "Emma Wilson", issueDescription: "CSV export stops after fifty rows", priority: "MEDIUM", status: "IN_PROGRESS", createdAt: new Date().toISOString() },
          { ticketId: "T-009", userId: 3, userName: "Sophia Chen", issueDescription: "Customer portal is down for EU region users", priority: "CRITICAL", status: "OPEN", createdAt: new Date().toISOString() },
          { ticketId: "T-010", userId: 5, userName: "Priya Nair", issueDescription: "SSO login loops back to the sign-in page", priority: "HIGH", status: "CLOSED", createdAt: new Date().toISOString() },
          { ticketId: "T-011", userId: 4, userName: "Marcus Rivera", issueDescription: "Push notifications arrive late on the Android app", priority: "MEDIUM", status: "IN_PROGRESS", createdAt: new Date().toISOString() },
          { ticketId: "T-012", userId: 6, userName: "Emma Wilson", issueDescription: "Avatar upload crops profile pictures incorrectly", priority: "LOW", status: "CLOSED", createdAt: new Date().toISOString() },
        ]);
        setStats({ total: 10, open: 4, inProgress: 3, closed: 3 });
      });
  }, []);

  const addUser = async () => {
    if (!userName.trim()) {
      setUserErr("Name is required.");
      return;
    }
    try {
      const user = await apiFetch("/users", { method: "POST", body: JSON.stringify({ name: userName.trim() }) });
      setUsers((prev) => [...prev, user]);
      setUserName("");
      setUserErr("");
    } catch (error) {
      setUserErr(error.message);
    }
  };

  const raiseTicket = async () => {
    if (!ticketUserId) {
      setTicketErr("Select a user.");
      return;
    }
    if (!ticketIssue.trim()) {
      setTicketErr("Describe the issue.");
      return;
    }
    try {
      const ticket = await apiFetch("/tickets", {
        method: "POST",
        body: JSON.stringify({
          userId: parseInt(ticketUserId, 10),
          issueDescription: ticketIssue.trim(),
          priority: ticketPriority,
        }),
      });
      setTickets((prev) => {
        const updated = [ticket, ...prev];
        recompute(updated);
        return updated;
      });
      setTicketUserId("");
      setTicketIssue("");
      setTicketPriority("MEDIUM");
      setTicketErr("");
    } catch (error) {
      setTicketErr(error.message);
    }
  };

  const updateTicket = async (ticket) => {
    const next = NEXT_STATUS[ticket.status];
    if (!next) return;
    setUpdating(ticket.ticketId);
    try {
      const updatedTicket = await apiFetch(`/tickets/${ticket.ticketId}`, { method: "PUT", body: JSON.stringify({ status: next }) });
      setTickets((prev) => {
        const updated = prev.map((item) => item.ticketId === updatedTicket.ticketId ? updatedTicket : item);
        recompute(updated);
        return updated;
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = tickets.filter((ticket) => {
    const q = search.toLowerCase();
    return (
      (!q || ticket.ticketId.toLowerCase().includes(q) || ticket.userName.toLowerCase().includes(q) || ticket.issueDescription.toLowerCase().includes(q)) &&
      (!statusF || ticket.status === statusF) &&
      (!priorityF || ticket.priority === priorityF)
    );
  });

  const statusSegments = STATUS_ORDER.map((key) => ({
    key,
    label: STATUS_META[key].label,
    color: STATUS_META[key].chart,
    value: key === "OPEN" ? stats.open : key === "IN_PROGRESS" ? stats.inProgress : stats.closed,
  }));

  const priorityBars = PRIORITY_ORDER.map((key) => ({
    key,
    label: PRIORITY_META[key].label,
    color: PRIORITY_META[key].chart,
    value: tickets.filter((ticket) => ticket.priority === key).length,
  })).filter((bar) => bar.value > 0 || tickets.length === 0);

  const ticketsPerUser = users
    .map((user) => ({
      key: String(user.userId),
      label: user.name,
      value: tickets.filter((ticket) => ticket.userId === user.userId).length,
    }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));

  const resolutionRate = stats.total ? Math.round((stats.closed / stats.total) * 100) : 0;
  const tabMeta = {
    tickets: { label: "Tickets", icon: TicketIcon },
    analytics: { label: "Analytics", icon: ChartIcon },
  };

  const pBadge = (priority) => {
    const meta = PRIORITY_META[priority] || PRIORITY_META.MEDIUM;
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${meta.badge}`}>{meta.label}</span>;
  };

  const sBadge = (status) => {
    const meta = STATUS_META[status] || STATUS_META.OPEN;
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${meta.badge}`}>{meta.label}</span>;
  };

  const fmtDate = (iso) => (
    iso
      ? new Date(iso).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-"
  );

  const dot = PRIORITY_META[ticketPriority]?.dot || "bg-yellow-400";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[22px] bg-orange-500 text-white flex items-center justify-center shadow-sm">
            <HeadsetIcon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">HelpDesk</h1>
            <p className="text-sm text-gray-400">Ticket Management System</p>
          </div>
        </div>
        <nav className="flex bg-gray-100 rounded-full p-1 gap-1 self-start sm:self-auto">
          {Object.entries(tabMeta).map(([key, { label, icon: Icon }]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
        {apiError && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-4 py-2 rounded-xl">
            Warning: {apiError}
          </div>
        )}

        {activeTab === "tickets" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[["Total Tickets", stats.total, "bg-orange-50", "text-orange-500"], ["Open", stats.open, "bg-red-50", "text-red-500"], ["In Progress", stats.inProgress, "bg-yellow-50", "text-yellow-500"], ["Closed", stats.closed, "bg-green-50", "text-green-500"]].map(([label, value, bg, color]) => (
                <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg}`}>
                    <span className={`text-xl font-bold ${color}`}>✦</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{label}</p>
                    <p className="text-4xl font-bold text-gray-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Add User</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    value={userName}
                    onChange={(event) => setUserName(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && addUser()}
                    placeholder="Enter user name..."
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <button onClick={addUser} type="button" className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl">
                    Add User
                  </button>
                </div>
                {userErr && <p className="text-red-500 text-xs mt-2">{userErr}</p>}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Raise Ticket</h2>
                <div className="flex flex-col gap-3">
                  <select value={ticketUserId} onChange={(event) => setTicketUserId(event.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                    <option value="">Select user...</option>
                    {users.map((user) => <option key={user.userId} value={user.userId}>{user.name}</option>)}
                  </select>
                  <input
                    value={ticketIssue}
                    onChange={(event) => setTicketIssue(event.target.value)}
                    placeholder="Describe the issue..."
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <div className="relative">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${dot} pointer-events-none`} />
                    <select value={ticketPriority} onChange={(event) => setTicketPriority(event.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 appearance-none">
                      {Object.entries(PRIORITY_META).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
                    </select>
                  </div>
                  {ticketErr && <p className="text-red-500 text-xs">{ticketErr}</p>}
                  <button onClick={raiseTicket} type="button" className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl">
                    Raise Ticket
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900 mb-4">All Tickets</h2>
                <div className="flex gap-3 flex-wrap">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, ID, or issue..."
                    className="flex-1 min-w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <select value={statusF} onChange={(event) => setStatusF(event.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                    <option value="">All Statuses</option>
                    {Object.entries(STATUS_META).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
                  </select>
                  <select value={priorityF} onChange={(event) => setPriorityF(event.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                    <option value="">All Priorities</option>
                    {Object.entries(PRIORITY_META).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Ticket ID", "User Name", "Issue", "Priority", "Created", "Status", "Action"].map((heading) => (
                        <th key={heading} className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No tickets match your filters.</td>
                      </tr>
                    ) : filtered.map((ticket) => (
                      <tr key={ticket.ticketId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">{ticket.ticketId}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{ticket.userName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{ticket.issueDescription}</td>
                        <td className="px-6 py-4">{pBadge(ticket.priority)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{fmtDate(ticket.createdAt)}</td>
                        <td className="px-6 py-4">{sBadge(ticket.status)}</td>
                        <td className="px-6 py-4">
                          {NEXT_STATUS[ticket.status] ? (
                            <button
                              onClick={() => updateTicket(ticket)}
                              disabled={updating === ticket.ticketId}
                              className="text-sm font-bold text-gray-800 hover:text-orange-500 disabled:opacity-50"
                            >
                              {updating === ticket.ticketId ? "..." : "Update"}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard label="Total Tickets" value={stats.total} bg="bg-orange-50" color="text-orange-500" icon={<TicketIcon className="h-8 w-8" />} />
              <StatCard label="Open" value={stats.open} bg="bg-red-50" color="text-red-500" icon={<AlertIcon />} />
              <StatCard label="In Progress" value={stats.inProgress} bg="bg-yellow-50" color="text-yellow-500" icon={<ClockIcon />} />
              <StatCard label="Closed" value={stats.closed} bg="bg-green-50" color="text-green-500" icon={<CheckIcon />} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ChartCard title="Status Distribution" subtitle="See how tickets are moving through the support pipeline.">
                <DonutChart segments={statusSegments} total={stats.total} centerValue={stats.total} centerLabel="Tickets" />
              </ChartCard>

              <ChartCard title="Priority Breakdown" subtitle="Understand where urgency is concentrated right now.">
                {priorityBars.length > 0 ? (
                  <VerticalBarChart bars={priorityBars} />
                ) : (
                  <EmptyChartState message="Create a few tickets to see how priorities are distributed." />
                )}
              </ChartCard>

              <ChartCard title="Tickets per User" subtitle="Spot which customers are generating the most support volume.">
                {ticketsPerUser.length > 0 ? (
                  <HorizontalBarChart bars={ticketsPerUser} />
                ) : (
                  <EmptyChartState message="Add users and raise tickets to unlock per-user activity trends." />
                )}
              </ChartCard>

              <ChartCard title="Resolution Rate" subtitle={`${stats.closed} of ${stats.total} tickets are fully resolved.`}>
                <ResolutionRing value={resolutionRate} />
              </ChartCard>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
