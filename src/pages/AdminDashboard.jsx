import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";
import {
  FiUsers, FiShield, FiDollarSign, FiTrendingUp, FiCheckCircle,
  FiTrash2, FiEye, FiMail, FiMessageSquare, FiFileText,
  FiThumbsUp, FiThumbsDown, FiClock, FiAlertCircle, FiExternalLink,
  FiStar, FiX, FiHome, FiBarChart2, FiSettings, FiLogOut,
  FiMenu, FiBell, FiSearch, FiChevronRight, FiActivity
} from "react-icons/fi";
import { getStoredUsers, getStoredProviders, saveStoredProviders } from "../utils/storage";

const NAV = [
  { id: "overview",     icon: <FiHome size={18} />,      label: "Dashboard" },
  { id: "users",        icon: <FiUsers size={18} />,     label: "Users" },
  { id: "providers",    icon: <FiShield size={18} />,    label: "Providers" },
  { id: "sessions",     icon: <FiClock size={18} />,     label: "Bookings" },
  { id: "messages",     icon: <FiMail size={18} />,      label: "Customer Req" },
  { id: "applications", icon: <FiFileText size={18} />,  label: "Applications" },
  { id: "reviews",      icon: <FiStar size={18} />,      label: "Reviews" },
  { id: "analytics",   icon: <FiBarChart2 size={18} />,  label: "Analytics" },
];

const PAGE_TITLES = {
  overview:     "Dashboard",
  users:        "Users Management",
  providers:    "Providers Management",
  sessions:     "Bookings",
  messages:     "Customer Messages",
  applications: "Provider Applications",
  reviews:      "Reviews",
  analytics:    "Analytics",
};

/* Simple bar chart using CSS */
function MiniBarChart({ data, maxVal }) {
  return (
    <div className="ad-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="ad-bar-wrap">
          <div className="ad-bar sessions" style={{ height: `${maxVal > 0 ? (d.sessions / maxVal) * 110 : 4}px` }} />
          <div className="ad-bar revenue" style={{ height: `${maxVal > 0 ? (d.revenue / (maxVal * 5 || 1)) * 50 : 4}px` }} />
          <span className="ad-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* Donut SVG chart */
function DonutChart({ slices }) {
  const r = 44, cx = 60, cy = 60, circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="ad-donut">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="16" />
        {slices.map((s, i) => {
          const dash = (s.pct / 100) * circumference;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={s.color} strokeWidth="16"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt" />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="ad-donut-center">{slices.length}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const users     = getStoredUsers();
  const providers = getStoredProviders();
  const bookings  = JSON.parse(localStorage.getItem("userBookings") || "[]");

  const [selectedTab,    setSelectedTab]    = useState("overview");
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [searchUser,     setSearchUser]     = useState("");
  const [searchProvider, setSearchProvider] = useState("");
  const [searchMsg,      setSearchMsg]      = useState("");
  const [messages,       setMessages]       = useState(() =>
    JSON.parse(localStorage.getItem("connectpro_contact_messages") || "[]")
  );
  const [applications,   setApplications]   = useState(() =>
    JSON.parse(localStorage.getItem("connectpro_provider_applications") || "[]")
  );
  const [reviews,        setReviews]        = useState(() =>
    JSON.parse(localStorage.getItem("connectpro_reviews") || "[]")
  );
  const [rejectTarget,   setRejectTarget]   = useState(null);
  const [rejectReason,   setRejectReason]   = useState("");
  const [viewDoc,        setViewDoc]        = useState(null);
  const [appFilter,      setAppFilter]      = useState("all");

  // ── Stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalRevenue = bookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
    const completed    = bookings.filter(b => new Date(`${b.date}T${b.time}`) < new Date()).length;
    const compRate     = bookings.length > 0 ? Math.round((completed / bookings.length) * 100) : 0;
    const allRatings   = reviews.map(r => r.rating).filter(Boolean);
    const avgRating    = allRatings.length > 0 ? (allRatings.reduce((a,b) => a+b,0) / allRatings.length).toFixed(1) : "—";
    return {
      users:     users.length,
      providers: providers.length,
      revenue:   totalRevenue,
      sessions:  bookings.length,
      completed,
      compRate,
      avgRating,
      unread:    messages.filter(m => !m.read).length,
      pending:   applications.filter(a => a.status === "pending").length,
    };
  }, [users, providers, bookings, reviews, messages, applications]);

  // ── Monthly chart data (last 6 months) ──────────────────────
  const chartData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString("en", { month: "short" });
      const month = d.getMonth(); const year = d.getFullYear();
      const monthBookings = bookings.filter(b => {
        const bd = new Date(b.date);
        return bd.getMonth() === month && bd.getFullYear() === year;
      });
      months.push({ label, sessions: monthBookings.length, revenue: monthBookings.reduce((s, b) => s + (b.totalPrice || 0), 0) });
    }
    return months;
  }, [bookings]);

  const chartMax = Math.max(...chartData.map(d => d.sessions), 1);

  // ── Donut slices for category demand ──────────────────────────
  const donutSlices = useMemo(() => {
    const colors = ["#5b6ef8","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4"];
    const cat = {};
    providers.forEach(p => {
      const key = (p.skills || "Other").split(",")[0].trim() || "Other";
      cat[key] = (cat[key] || 0) + 1;
    });
    const total = Object.values(cat).reduce((a,b) => a+b, 0) || 1;
    return Object.entries(cat).map(([name, count], i) => ({
      name, count, pct: Math.round((count / total) * 100), color: colors[i % colors.length]
    }));
  }, [providers]);

  // ── Provider performance ──────────────────────────────────────
  const perfProviders = useMemo(() => {
    return providers.map(p => {
      const pb = bookings.filter(b => b.providerEmail === p.email);
      const rv = reviews.filter(r => r.providerEmail === p.email);
      const avgR = rv.length ? (rv.reduce((s,r) => s+r.rating,0)/rv.length).toFixed(1) : null;
      const perf = Math.min(100, (pb.length / Math.max(bookings.length, 1)) * 100 * providers.length);
      return { ...p, sessions: pb.length, avgRating: avgR, perf: Math.max(perf, 5) };
    }).sort((a,b) => b.sessions - a.sessions).slice(0,5);
  }, [providers, bookings, reviews]);

  // ── Recent activity ───────────────────────────────────────────
  const recentActivity = useMemo(() => {
    const items = [
      ...bookings.slice(-4).reverse().map(b => ({
        id: `b-${b.id}`, color: "dot-blue",
        text: `Session booked with ${b.mentor?.name || "Provider"}`,
        sub:  b.date ? new Date(b.date).toLocaleDateString("en-IN") : "recently",
      })),
      ...applications.slice(-3).reverse().map(a => ({
        id: `a-${a.id}`, color: a.status === "pending" ? "dot-amber" : a.status === "approved" ? "dot-green" : "dot-rose",
        text: `${a.name} applied to be a provider`,
        sub:  a.submittedAt ? new Date(a.submittedAt).toLocaleDateString("en-IN") : "recently",
      })),
      ...reviews.slice(-2).reverse().map(r => ({
        id: `r-${r.id}`, color: "dot-amber",
        text: `${r.userName} left a ${r.rating}★ review for ${r.providerName}`,
        sub:  r.submittedAt ? new Date(r.submittedAt).toLocaleDateString("en-IN") : "recently",
      })),
    ].slice(0, 6);
    return items;
  }, [bookings, applications, reviews]);

  // ── Helpers ───────────────────────────────────────────────────
  const formatTime = iso => {
    try { return new Date(iso).toLocaleString("en-IN", { day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit" }); }
    catch { return iso; }
  };

  // Users & Providers
  const filteredUsers     = users.filter(u => u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase()));
  const filteredProviders = providers.filter(p => p.name.toLowerCase().includes(searchProvider.toLowerCase()) || p.email.toLowerCase().includes(searchProvider.toLowerCase()));

  const handleDeleteUser = email => {
    if (window.confirm(`Delete user ${email}?`)) {
      localStorage.setItem("connectpro_users", JSON.stringify(users.filter(u => u.email !== email)));
      window.location.reload();
    }
  };
  const handleDeleteProvider = email => {
    if (window.confirm(`Delete provider ${email}?`)) {
      localStorage.setItem("connectpro_providers", JSON.stringify(providers.filter(p => p.email !== email)));
      window.location.reload();
    }
  };

  // Messages
  const filteredMessages = messages
    .filter(m => m.name?.toLowerCase().includes(searchMsg.toLowerCase()) || m.email?.toLowerCase().includes(searchMsg.toLowerCase()) || m.message?.toLowerCase().includes(searchMsg.toLowerCase()))
    .sort((a,b) => new Date(b.sentAt) - new Date(a.sentAt));
  const saveMessages    = u => { setMessages(u); localStorage.setItem("connectpro_contact_messages", JSON.stringify(u)); };
  const toggleRead      = id => saveMessages(messages.map(m => m.id === id ? {...m, read: !m.read} : m));
  const deleteMessage   = id => saveMessages(messages.filter(m => m.id !== id));
  const markAllRead     = () => saveMessages(messages.map(m => ({...m, read: true})));
  const clearAllMessages = () => { if (window.confirm("Delete ALL contact messages?")) saveMessages([]); };

  // Applications
  const saveApplications = u => { setApplications(u); localStorage.setItem("connectpro_provider_applications", JSON.stringify(u)); };
  const approveApplication = app => {
    const rec = { name: app.name, email: app.email, skills: app.skills, experience: app.experience, bio: app.bio, password: app.password, role: "provider", verified: true, approvedAt: new Date().toISOString() };
    saveStoredProviders([...getStoredProviders(), rec]);
    saveApplications(applications.map(a => a.id === app.id ? {...a, status:"approved", reviewedAt: new Date().toISOString()} : a));
    window.location.reload();
  };
  const confirmReject = app => {
    if (!rejectReason.trim()) { alert("Please enter a rejection reason."); return; }
    saveApplications(applications.map(a => a.id === app.id ? {...a, status:"rejected", reviewedAt: new Date().toISOString(), rejectionReason: rejectReason.trim()} : a));
    setRejectTarget(null); setRejectReason("");
  };
  const deleteApplication = id => { if (window.confirm("Delete application?")) saveApplications(applications.filter(a => a.id !== id)); };

  const filteredApps = applications.filter(a => appFilter === "all" || a.status === appFilter)
    .sort((a,b) => ({pending:0,rejected:1,approved:2}[a.status]??3) - ({pending:0,rejected:1,approved:2}[b.status]??3));

  const handleLogout = () => {
    localStorage.removeItem("connectpro_auth");
    navigate("/login");
  };

  return (
    <div className="ad-root">

      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside className={`ad-sidebar ${!sidebarOpen ? "collapsed" : ""}`}>

        {/* Logo */}
        <div className="ad-logo">
          <div className="ad-logo-icon">CP</div>
          {sidebarOpen && (
            <div className="ad-logo-text">
              <h3>ConnectPro</h3>
              <span>Admin Panel</span>
            </div>
          )}
        </div>

        {sidebarOpen && <p className="ad-nav-label">Main Menu</p>}

        {/* Nav */}
        <nav className="ad-nav">
          {NAV.map(item => (
            <button
              key={item.id}
              className={`ad-nav-item ${selectedTab === item.id ? "active" : ""}`}
              onClick={() => setSelectedTab(item.id)}
              title={!sidebarOpen ? item.label : ""}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
              {sidebarOpen && item.id === "messages"     && stats.unread  > 0 && <span className="ad-nav-badge">{stats.unread}</span>}
              {sidebarOpen && item.id === "applications" && stats.pending > 0 && <span className="ad-nav-badge">{stats.pending}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="ad-sidebar-bottom">
          <div className="ad-profile-box">
            <div className="ad-profile-avatar">AD</div>
            {sidebarOpen && (
              <div className="ad-profile-info">
                <h4>Admin</h4>
                <p>Administrator</p>
              </div>
            )}
          </div>
          <button className="ad-logout-btn" onClick={handleLogout}>
            <FiLogOut size={16} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ═══════════ MAIN ═══════════ */}
      <div className={`ad-main ${!sidebarOpen ? "sidebar-collapsed" : ""}`}>

        {/* TOP BAR */}
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <button className="ad-collapse-btn" onClick={() => setSidebarOpen(s => !s)}>
              <FiMenu size={18} />
            </button>
            <span className="ad-page-title">{PAGE_TITLES[selectedTab]}</span>
          </div>
          <div className="ad-topbar-right">
            <div className="ad-topbar-icon" title="Notifications">
              <FiBell size={17} />
              {(stats.unread + stats.pending) > 0 && <span className="ad-topbar-dot" />}
            </div>
            <div className="ad-topbar-avatar" title="Admin">AD</div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="ad-content">

          {/* ══════════════════════════════════════
              DASHBOARD (OVERVIEW)
              ══════════════════════════════════════ */}
          {selectedTab === "overview" && (
            <>
              {/* Stat Cards */}
              <div className="ad-stat-row">
                <div className="ad-stat-card" onClick={() => setSelectedTab("applications")}>
                  <div className="ad-stat-info">
                    <p>Pending Applications</p>
                    <h2>{stats.pending}</h2>
                    <p className="ad-stat-sub">{stats.pending > 0 ? "Needs review →" : "All cleared"}</p>
                  </div>
                  <div className="ad-stat-icon icon-amber"><FiFileText size={22} /></div>
                </div>
                <div className="ad-stat-card" onClick={() => setSelectedTab("messages")}>
                  <div className="ad-stat-info">
                    <p>Unread Messages</p>
                    <h2>{stats.unread}</h2>
                    <p className="ad-stat-sub">{stats.unread > 0 ? "View inbox →" : "No new messages"}</p>
                  </div>
                  <div className="ad-stat-icon icon-rose"><FiMail size={22} /></div>
                </div>
                <div className="ad-stat-card">
                  <div className="ad-stat-info">
                    <p>Platform Rating</p>
                    <h2>{stats.avgRating}</h2>
                    <p className="ad-stat-sub">From {reviews.length} reviews</p>
                  </div>
                  <div className="ad-stat-icon icon-amber"><FiStar size={22} /></div>
                </div>
                <div className="ad-stat-card">
                  <div className="ad-stat-info">
                    <p>Completion Rate</p>
                    <h2>{stats.compRate}%</h2>
                    <p className="ad-stat-sub">{stats.completed} of {stats.sessions} sessions</p>
                  </div>
                  <div className="ad-stat-icon icon-green"><FiCheckCircle size={22} /></div>
                </div>
              </div>

              {/* Secondary stat row */}
              <div className="ad-stat-row" style={{ marginBottom: 24 }}>
                <div className="ad-stat-card" onClick={() => setSelectedTab("users")}>
                  <div className="ad-stat-info">
                    <p>Total Users</p>
                    <h2>{stats.users}</h2>
                    <p className="ad-stat-sub">View all →</p>
                  </div>
                  <div className="ad-stat-icon icon-blue"><FiUsers size={22} /></div>
                </div>
                <div className="ad-stat-card" onClick={() => setSelectedTab("providers")}>
                  <div className="ad-stat-info">
                    <p>Total Providers</p>
                    <h2>{stats.providers}</h2>
                    <p className="ad-stat-sub">View all →</p>
                  </div>
                  <div className="ad-stat-icon icon-purple"><FiShield size={22} /></div>
                </div>
                <div className="ad-stat-card" onClick={() => setSelectedTab("sessions")}>
                  <div className="ad-stat-info">
                    <p>Total Bookings</p>
                    <h2>{stats.sessions}</h2>
                    <p className="ad-stat-sub">View all →</p>
                  </div>
                  <div className="ad-stat-icon icon-blue"><FiClock size={22} /></div>
                </div>
                <div className="ad-stat-card">
                  <div className="ad-stat-info">
                    <p>Platform Revenue</p>
                    <h2>₹{stats.revenue.toLocaleString()}</h2>
                    <p className="ad-stat-sub">All time total</p>
                  </div>
                  <div className="ad-stat-icon icon-green"><FiDollarSign size={22} /></div>
                </div>
              </div>

              {/* Charts row */}
              <div className="ad-charts-row">
                <div className="ad-chart-card">
                  <h3>Monthly Revenue &amp; Bookings</h3>
                  <MiniBarChart data={chartData} maxVal={chartMax} />
                  <div className="ad-chart-legend">
                    <span className="ad-legend-dot sessions">Bookings</span>
                    <span className="ad-legend-dot revenue">Revenue (×5 scale)</span>
                  </div>
                </div>

                <div className="ad-chart-card">
                  <h3>Category Demand</h3>
                  <div className="ad-donut-wrap">
                    {donutSlices.length > 0
                      ? <DonutChart slices={donutSlices} />
                      : <div style={{ height: 120, display:"grid", placeItems:"center", color:"#94a3b8", fontSize:"0.85rem" }}>No provider data</div>
                    }
                    <div className="ad-donut-legend">
                      {donutSlices.map(s => (
                        <div key={s.name} className="ad-donut-row">
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div className="ad-donut-dot" style={{ background: s.color }} />
                            <span>{s.name}</span>
                          </div>
                          <strong>{s.pct}%</strong>
                        </div>
                      ))}
                      {donutSlices.length === 0 && (
                        <p style={{ fontSize:"0.8rem", color:"#94a3b8", textAlign:"center" }}>Register providers to see data</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom row */}
              <div className="ad-bottom-row">
                <div className="ad-section-card">
                  <h3><FiTrendingUp size={16} style={{ color:"#5b6ef8" }} /> Provider Performance</h3>
                  {perfProviders.length > 0 ? (
                    <div className="ad-perf-list">
                      {perfProviders.map(p => (
                        <div key={p.email} className="ad-perf-item">
                          <div className="ad-perf-avatar">{(p.name?.[0]||"P").toUpperCase()}</div>
                          <div className="ad-perf-info">
                            <div className="ad-perf-name-row">
                              <span className="ad-perf-name">{p.name}</span>
                              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                {p.avgRating && (
                                  <span className="ad-perf-rating">★ {p.avgRating}</span>
                                )}
                                {p.verified && <span className="ad-verified-chip">✓ Verified</span>}
                              </div>
                            </div>
                            <div className="ad-perf-bar-track">
                              <div className="ad-perf-bar-fill" style={{ width: `${p.perf}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="ad-empty">
                      <FiShield size={36} />
                      <h3>No providers yet</h3>
                      <p>Approve provider applications to see performance here.</p>
                    </div>
                  )}
                </div>

                <div className="ad-section-card">
                  <h3><FiActivity size={16} style={{ color:"#5b6ef8" }} /> Recent Activity</h3>
                  {recentActivity.length > 0 ? (
                    <div className="ad-activity-list">
                      {recentActivity.map(a => (
                        <div key={a.id} className="ad-activity-item">
                          <div className={`ad-activity-dot ${a.color}`} />
                          <div className="ad-activity-text">
                            <p>{a.text}</p>
                            <span>{a.sub}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="ad-empty">
                      <FiActivity size={36} />
                      <p>No activity yet</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════
              ANALYTICS PAGE
              ══════════════════════════════════════ */}
          {selectedTab === "analytics" && (
            <div>
              {/* Summary stat row */}
              <div className="ad-stat-row" style={{ marginBottom: 24 }}>
                {[
                  { label:"Total Revenue",    val:`₹${stats.revenue.toLocaleString()}`,  icon:<FiDollarSign size={20}/>,  cls:"icon-green" },
                  { label:"Avg/Session",      val:stats.sessions > 0 ? `₹${(stats.revenue/stats.sessions).toFixed(0)}` : "—", icon:<FiTrendingUp size={20}/>, cls:"icon-blue" },
                  { label:"Avg/Provider",     val:stats.providers > 0 ? (stats.sessions/stats.providers).toFixed(1) : "—",   icon:<FiUsers size={20}/>,      cls:"icon-purple" },
                  { label:"Completed",        val:`${stats.compRate}%`,                   icon:<FiCheckCircle size={20}/>, cls:"icon-green" },
                ].map((s,i) => (
                  <div key={i} className="ad-stat-card">
                    <div className="ad-stat-info">
                      <p>{s.label}</p><h2>{s.val}</h2>
                    </div>
                    <div className={`ad-stat-icon ${s.cls}`}>{s.icon}</div>
                  </div>
                ))}
              </div>

              <div className="ad-charts-row">
                <div className="ad-chart-card">
                  <h3>Monthly Sessions &amp; Revenue</h3>
                  <MiniBarChart data={chartData} maxVal={chartMax} />
                  <div className="ad-chart-legend">
                    <span className="ad-legend-dot sessions">Sessions</span>
                    <span className="ad-legend-dot revenue">Revenue</span>
                  </div>
                  <div style={{ marginTop: 18, display:"flex", flexDirection:"column", gap:8 }}>
                    {chartData.map((d,i) => (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:"0.82rem", color:"#475569", padding:"6px 0", borderBottom:"1px solid #f1f5f9" }}>
                        <span style={{ fontWeight:700 }}>{d.label}</span>
                        <span>{d.sessions} sessions</span>
                        <span style={{ color:"#16a34a", fontWeight:700 }}>₹{d.revenue.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ad-chart-card">
                  <h3>Provider Distribution</h3>
                  <div className="ad-donut-wrap">
                    {donutSlices.length > 0 ? <DonutChart slices={donutSlices} /> : <div style={{ height:120, display:"grid", placeItems:"center", color:"#94a3b8" }}>No data</div>}
                    <div className="ad-donut-legend">
                      {donutSlices.map(s => (
                        <div key={s.name} className="ad-donut-row">
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div className="ad-donut-dot" style={{ background: s.color }} />
                            <span>{s.name} ({s.count})</span>
                          </div>
                          <strong>{s.pct}%</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              USERS PAGE
              ══════════════════════════════════════ */}
          {selectedTab === "users" && (
            <div className="ad-section-card">
              <div className="ad-page-header">
                <h2>All Users <span className="ad-badge badge-blue">{stats.users}</span></h2>
                <input className="ad-search-input" placeholder="🔍 Search by name or email..." value={searchUser} onChange={e => setSearchUser(e.target.value)} />
              </div>
              {filteredUsers.length > 0 ? (
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead><tr><th>User</th><th>Email</th><th>Bookings</th><th>Spent</th><th>Type</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredUsers.map(user => {
                        const ub = bookings.filter(b => b.userId === user.email);
                        const spent = ub.reduce((s,b) => s+(b.totalPrice||0), 0);
                        return (
                          <tr key={user.email}>
                            <td>
                              <span className="ad-table-avatar">{(user.name?.[0]||"U").toUpperCase()}</span>
                              <strong>{user.name}</strong>
                            </td>
                            <td style={{ color:"#64748b" }}>{user.email}</td>
                            <td><strong>{ub.length}</strong></td>
                            <td style={{ color:"#16a34a", fontWeight:700 }}>₹{spent.toFixed(0)}</td>
                            <td><span className={`ad-badge ${user.googleAuth ? "badge-blue" : "badge-purple"}`}>{user.googleAuth ? "Google" : "Email"}</span></td>
                            <td>
                              <button className="ad-action-btn delete" onClick={() => handleDeleteUser(user.email)}><FiTrash2 size={13} /> Delete</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="ad-empty"><FiUsers size={40} /><h3>No users found</h3><p>Try a different search term</p></div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
              PROVIDERS PAGE
              ══════════════════════════════════════ */}
          {selectedTab === "providers" && (
            <div className="ad-section-card">
              <div className="ad-page-header">
                <h2>All Providers <span className="ad-badge badge-purple">{stats.providers}</span></h2>
                <input className="ad-search-input" placeholder="🔍 Search by name or email..." value={searchProvider} onChange={e => setSearchProvider(e.target.value)} />
              </div>
              {filteredProviders.length > 0 ? (
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead><tr><th>Provider</th><th>Email</th><th>Skills</th><th>Sessions</th><th>Earnings</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredProviders.map(p => {
                        const pb = bookings.filter(b => b.providerEmail === p.email);
                        const earnings = pb.reduce((s,b) => s+(b.totalPrice||0)*0.8, 0);
                        return (
                          <tr key={p.email}>
                            <td>
                              <span className="ad-table-avatar">{(p.name?.[0]||"P").toUpperCase()}</span>
                              <strong>{p.name}</strong>
                            </td>
                            <td style={{ color:"#64748b" }}>{p.email}</td>
                            <td style={{ maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.skills}</td>
                            <td><strong>{pb.length}</strong></td>
                            <td style={{ color:"#16a34a", fontWeight:700 }}>₹{earnings.toFixed(0)}</td>
                            <td>
                              <span className={`ad-badge ${p.verified ? "badge-green" : "badge-orange"}`}>
                                {p.verified ? "✓ Verified" : "Pending"}
                              </span>
                            </td>
                            <td>
                              <button className="ad-action-btn delete" onClick={() => handleDeleteProvider(p.email)}><FiTrash2 size={13} /> Delete</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="ad-empty"><FiShield size={40} /><h3>No providers found</h3><p>Approve applications to see providers here</p></div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
              SESSIONS / BOOKINGS PAGE
              ══════════════════════════════════════ */}
          {selectedTab === "sessions" && (
            <div className="ad-section-card">
              <div className="ad-page-header">
                <h2>All Bookings <span className="ad-badge badge-blue">{bookings.length}</span></h2>
              </div>
              {bookings.length > 0 ? (
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead><tr><th>User</th><th>Provider</th><th>Date</th><th>Time</th><th>Duration</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                      {[...bookings].reverse().map(b => {
                        const upcoming = new Date(`${b.date}T${b.time}`) > new Date();
                        return (
                          <tr key={b.id}>
                            <td><strong>{b.userName || b.userId || "—"}</strong></td>
                            <td>{b.providerName || b.mentor?.name || "—"}</td>
                            <td>{b.date}</td>
                            <td>{b.time}</td>
                            <td>{b.duration} min</td>
                            <td style={{ color:"#16a34a", fontWeight:700 }}>₹{(b.totalPrice||0).toFixed(0)}</td>
                            <td><span className={`ad-badge ${upcoming ? "badge-blue" : "badge-green"}`}>{upcoming ? "Upcoming" : "Completed"}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="ad-empty"><FiClock size={40} /><h3>No bookings yet</h3><p>Bookings will appear here when users book sessions</p></div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
              MESSAGES PAGE
              ══════════════════════════════════════ */}
          {selectedTab === "messages" && (
            <div>
              <div className="ad-page-header">
                <h2>Contact Messages {stats.unread > 0 && <span className="ad-badge badge-rose" style={{ background:"#fff1f2",color:"#be123c",border:"1px solid #fecdd3" }}>{stats.unread} new</span>}</h2>
                <div className="ad-msg-actions">
                  <div style={{ position:"relative" }}>
                    <FiSearch size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
                    <input className="ad-search-input" style={{ paddingLeft:32 }} placeholder="Search messages..." value={searchMsg} onChange={e => setSearchMsg(e.target.value)} />
                  </div>
                  {stats.unread > 0 && <button className="ad-msg-action-btn" onClick={markAllRead}><FiCheckCircle size={13} /> Mark All Read</button>}
                  {messages.length > 0 && <button className="ad-msg-action-btn danger" onClick={clearAllMessages}><FiTrash2 size={13} /> Clear All</button>}
                </div>
              </div>
              {filteredMessages.length > 0 ? (
                <div className="ad-msg-list">
                  {filteredMessages.map(msg => (
                    <div key={msg.id} className={`ad-msg-card ${!msg.read ? "unread" : ""}`}>
                      <div className="ad-msg-avatar">{(msg.name?.[0]||"?").toUpperCase()}</div>
                      <div className="ad-msg-body">
                        <div className="ad-msg-name-row">
                          <span className="ad-msg-name">{msg.name}</span>
                          {!msg.read && <span className="ad-badge badge-blue" style={{ fontSize:"0.65rem" }}>New</span>}
                          <span className="ad-msg-time">{formatTime(msg.sentAt)}</span>
                        </div>
                        <p className="ad-msg-email">{msg.email}</p>
                        <p className="ad-msg-text">{msg.message}</p>
                        <div className="ad-msg-btns">
                          <button className="ad-action-btn view" onClick={() => toggleRead(msg.id)}>
                            <FiCheckCircle size={12} /> {msg.read ? "Mark Unread" : "Mark Read"}
                          </button>
                          <a href={`mailto:${msg.email}?subject=Re: ConnectPro`} className="ad-action-btn view" style={{ textDecoration:"none" }}>
                            <FiMail size={12} /> Reply
                          </a>
                          <button className="ad-action-btn delete" onClick={() => deleteMessage(msg.id)}>
                            <FiTrash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ad-empty"><FiMessageSquare size={44} /><h3>No messages</h3><p>{searchMsg ? "No messages match your search." : "Contact messages from the landing page will appear here."}</p></div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
              APPLICATIONS PAGE
              ══════════════════════════════════════ */}
          {selectedTab === "applications" && (
            <div>
              <div className="ad-page-header">
                <h2>Provider Applications {stats.pending > 0 && <span className="ad-badge badge-orange">{stats.pending} pending</span>}</h2>
              </div>
              <div className="ad-filter-tabs" style={{ marginBottom:16 }}>
                {["all","pending","approved","rejected"].map(f => (
                  <button key={f} className={`ad-filter-tab ${appFilter === f ? "active" : ""}`} onClick={() => setAppFilter(f)}>
                    {f.charAt(0).toUpperCase()+f.slice(1)}
                    {f !== "all" && <span style={{ marginLeft:5 }}>({applications.filter(a => a.status === f).length})</span>}
                    {f === "all" && <span style={{ marginLeft:5 }}>({applications.length})</span>}
                  </button>
                ))}
              </div>
              {filteredApps.length === 0 ? (
                <div className="ad-empty"><FiFileText size={44} /><h3>No applications</h3><p>Provider applications will appear here for review.</p></div>
              ) : (
                <div className="ad-app-list">
                  {filteredApps.map(app => (
                    <div key={app.id} className="ad-app-card">
                      <div className="ad-app-stripe" style={{
                        background: app.status === "pending" ? "#f59e0b" : app.status === "approved" ? "#16a34a" : "#ef4444"
                      }} />
                      <div className="ad-app-header">
                        <div className="ad-app-avatar">{(app.name?.[0]||"?").toUpperCase()}</div>
                        <div className="ad-app-info">
                          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:2 }}>
                            <span className="ad-app-name">{app.name}</span>
                            <span className={`ad-badge ${app.status === "approved" ? "badge-green" : app.status === "pending" ? "badge-orange" : "badge-red"}`}>
                              {app.status === "pending" ? "⏳ Pending" : app.status === "approved" ? "✓ Approved" : "✗ Rejected"}
                            </span>
                          </div>
                          <p className="ad-app-email">{app.email}</p>
                          <p className="ad-app-time">Submitted: {formatTime(app.submittedAt)}</p>
                        </div>
                        {app.status !== "approved" && (
                          <button className="ad-action-btn delete" style={{ marginLeft:"auto", flexShrink:0 }} onClick={() => deleteApplication(app.id)}>
                            <FiTrash2 size={13} />
                          </button>
                        )}
                      </div>

                      {/* Info grid */}
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:4 }}>
                        <div><p style={{ fontSize:"0.7rem", fontWeight:700, color:"#94a3b8", textTransform:"uppercase", marginBottom:2 }}>Skills</p><p style={{ fontSize:"0.83rem", color:"#1e293b", fontWeight:600 }}>{app.skills}</p></div>
                        <div><p style={{ fontSize:"0.7rem", fontWeight:700, color:"#94a3b8", textTransform:"uppercase", marginBottom:2 }}>Experience</p><p style={{ fontSize:"0.83rem", color:"#1e293b", fontWeight:600 }}>{app.experience}</p></div>
                        {app.bio && <div style={{ gridColumn:"1/-1" }}><p style={{ fontSize:"0.7rem", fontWeight:700, color:"#94a3b8", textTransform:"uppercase", marginBottom:2 }}>Bio</p><p style={{ fontSize:"0.83rem", color:"#475569", lineHeight:1.5 }}>{app.bio}</p></div>}
                      </div>

                      {/* Documents */}
                      <div className="ad-doc-chips">
                        {app.documents?.resume && (
                          <button className="ad-action-btn view" onClick={() => setViewDoc({ dataUrl: app.documents.resume.dataUrl, name: app.documents.resume.name })}>
                            <FiFileText size={12} /> Resume ({(app.documents.resume.size/1024).toFixed(0)}KB)
                          </button>
                        )}
                        {app.documents?.certificate && (
                          <button className="ad-action-btn view" onClick={() => setViewDoc({ dataUrl: app.documents.certificate.dataUrl, name: app.documents.certificate.name })}>
                            <FiFileText size={12} /> Certificate
                          </button>
                        )}
                        {app.documents?.linkedinProof && (
                          <a href={app.documents.linkedinProof} target="_blank" rel="noreferrer" className="ad-action-btn view" style={{ textDecoration:"none" }}>
                            <FiExternalLink size={12} /> LinkedIn
                          </a>
                        )}
                      </div>

                      {app.status === "rejected" && app.rejectionReason && (
                        <div style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"10px 12px", background:"#fff1f2", border:"1.5px solid #fecdd3", borderRadius:10, fontSize:"0.82rem", color:"#be123c" }}>
                          <FiAlertCircle size={14} style={{ flexShrink:0, marginTop:1 }} />
                          <span><strong>Rejection reason:</strong> {app.rejectionReason}</span>
                        </div>
                      )}

                      {app.status === "pending" && (
                        rejectTarget?.id === app.id ? (
                          <div className="ad-reject-box">
                            <p style={{ fontSize:"0.82rem", fontWeight:700, color:"#be123c" }}>Enter rejection reason:</p>
                            <textarea className="ad-reject-box textarea" rows={2} placeholder="e.g. Insufficient experience..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ width:"100%", border:"1.5px solid #fecdd3", borderRadius:8, padding:8, fontFamily:"Inter,sans-serif", fontSize:"0.82rem", outline:"none" }} />
                            <div className="ad-reject-actions">
                              <button className="ad-app-btn reject" onClick={() => confirmReject(app)}><FiThumbsDown size={13} /> Confirm Rejection</button>
                              <button className="ad-action-btn view" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="ad-app-btns">
                            <button className="ad-app-btn approve" onClick={() => { if (window.confirm(`Approve ${app.name} as a provider?`)) approveApplication(app); }}>
                              <FiThumbsUp size={14} /> Approve Provider
                            </button>
                            <button className="ad-app-btn reject" onClick={() => { setRejectTarget(app); setRejectReason(""); }}>
                              <FiThumbsDown size={14} /> Reject
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
              REVIEWS PAGE
              ══════════════════════════════════════ */}
          {selectedTab === "reviews" && (
            <div>
              <div className="ad-page-header">
                <h2>All Reviews <span className="ad-badge badge-orange">{reviews.length} total</span></h2>
                {reviews.length > 0 && (
                  <span style={{ fontSize:"0.88rem", color:"#64748b", fontWeight:600 }}>
                    Platform avg: <strong style={{ color:"#f59e0b" }}>★ {stats.avgRating}</strong>
                  </span>
                )}
              </div>
              {reviews.length === 0 ? (
                <div className="ad-empty"><FiStar size={44} style={{ color:"#fbbf24" }} /><h3>No reviews yet</h3><p>User reviews after sessions will appear here.</p></div>
              ) : (
                <div className="ad-app-list">
                  {[...reviews].sort((a,b) => new Date(b.submittedAt)-new Date(a.submittedAt)).map(rv => (
                    <div key={rv.id} className="ad-app-card">
                      <div className="ad-app-stripe" style={{ background:"linear-gradient(180deg,#fbbf24,#f59e0b)" }} />
                      <div className="ad-app-header">
                        <div className="ad-app-avatar" style={{ background:"linear-gradient(135deg,#fbbf24,#f59e0b)" }}>
                          {(rv.userName?.[0]||"U").toUpperCase()}
                        </div>
                        <div className="ad-app-info">
                          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:2 }}>
                            <span className="ad-app-name">{rv.userName}</span>
                            <span style={{ display:"flex", gap:2 }}>
                              {[1,2,3,4,5].map(s => <span key={s} style={{ color: rv.rating>=s?"#fbbf24":"#e2e8f0", fontSize:"0.9rem" }}>★</span>)}
                              <span style={{ marginLeft:4, fontSize:"0.78rem", fontWeight:700, color:"#f59e0b" }}>{rv.rating}.0</span>
                            </span>
                          </div>
                          <p className="ad-app-email">For provider: <strong style={{ color:"#5b6ef8" }}>{rv.providerName}</strong></p>
                          <p className="ad-app-time">{formatTime(rv.submittedAt)} · Session: {rv.sessionDate || "N/A"}</p>
                        </div>
                        <button className="ad-action-btn delete" style={{ marginLeft:"auto" }} onClick={() => {
                          if (window.confirm("Delete this review?")) {
                            const updated = reviews.filter(r => r.id !== rv.id);
                            setReviews(updated);
                            localStorage.setItem("connectpro_reviews", JSON.stringify(updated));
                          }
                        }}><FiTrash2 size={13} /></button>
                      </div>
                      <div>
                        <p style={{ fontSize:"0.9rem", fontWeight:800, color:"#1e293b", marginBottom:4 }}>"{rv.title}"</p>
                        <p style={{ fontSize:"0.83rem", color:"#475569", lineHeight:1.6 }}>{rv.review}</p>
                      </div>
                      {rv.tags?.length > 0 && (
                        <div className="ad-doc-chips">
                          {rv.tags.map(tag => (
                            <span key={tag} className="ad-badge badge-blue" style={{ background:"#fefce8", color:"#92400e", border:"1px solid #fde68a" }}>{tag}</span>
                          ))}
                        </div>
                      )}
                      {rv.recommend !== null && rv.recommend !== undefined && (
                        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.8rem", fontWeight:700 }}>
                          {rv.recommend
                            ? <><FiThumbsUp size={13} style={{ color:"#16a34a" }} /><span style={{ color:"#16a34a" }}>Recommends this mentor</span></>
                            : <><FiThumbsDown size={13} style={{ color:"#ef4444" }} /><span style={{ color:"#ef4444" }}>Does not recommend</span></>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* DOCUMENT VIEWER MODAL */}
      {viewDoc && (
        <div className="ad-doc-overlay" onClick={() => setViewDoc(null)}>
          <div className="ad-doc-modal" onClick={e => e.stopPropagation()}>
            <div className="ad-doc-modal-header">
              <span><FiFileText size={16} /> {viewDoc.name}</span>
              <div className="ad-doc-modal-actions">
                <a href={viewDoc.dataUrl} download={viewDoc.name} className="ad-doc-download">↓ Download</a>
                <button className="ad-doc-close" onClick={() => setViewDoc(null)}><FiX size={16} /></button>
              </div>
            </div>
            <iframe src={viewDoc.dataUrl} title={viewDoc.name} className="ad-doc-frame" />
          </div>
        </div>
      )}

    </div>
  );
}
