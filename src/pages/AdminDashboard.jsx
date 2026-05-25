import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";
import { FiUsers, FiShield, FiDollarSign, FiTrendingUp, FiCheckCircle, FiTrash2, FiEye, FiMail, FiMessageSquare, FiSearch, FiX, FiFileText, FiThumbsUp, FiThumbsDown, FiClock, FiAlertCircle, FiExternalLink, FiStar } from "react-icons/fi";
import { getStoredUsers, getStoredProviders, saveStoredProviders } from "../utils/storage";

export default function AdminDashboard() {
  const navigate   = useNavigate();
  const users      = getStoredUsers();
  const providers  = getStoredProviders();
  const bookings   = JSON.parse(localStorage.getItem("userBookings") || "[]");

  const [selectedTab,    setSelectedTab]    = useState("overview");
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

  // ── Stats ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    return {
      users:            users.length,
      providers:        providers.length,
      revenue:          totalRevenue,
      sessionsToday:    bookings.filter(b => new Date(b.date).toDateString() === new Date().toDateString()).length,
      completedSessions:bookings.filter(b => new Date(`${b.date}T${b.time}`) < new Date()).length,
    };
  }, [users, providers, bookings]);

  // ── Filtered lists ───────────────────────────────────────────
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );
  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(searchProvider.toLowerCase()) ||
    p.email.toLowerCase().includes(searchProvider.toLowerCase())
  );

  // ── User / Provider delete ───────────────────────────────────
  const handleDeleteUser = (email) => {
    if (window.confirm(`Delete user ${email}?`)) {
      localStorage.setItem("connectpro_users", JSON.stringify(users.filter(u => u.email !== email)));
      window.location.reload();
    }
  };
  const handleDeleteProvider = (email) => {
    if (window.confirm(`Delete provider ${email}?`)) {
      localStorage.setItem("connectpro_providers", JSON.stringify(providers.filter(p => p.email !== email)));
      window.location.reload();
    }
  };

  // ── Message helpers ──────────────────────────────────────────
  const unreadCount = messages.filter(m => !m.read).length;
  const filteredMessages = messages
    .filter(m =>
      m.name.toLowerCase().includes(searchMsg.toLowerCase()) ||
      m.email.toLowerCase().includes(searchMsg.toLowerCase()) ||
      m.message.toLowerCase().includes(searchMsg.toLowerCase())
    )
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

  const saveMessages = (updated) => {
    setMessages(updated);
    localStorage.setItem("connectpro_contact_messages", JSON.stringify(updated));
  };
  const toggleRead      = (id) => saveMessages(messages.map(m => m.id === id ? { ...m, read: !m.read } : m));
  const deleteMessage   = (id) => saveMessages(messages.filter(m => m.id !== id));
  const markAllRead     = ()   => saveMessages(messages.map(m => ({ ...m, read: true })));
  const clearAllMessages = ()  => { if (window.confirm("Delete ALL contact messages?")) saveMessages([]); };

  // ── Application helpers ──────────────────────────────────────
  const pendingCount = applications.filter(a => a.status === "pending").length;
  const saveApplications = (updated) => {
    setApplications(updated);
    localStorage.setItem("connectpro_provider_applications", JSON.stringify(updated));
  };
  const approveApplication = (app) => {
    const providerRecord = { name: app.name, email: app.email, skills: app.skills, experience: app.experience, bio: app.bio, password: app.password, role: "provider", verified: true, approvedAt: new Date().toISOString() };
    saveStoredProviders([...getStoredProviders(), providerRecord]);
    saveApplications(applications.map(a => a.id === app.id ? { ...a, status: "approved", reviewedAt: new Date().toISOString() } : a));
    window.location.reload();
  };
  const confirmReject = (app) => {
    if (!rejectReason.trim()) { alert("Please enter a rejection reason."); return; }
    saveApplications(applications.map(a => a.id === app.id ? { ...a, status: "rejected", reviewedAt: new Date().toISOString(), rejectionReason: rejectReason.trim() } : a));
    setRejectTarget(null); setRejectReason("");
  };
  const deleteApplication = (id) => { if (window.confirm("Delete application?")) saveApplications(applications.filter(a => a.id !== id)); };

  // ── Shared helpers ───────────────────────────────────────────
  const formatTime = (iso) => {
    try { return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return iso; }
  };

  const recentActions = [
    ...users.slice(-3).map(u => ({ id: u.email, action: "New user registered", user: u.name, time: "recently", type: "user" })),
    ...providers.slice(-2).map(p => ({ id: p.email, action: "New provider registered", user: p.name, time: "recently", type: "provider" })),
  ].sort(() => Math.random() - 0.5).slice(0, 5);

  return (
    <div className="admin-dashboard">

      {/* HEADER */}
      <div className="admin-header">
        <div>
          <h1>Admin Control Center</h1>
          <p>Monitor platform health, users, providers, and revenue performance.</p>
        </div>
        <button className="admin-action" onClick={() => navigate("/")}>← Platform Home</button>
      </div>

      {/* STAT CARDS */}
      <div className="admin-grid">
        <div className="admin-card" onClick={() => setSelectedTab("users")}>
          <div className="admin-card-icon users"><FiUsers size={24} /></div>
          <p className="admin-card-label">Total Users</p>
          <h2>{stats.users}</h2>
          <span className="card-action">View all →</span>
        </div>
        <div className="admin-card" onClick={() => setSelectedTab("providers")}>
          <div className="admin-card-icon mentors"><FiShield size={24} /></div>
          <p className="admin-card-label">Total Providers</p>
          <h2>{stats.providers}</h2>
          <span className="card-action">View all →</span>
        </div>
        <div className="admin-card">
          <div className="admin-card-icon revenue"><FiDollarSign size={24} /></div>
          <p className="admin-card-label">Platform Revenue</p>
          <h2>${stats.revenue.toLocaleString()}</h2>
        </div>
        <div className="admin-card">
          <div className="admin-card-icon sessions"><FiTrendingUp size={24} /></div>
          <p className="admin-card-label">Sessions Today</p>
          <h2>{stats.sessionsToday}</h2>
        </div>
        <div className="admin-card" onClick={() => setSelectedTab("messages")}>
          <div className="admin-card-icon" style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c" }}><FiMail size={24} /></div>
          <p className="admin-card-label">Contact Messages</p>
          <h2>{messages.length}</h2>
          {unreadCount > 0 && <span className="card-action" style={{ color: "#fb923c" }}>{unreadCount} unread →</span>}
        </div>
        <div className="admin-card" onClick={() => setSelectedTab("applications")}>
          <div className="admin-card-icon" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}><FiFileText size={24} /></div>
          <p className="admin-card-label">Provider Applications</p>
          <h2>{applications.length}</h2>
          {pendingCount > 0 && <span className="card-action" style={{ color: "#a78bfa" }}>{pendingCount} pending →</span>}
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="admin-tabs">
        <button className={`tab ${selectedTab === "overview"      ? "active" : ""}`} onClick={() => setSelectedTab("overview")}>Overview</button>
        <button className={`tab ${selectedTab === "users"         ? "active" : ""}`} onClick={() => setSelectedTab("users")}>Users ({stats.users})</button>
        <button className={`tab ${selectedTab === "providers"     ? "active" : ""}`} onClick={() => setSelectedTab("providers")}>Providers ({stats.providers})</button>
        <button className={`tab ${selectedTab === "sessions"      ? "active" : ""}`} onClick={() => setSelectedTab("sessions")}>Sessions ({bookings.length})</button>
        <button className={`tab msg-tab ${selectedTab === "messages"     ? "active" : ""}`} onClick={() => setSelectedTab("messages")}>
          <FiMail size={13} style={{ marginRight: 5 }} />Messages
          {unreadCount > 0 && <span className="msg-unread-badge">{unreadCount}</span>}
        </button>
        <button className={`tab msg-tab ${selectedTab === "applications" ? "active" : ""}`} onClick={() => setSelectedTab("applications")}>
          <FiFileText size={13} style={{ marginRight: 5 }} />Applications
          {pendingCount > 0 && <span className="msg-unread-badge" style={{ background: "#a78bfa" }}>{pendingCount}</span>}
        </button>
        <button className={`tab msg-tab ${selectedTab === "reviews" ? "active" : ""}`} onClick={() => setSelectedTab("reviews")}>
          <FiStar size={13} style={{ marginRight: 5 }} />Reviews ({reviews.length})
        </button>
      </div>

      {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
      {selectedTab === "overview" && (
        <div className="admin-overview">
          <div className="admin-columns">
            <div className="admin-panel">
              <div className="panel-header"><h2>Platform Statistics</h2></div>
              <div className="stats-detail">
                <div className="stat-row"><span>Total Users</span><strong>{stats.users}</strong></div>
                <div className="stat-row"><span>Total Providers</span><strong>{stats.providers}</strong></div>
                <div className="stat-row"><span>Total Sessions</span><strong>{bookings.length}</strong></div>
                <div className="stat-row"><span>Completed Sessions</span><strong>{stats.completedSessions}</strong></div>
                <div className="stat-row"><span>Platform Revenue</span><strong>${stats.revenue.toLocaleString()}</strong></div>
                <div className="stat-row"><span>Pending Applications</span><strong>{pendingCount}</strong></div>
              </div>
            </div>
            <div className="admin-panel">
              <div className="panel-header">
                <h2>Recent Activity</h2>
                <span>{recentActions.length} events</span>
              </div>
              <div className="activity-list">
                {recentActions.length > 0 ? recentActions.map(a => (
                  <div className="activity-item" key={a.id}>
                    <div className="activity-icon">{a.type === "user" ? <FiUsers size={16} /> : <FiShield size={16} />}</div>
                    <div>
                      <p className="activity-action">{a.action}</p>
                      <span>{a.user} · {a.time}</span>
                    </div>
                  </div>
                )) : <p style={{ color: "#475569", fontSize: "0.88rem" }}>No recent activity</p>}
              </div>
            </div>
          </div>
          <div className="admin-insights">
            <div className="insight-card">
              <FiTrendingUp size={28} />
              <div><p>Avg Sessions/Provider</p><strong>{stats.providers > 0 ? (bookings.length / stats.providers).toFixed(1) : "0"}</strong></div>
            </div>
            <div className="insight-card">
              <FiDollarSign size={28} />
              <div><p>Avg Revenue/Session</p><strong>${bookings.length > 0 ? (stats.revenue / bookings.length).toFixed(2) : "0.00"}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ USERS TAB ═══════════════ */}
      {selectedTab === "users" && (
        <div className="admin-users-section">
          <div className="section-header">
            <h2>Users Management ({stats.users} total)</h2>
            <input type="text" placeholder="Search by name or email..." value={searchUser} onChange={e => setSearchUser(e.target.value)} className="search-input" />
          </div>
          {filteredUsers.length > 0 ? (
            <div className="table-container">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Bookings</th><th>Spent</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredUsers.map(user => {
                    const ub = bookings.filter(b => b.userId === user.email);
                    const spent = ub.reduce((s, b) => s + (b.totalPrice || 0), 0);
                    return (
                      <tr key={user.email}>
                        <td><strong>{user.name}</strong></td>
                        <td>{user.email}</td>
                        <td>{ub.length}</td>
                        <td>${spent.toFixed(2)}</td>
                        <td>
                          <button className="btn-view" onClick={() => navigate(`/user-profile/${encodeURIComponent(user.email)}`)} title="View"><FiEye size={16} /></button>
                          <button className="btn-delete" onClick={() => handleDeleteUser(user.email)} title="Delete"><FiTrash2 size={16} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <div className="no-results">No users found</div>}
        </div>
      )}

      {/* ═══════════════ PROVIDERS TAB ═══════════════ */}
      {selectedTab === "providers" && (
        <div className="admin-providers-section">
          <div className="section-header">
            <h2>Providers Management ({stats.providers} total)</h2>
            <input type="text" placeholder="Search by name or email..." value={searchProvider} onChange={e => setSearchProvider(e.target.value)} className="search-input" />
          </div>
          {filteredProviders.length > 0 ? (
            <div className="table-container">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Skills</th><th>Sessions</th><th>Earnings</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredProviders.map(p => {
                    const pb = bookings.filter(b => b.providerEmail === p.email);
                    const earnings = pb.reduce((s, b) => s + (b.totalPrice || 0) * 0.8, 0);
                    return (
                      <tr key={p.email}>
                        <td><strong>{p.name}</strong>{p.verified && <span style={{ marginLeft: 6, fontSize: "0.68rem", background: "rgba(16,185,129,0.15)", color: "#34d399", padding: "2px 7px", borderRadius: "999px", fontWeight: 700 }}>✓ Verified</span>}</td>
                        <td>{p.email}</td>
                        <td>{p.skills}</td>
                        <td>{pb.length}</td>
                        <td>${earnings.toFixed(2)}</td>
                        <td>
                          <button className="btn-view" onClick={() => navigate(`/provider-profile/${encodeURIComponent(p.email)}`)} title="View"><FiEye size={16} /></button>
                          <button className="btn-delete" onClick={() => handleDeleteProvider(p.email)} title="Delete"><FiTrash2 size={16} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <div className="no-results">No providers found</div>}
        </div>
      )}

      {/* ═══════════════ SESSIONS TAB ═══════════════ */}
      {selectedTab === "sessions" && (
        <div className="admin-sessions-section">
          <div className="section-header"><h2>All Sessions ({bookings.length} total)</h2></div>
          {bookings.length > 0 ? (
            <div className="table-container">
              <table className="admin-table">
                <thead><tr><th>Mentor</th><th>Date</th><th>Time</th><th>Duration</th><th>Price</th><th>Status</th></tr></thead>
                <tbody>
                  {bookings.map(b => {
                    const isUpcoming = new Date(`${b.date}T${b.time}`) > new Date();
                    return (
                      <tr key={b.id}>
                        <td><strong>{b.mentor?.name || "N/A"}</strong></td>
                        <td>{b.date}</td>
                        <td>{b.time}</td>
                        <td>{b.duration} min</td>
                        <td>${b.totalPrice?.toFixed(2) || "0.00"}</td>
                        <td><span className={`status ${isUpcoming ? "upcoming" : "completed"}`}>{isUpcoming ? "Upcoming" : "Completed"}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <div className="no-results">No sessions found</div>}
        </div>
      )}

      {/* ═══════════════ MESSAGES TAB ═══════════════ */}
      {selectedTab === "messages" && (
        <div className="admin-messages-section">
          <div className="section-header">
            <h2>Contact Messages {unreadCount > 0 && <span className="msg-count-badge">{unreadCount} new</span>}</h2>
            <div className="msg-header-actions">
              <div className="msg-search-wrap">
                <FiSearch size={13} className="msg-search-icon" />
                <input type="text" placeholder="Search messages..." value={searchMsg} onChange={e => setSearchMsg(e.target.value)} className="search-input" style={{ width: 220, paddingLeft: 34 }} />
              </div>
              {unreadCount > 0 && <button className="msg-action-btn msg-read-all-btn" onClick={markAllRead}><FiCheckCircle size={13} /> Mark All Read</button>}
              {messages.length > 0 && <button className="msg-action-btn msg-clear-btn" onClick={clearAllMessages}><FiTrash2 size={13} /> Clear All</button>}
            </div>
          </div>
          {filteredMessages.length > 0 ? (
            <div className="msg-list">
              {filteredMessages.map(msg => (
                <div key={msg.id} className={`msg-card ${msg.read ? "msg-read" : "msg-unread"}`}>
                  {!msg.read && <div className="msg-unread-dot" />}
                  <div className="msg-card-top">
                    <div className="msg-sender">
                      <div className="msg-avatar">{(msg.name?.[0] || "?").toUpperCase()}</div>
                      <div>
                        <p className="msg-sender-name">{msg.name}</p>
                        <p className="msg-sender-email">{msg.email}</p>
                      </div>
                    </div>
                    <div className="msg-meta">
                      <span className={`msg-status-pill ${msg.read ? "pill-read" : "pill-unread"}`}>{msg.read ? "Read" : "New"}</span>
                      <span className="msg-time">{formatTime(msg.sentAt)}</span>
                    </div>
                  </div>
                  <div className="msg-body"><p>{msg.message}</p></div>
                  <div className="msg-card-actions">
                    <button className={`msg-btn ${msg.read ? "msg-btn-unread" : "msg-btn-read"}`} onClick={() => toggleRead(msg.id)}>
                      <FiCheckCircle size={12} /> {msg.read ? "Mark Unread" : "Mark Read"}
                    </button>
                    <a href={`mailto:${msg.email}?subject=Re: Your ConnectPro message`} className="msg-btn msg-btn-reply">
                      <FiMail size={12} /> Reply via Email
                    </a>
                    <button className="msg-btn msg-btn-delete" onClick={() => deleteMessage(msg.id)}>
                      <FiX size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="msg-empty">
              <FiMessageSquare size={52} />
              <h3>No messages yet</h3>
              <p>{searchMsg ? "No messages match your search." : "When visitors send contact messages from the landing page, they will appear here."}</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ APPLICATIONS TAB ═══════════════ */}
      {selectedTab === "applications" && (
        <div className="admin-messages-section">
          <div className="section-header">
            <h2>
              <FiFileText size={18} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Provider Applications ({applications.length} total
              {pendingCount > 0 && (
                <span className="msg-count-badge" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", borderColor: "rgba(139,92,246,0.3)" }}>
                  {pendingCount} pending
                </span>
              )})
            </h2>
          </div>

          {applications.length === 0 ? (
            <div className="msg-empty">
              <FiFileText size={52} />
              <h3>No applications yet</h3>
              <p>When providers submit their application with documents, they will appear here for your review.</p>
            </div>
          ) : (
            <div className="app-list">
              {[...applications]
                .sort((a, b) => ({ pending: 0, rejected: 1, approved: 2 }[a.status] ?? 3) - ({ pending: 0, rejected: 1, approved: 2 }[b.status] ?? 3))
                .map(app => (
                  <div key={app.id} className={`app-card app-card-${app.status}`}>
                    <div className={`app-stripe app-stripe-${app.status}`} />

                    {/* Header row */}
                    <div className="app-card-header">
                      <div className="app-avatar">{(app.name?.[0] || "?").toUpperCase()}</div>
                      <div className="app-header-info">
                        <div className="app-name-row">
                          <p className="app-name">{app.name}</p>
                          <span className={`app-status-pill app-pill-${app.status}`}>
                            {app.status === "pending"  && <><FiClock size={11} /> Pending Review</>}
                            {app.status === "approved" && <><FiCheckCircle size={11} /> Approved</>}
                            {app.status === "rejected" && <><FiX size={11} /> Rejected</>}
                          </span>
                        </div>
                        <p className="app-email">{app.email}</p>
                        <p className="app-time">Submitted {formatTime(app.submittedAt)}</p>
                      </div>
                      {app.status !== "approved" && (
                        <button className="msg-btn msg-btn-delete" style={{ marginLeft: "auto", flexShrink: 0 }} onClick={() => deleteApplication(app.id)}>
                          <FiTrash2 size={13} />
                        </button>
                      )}
                    </div>

                    {/* Details */}
                    <div className="app-details-grid">
                      <div className="app-detail-item">
                        <span className="app-detail-label">Skills</span>
                        <span className="app-detail-val">{app.skills}</span>
                      </div>
                      <div className="app-detail-item">
                        <span className="app-detail-label">Experience</span>
                        <span className="app-detail-val">{app.experience}</span>
                      </div>
                      {app.bio && (
                        <div className="app-detail-item" style={{ gridColumn: "1 / -1" }}>
                          <span className="app-detail-label">Bio</span>
                          <span className="app-detail-val">{app.bio}</span>
                        </div>
                      )}
                    </div>

                    {/* Documents */}
                    <div className="app-docs">
                      <p className="app-docs-title">Submitted Documents</p>
                      <div className="app-docs-row">
                        {app.documents?.resume && (
                          <button className="app-doc-btn app-doc-required" onClick={() => setViewDoc({ dataUrl: app.documents.resume.dataUrl, name: app.documents.resume.name })}>
                            <FiFileText size={13} /> Resume / CV
                            <span className="app-doc-size">({(app.documents.resume.size / 1024).toFixed(0)} KB)</span>
                          </button>
                        )}
                        {app.documents?.certificate && (
                          <button className="app-doc-btn app-doc-optional" onClick={() => setViewDoc({ dataUrl: app.documents.certificate.dataUrl, name: app.documents.certificate.name })}>
                            <FiFileText size={13} /> Certificate
                            <span className="app-doc-size">({(app.documents.certificate.size / 1024).toFixed(0)} KB)</span>
                          </button>
                        )}
                        {app.documents?.linkedinProof && (
                          <a href={app.documents.linkedinProof} target="_blank" rel="noopener noreferrer" className="app-doc-btn app-doc-link">
                            <FiExternalLink size={13} /> LinkedIn
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Rejection reason */}
                    {app.status === "rejected" && app.rejectionReason && (
                      <div className="app-rejection-reason">
                        <FiAlertCircle size={13} />
                        <span><strong>Reason:</strong> {app.rejectionReason}</span>
                      </div>
                    )}

                    {/* Pending actions */}
                    {app.status === "pending" && (
                      rejectTarget?.id === app.id ? (
                        <div className="app-reject-form">
                          <p className="app-reject-label">Enter rejection reason for the applicant:</p>
                          <textarea
                            className="app-reject-input"
                            rows={2}
                            placeholder="e.g. Insufficient experience, missing credentials..."
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                          />
                          <div className="app-reject-actions">
                            <button className="app-action-btn app-reject-confirm-btn" onClick={() => confirmReject(app)}>
                              <FiThumbsDown size={13} /> Confirm Rejection
                            </button>
                            <button className="app-action-btn app-cancel-btn" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="app-action-row">
                          <button className="app-action-btn app-approve-btn" onClick={() => { if (window.confirm(`Approve ${app.name} as a provider? They will be able to log in immediately.`)) approveApplication(app); }}>
                            <FiThumbsUp size={14} /> Approve Provider
                          </button>
                          <button className="app-action-btn app-reject-btn" onClick={() => { setRejectTarget(app); setRejectReason(""); }}>
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
      {/* ═══════════════ REVIEWS TAB ═══════════════ */}
      {selectedTab === "reviews" && (
        <div className="admin-messages-section">
          <div className="section-header">
            <h2>
              <FiStar size={18} style={{ marginRight: 8, verticalAlign: "middle", color: "#fbbf24" }} />
              All Reviews ({reviews.length} total)
            </h2>
          </div>

          {reviews.length === 0 ? (
            <div className="msg-empty">
              <FiStar size={52} style={{ color: "#fbbf24" }} />
              <h3>No reviews yet</h3>
              <p>Reviews from users after completed sessions will appear here.</p>
            </div>
          ) : (
            <div className="app-list">
              {[...reviews]
                .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                .map(rv => (
                  <div key={rv.id} className="app-card" style={{ borderColor: "rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.02)" }}>
                    <div className="app-stripe" style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b)" }} />

                    <div className="app-card-header">
                      <div className="app-avatar" style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 4px 12px rgba(251,191,36,0.3)" }}>
                        {(rv.userName?.[0] || "U").toUpperCase()}
                      </div>
                      <div className="app-header-info">
                        <div className="app-name-row">
                          <p className="app-name">{rv.userName}</p>
                          <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                            {[1,2,3,4,5].map(s => (
                              <FiStar key={s} size={14} style={{ color: rv.rating >= s ? "#fbbf24" : "#334155", fill: rv.rating >= s ? "#fbbf24" : "none" }} />
                            ))}
                            <span style={{ fontSize: "0.78rem", color: "#fbbf24", fontWeight: 700, marginLeft: 4 }}>{rv.rating}.0</span>
                          </span>
                        </div>
                        <p className="app-email">For: <strong style={{ color: "#a5b4fc" }}>{rv.providerName}</strong></p>
                        <p className="app-time">{formatTime(rv.submittedAt)} · Session on {rv.sessionDate || "N/A"}</p>
                      </div>
                      <button className="msg-btn msg-btn-delete" style={{ marginLeft: "auto", flexShrink: 0 }}
                        onClick={() => {
                          if (window.confirm("Delete this review?")) {
                            const updated = reviews.filter(r => r.id !== rv.id);
                            setReviews(updated);
                            localStorage.setItem("connectpro_reviews", JSON.stringify(updated));
                          }
                        }}>
                        <FiTrash2 size={13} />
                      </button>
                    </div>

                    <div>
                      <p style={{ fontSize: "0.95rem", fontWeight: 800, color: "#f1f5f9", marginBottom: 6 }}>"{rv.title}"</p>
                      <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6 }}>{rv.review}</p>
                    </div>

                    {rv.tags?.length > 0 && (
                      <div className="app-docs-row">
                        {rv.tags.map(tag => (
                          <span key={tag} style={{ padding: "5px 12px", borderRadius: "999px", background: "rgba(251,191,36,0.08)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)", fontSize: "0.76rem", fontWeight: 700 }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {rv.recommend !== null && rv.recommend !== undefined && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 700 }}>
                        {rv.recommend
                          ? <><FiThumbsUp size={13} style={{ color: "#34d399" }} /><span style={{ color: "#34d399" }}>Recommends this mentor</span></>
                          : <><FiThumbsDown size={13} style={{ color: "#f87171" }} /><span style={{ color: "#f87171" }}>Does not recommend</span></>}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* DOCUMENT VIEWER MODAL */}
      {viewDoc && (
        <div className="doc-modal-overlay" onClick={() => setViewDoc(null)}>
          <div className="doc-modal" onClick={e => e.stopPropagation()}>
            <div className="doc-modal-header">
              <span><FiFileText size={16} style={{ marginRight: 6 }} />{viewDoc.name}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <a href={viewDoc.dataUrl} download={viewDoc.name} className="doc-download-btn">↓ Download</a>
                <button className="doc-close-btn" onClick={() => setViewDoc(null)}><FiX size={18} /></button>
              </div>
            </div>
            <iframe src={viewDoc.dataUrl} title={viewDoc.name} className="doc-viewer-frame" />
          </div>
        </div>
      )}

    </div>
  );
}
