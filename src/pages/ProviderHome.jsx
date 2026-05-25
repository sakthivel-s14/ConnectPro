import React, { useMemo, useState } from "react";
import "../styles/ProviderHome.css";
import { useNavigate } from "react-router-dom";
import { getCurrentProfile, removeAuth } from "../utils/storage";
import {
  FiHome, FiCalendar, FiClock, FiTrendingUp, FiBell,
  FiMessageSquare, FiSettings, FiDollarSign, FiUser,
  FiZap, FiLogOut, FiMenu, FiX, FiSearch, FiUsers,
  FiStar, FiBarChart2, FiActivity, FiCheck, FiArrowRight,
} from "react-icons/fi";

export default function ProviderHome() {
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch]           = useState("");
  const [activeMenu, setActiveMenu]   = useState("dashboard");

  const provider = useMemo(() => getCurrentProfile(), []);

  const bookings = useMemo(() => {
    const stored = localStorage.getItem("userBookings");
    return stored ? JSON.parse(stored) : [];
  }, []);

  const providerBookings = useMemo(() => {
    if (!provider) return [];
    return bookings.filter(b => b.providerEmail === provider.email);
  }, [bookings, provider]);

  const upcomingSessions = providerBookings.filter(
    b => new Date(`${b.date}T${b.time}`) > new Date()
  );

  const completedSessions = providerBookings.filter(
    b => new Date(`${b.date}T${b.time}`) <= new Date()
  );

  const totalEarnings = providerBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      removeAuth();
      navigate("/login");
    }
  };

  const navGo = (path, id) => {
    setActiveMenu(id);
    setSidebarOpen(false);
    navigate(path);
  };

  // Filter bookings by search
  const filteredBookings = providerBookings.filter(b =>
    !search || b.mentor?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.date?.includes(search)
  );

  if (!provider) {
    return (
      <div className="provider-home">
        <div className="provider-main" style={{ marginLeft: 0, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ marginBottom: 12 }}>Provider account not found</h2>
            <p style={{ color: "#64748b", marginBottom: 24 }}>Please sign up as a provider to access the dashboard.</p>
            <button className="primary-provider-btn" onClick={() => navigate("/provider-signup")}>Become a Provider</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-home">

      {/* OVERLAY for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ===== SIDEBAR ===== */}
      <div className={`provider-sidebar ${sidebarOpen ? "open" : ""}`}>

        {/* LOGO */}
        <div className="provider-logo-section">
          <div className="provider-logo-circle">C</div>
          <div>
            <h2 className="provider-logo">ConnectPro</h2>
            <p className="provider-subtitle">Provider Dashboard</p>
          </div>
        </div>

        {/* STATUS */}
        <div className="provider-status-box">
          <div className="status-icon"><FiZap size={16} /></div>
          <p>Mentorship Active</p>
        </div>

        {/* NAV SECTIONS */}
        <div className="sidebar-nav-groups">
          <div className="provider-menu-section">
            <p className="provider-menu-title">Manage</p>
            <ul>
              <li className={activeMenu === "dashboard" ? "active-provider-menu" : ""} onClick={() => navGo("/provider-home", "dashboard")}>
                <span><FiHome size={17} /></span> Dashboard
              </li>
              <li className={activeMenu === "sessions" ? "active-provider-menu" : ""} onClick={() => navGo("/sessions", "sessions")}>
                <span><FiCalendar size={17} /></span> Session Bookings
                {upcomingSessions.length > 0 && <span className="sidebar-badge">{upcomingSessions.length}</span>}
              </li>
              <li className={activeMenu === "calendar" ? "active-provider-menu" : ""} onClick={() => navGo("/calendar", "calendar")}>
                <span><FiClock size={17} /></span> Calendar
              </li>
              <li className={activeMenu === "profile" ? "active-provider-menu" : ""} onClick={() => navGo("/profile", "profile")}>
                <span><FiUser size={17} /></span> My Profile
              </li>
            </ul>
          </div>

          <div className="provider-menu-section">
            <p className="provider-menu-title">Insights</p>
            <ul>
              <li className={activeMenu === "analytics" ? "active-provider-menu" : ""} onClick={() => navGo("/analytics", "analytics")}>
                <span><FiTrendingUp size={17} /></span> Analytics
              </li>
              <li className={activeMenu === "messages" ? "active-provider-menu" : ""} onClick={() => navGo("/messages", "messages")}>
                <span><FiMessageSquare size={17} /></span> Messages
              </li>
              <li className={activeMenu === "notifications" ? "active-provider-menu" : ""} onClick={() => navGo("/notifications", "notifications")}>
                <span><FiBell size={17} /></span> Notifications
              </li>
            </ul>
          </div>

          <div className="provider-menu-section">
            <p className="provider-menu-title">Account</p>
            <ul>
              <li className={activeMenu === "settings" ? "active-provider-menu" : ""} onClick={() => navGo("/settings", "settings")}>
                <span><FiSettings size={17} /></span> Settings
              </li>
              <li className="logout-menu-item" onClick={handleLogout}>
                <span><FiLogOut size={17} /></span> Logout
              </li>
            </ul>
          </div>
        </div>

        {/* PROFILE */}
        <div className="provider-profile-box" onClick={() => navigate("/profile")}>
          <img src={`https://i.pravatar.cc/100?u=${provider.email}`} alt="profile" />
          <div>
            <h4>{provider.name}</h4>
            <p>{provider.skills || "Professional Mentor"}</p>
          </div>
        </div>

      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="provider-main">

        {/* TOP NAVBAR */}
        <div className="provider-navbar">
          <button className="provider-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          <div className="provider-search">
            <FiSearch className="search-icon-inner" size={16} />
            <input
              type="text"
              placeholder="Search sessions, clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="provider-nav-right">
            <button className="notification-btn" onClick={() => navigate("/notifications")}>
              <FiBell size={18} />
            </button>
            <button className="notification-btn" onClick={() => navigate("/messages")}>
              <FiMessageSquare size={18} />
            </button>
            <img
              src={`https://i.pravatar.cc/100?u=${provider.email}`}
              alt="profile"
              className="top-profile"
              onClick={() => navigate("/profile")}
            />
          </div>
        </div>

        {/* GREETING */}
        <div className="provider-greeting">
          <h1>{greeting}, <span className="greeting-name">{provider.name.split(" ")[0]}</span> 👋</h1>
          <p>Here's your mentorship overview for today.</p>
        </div>

        {/* STATS STRIP */}
        <div className="provider-stats-strip">
          <div className="stat-strip-card indigo">
            <div className="stat-strip-icon"><FiDollarSign size={20} /></div>
            <div>
              <h2>₹{totalEarnings.toFixed(0)}</h2>
              <p>Total Earnings</p>
            </div>
          </div>
          <div className="stat-strip-card green">
            <div className="stat-strip-icon"><FiCalendar size={20} /></div>
            <div>
              <h2>{providerBookings.length}</h2>
              <p>Total Sessions</p>
            </div>
          </div>
          <div className="stat-strip-card amber">
            <div className="stat-strip-icon"><FiClock size={20} /></div>
            <div>
              <h2>{upcomingSessions.length}</h2>
              <p>Upcoming</p>
            </div>
          </div>
          <div className="stat-strip-card purple" onClick={() => navigate("/reviews")}>
            <div className="stat-strip-icon"><FiStar size={20} /></div>
            <div>
              <h2>
                {(() => {
                  const allReviews = JSON.parse(localStorage.getItem("connectpro_reviews") || "[]");
                  const myReviews = allReviews.filter(r => r.providerEmail === provider?.email);
                  if (myReviews.length === 0) return "—";
                  const avg = myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length;
                  return avg.toFixed(1);
                })()}
              </h2>
              <p>Avg Rating</p>
            </div>
          </div>
        </div>

        {/* HERO + PERFORMANCE */}
        <div className="provider-hero">

          <div className="provider-hero-left">
            <div className="hero-badge">
              <FiZap size={14} /> Provider Dashboard
            </div>
            <h2>Grow Your<br />Mentorship Career</h2>
            <p>
              Manage bookings, conduct mentorship sessions,
              track earnings, and build your professional brand.
            </p>
            <div className="provider-hero-buttons">
              <button className="primary-provider-btn" onClick={() => navigate("/sessions")}>
                <FiCalendar size={16} /> View Sessions
              </button>
              <button className="secondary-provider-btn" onClick={() => navigate("/profile")}>
                <FiUser size={16} /> Edit Profile
              </button>
            </div>

            {/* QUICK ACTIONS */}
            <div className="provider-quick-actions">
              <button className="pqa-btn" onClick={() => navigate("/analytics")}>
                <FiBarChart2 size={16} /> Analytics <FiArrowRight size={14} />
              </button>
              <button className="pqa-btn" onClick={() => navigate("/calendar")}>
                <FiCalendar size={16} /> Calendar <FiArrowRight size={14} />
              </button>
              <button className="pqa-btn" onClick={() => navigate("/settings")}>
                <FiSettings size={16} /> Settings <FiArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* PERFORMANCE CARD */}
          <div className="provider-progress-card">
            <div className="progress-card-header">
              <h3>Performance Summary</h3>
              <span className="perf-badge">This Month</span>
            </div>

            <div className="provider-stats-row">
              <div>
                <p>Sessions</p>
                <h2>{providerBookings.length}</h2>
              </div>
              <div>
                <p>Upcoming</p>
                <h2>{upcomingSessions.length}</h2>
              </div>
              <div>
                <p>Earnings</p>
                <h2>₹{totalEarnings.toFixed(0)}</h2>
              </div>
            </div>

            {/* MINI BAR */}
            <div className="perf-bar-wrap">
              <div className="perf-bar-label">
                <span>Session Completion</span>
                <span>{providerBookings.length > 0 ? Math.round((completedSessions.length / providerBookings.length) * 100) : 0}%</span>
              </div>
              <div className="perf-bar-track">
                <div
                  className="perf-bar-fill"
                  style={{ width: providerBookings.length > 0 ? `${(completedSessions.length / providerBookings.length) * 100}%` : "0%" }}
                />
              </div>
            </div>

            {/* SKILL TAGS */}
            {provider.skills && (
              <div className="skill-tags">
                {provider.skills.split(",").slice(0, 4).map((s, i) => (
                  <span key={i} className="skill-tag">{s.trim()}</span>
                ))}
              </div>
            )}

            <p className="progress-text">
              <FiCheck size={14} /> Excellent provider profile performance
            </p>
          </div>

        </div>

        {/* BOOKINGS + UPCOMING */}
        <div className="provider-cards">

          {/* RECENT BOOKINGS */}
          <div className="provider-card">
            <div className="pcard-header">
              <h3><FiActivity size={15} /> Recent Sessions</h3>
              <button className="pcard-link" onClick={() => navigate("/sessions")}>View All →</button>
            </div>

            {filteredBookings.length > 0 ? (
              <div className="booking-list">
                {filteredBookings.slice(0, 4).map((b, i) => (
                  <div key={i} className="booking-row">
                    <img
                      src={`https://i.pravatar.cc/40?u=${b.userId || i}`}
                      alt="learner"
                      className="booking-avatar"
                      style={{ cursor: b.userId ? "pointer" : "default" }}
                      onClick={() => b.userId && navigate(`/user-profile/${encodeURIComponent(b.userId)}`)}
                    />
                    <div
                      className="booking-info"
                      style={{ cursor: b.userId ? "pointer" : "default", flex: 1 }}
                      onClick={() => b.userId && navigate(`/user-profile/${encodeURIComponent(b.userId)}`)}
                    >
                      <p className="booking-name">{b.userId ? b.userId.split("@")[0] : "Learner"}</p>
                      <p className="booking-meta">{b.date} • {b.time} • {b.duration}min</p>
                    </div>
                    <div className="booking-right">
                      <span className="booking-price">₹{(b.totalPrice || 0).toFixed(0)}</span>
                      <span className={`booking-status ${new Date(`${b.date}T${b.time}`) > new Date() ? "upcoming" : "done"}`}>
                        {new Date(`${b.date}T${b.time}`) > new Date() ? "Upcoming" : "Done"}
                      </span>
                      {b.userId && (
                        <button
                          className="prow-msg-btn"
                          title="Message this learner"
                          onClick={e => { e.stopPropagation(); navigate("/messages", { state: { openEmail: b.userId, openName: b.userId.split("@")[0], openRole: "user" } }); }}
                        >
                          <span style={{ fontSize: "0.75rem" }}>✉</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-card-state">
                <FiUsers size={32} />
                <p>No sessions yet</p>
                <span>Bookings from learners will appear here</span>
              </div>
            )}
          </div>

          {/* UPCOMING SESSION */}
          <div className="provider-card">
            <div className="pcard-header">
              <h3><FiClock size={15} /> Next Session</h3>
              <button className="pcard-link" onClick={() => navigate("/sessions")}>All Sessions →</button>
            </div>

            {upcomingSessions[0] ? (
              <div className="next-session-card">
                <img
                  src={`https://i.pravatar.cc/80?u=${upcomingSessions[0].userEmail}`}
                  alt="learner"
                  className="next-session-avatar"
                />
                <div>
                  <p className="next-session-name">{upcomingSessions[0].mentor?.name || "Learner"}</p>
                  <p className="next-session-date">
                    <FiCalendar size={13} /> {upcomingSessions[0].date}
                  </p>
                  <p className="next-session-time">
                    <FiClock size={13} /> {upcomingSessions[0].time} • {upcomingSessions[0].duration} min
                  </p>
                </div>
                <button className="join-session-btn" onClick={() => navigate(`/meeting/${Date.now()}`)}>
                  Join Session
                </button>
              </div>
            ) : (
              <div className="empty-card-state">
                <FiCalendar size={32} />
                <p>No upcoming sessions</p>
                <span>Your schedule is clear</span>
              </div>
            )}

            <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "16px 0" }} />

            <div className="pcard-header">
              <h3><FiBarChart2 size={15} /> Performance</h3>
            </div>
            <div className="perf-mini-stats">
              <div className="perf-mini-item">
                <span className="perf-mini-val">{providerBookings.length}</span>
                <span className="perf-mini-lbl">Total</span>
              </div>
              <div className="perf-mini-item">
                <span className="perf-mini-val">{completedSessions.length}</span>
                <span className="perf-mini-lbl">Done</span>
              </div>
              <div className="perf-mini-item">
                <span className="perf-mini-val">98%</span>
                <span className="perf-mini-lbl">Rating</span>
              </div>
              <div className="perf-mini-item">
                <span className="perf-mini-val">₹{totalEarnings > 0 ? (totalEarnings / Math.max(providerBookings.length, 1)).toFixed(0) : "0"}</span>
                <span className="perf-mini-lbl">Avg Earn</span>
              </div>
            </div>
          </div>

        </div>

        {/* REVIEWS SECTION */}
        {(() => {
          const allReviews = JSON.parse(localStorage.getItem("connectpro_reviews") || "[]");
          const myReviews = allReviews.filter(r => r.providerEmail === provider?.email)
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
          const avgRating = myReviews.length
            ? (myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length).toFixed(1)
            : null;

          return (
            <div className="provider-card" style={{ marginTop: 24 }}>
              <div className="pcard-header">
                <h3 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <FiStar size={15} style={{ color: "#f59e0b" }} /> My Reviews
                  {avgRating && (
                    <span style={{ marginLeft: 8, fontSize: "0.78rem", background: "rgba(251,191,36,0.12)", color: "#f59e0b", padding: "2px 10px", borderRadius: "999px", fontWeight: 800, border: "1px solid rgba(251,191,36,0.25)" }}>
                      ★ {avgRating} · {myReviews.length} review{myReviews.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </h3>
              </div>

              {myReviews.length === 0 ? (
                <div className="empty-card-state">
                  <FiStar size={32} style={{ color: "#f59e0b" }} />
                  <p>No reviews yet</p>
                  <span>Reviews from your sessions will appear here</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "4px 0" }}>
                  {myReviews.slice(0, 3).map(rv => (
                    <div key={rv.id} style={{ background: "#f8fafc", borderRadius: 14, padding: "14px 16px", border: "1.5px solid #f1f5f9" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#5b6ef8,#7c3aed)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 900, fontSize: "0.85rem" }}>
                            {rv.userName?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a", margin: 0 }}>{rv.userName}</p>
                            <p style={{ fontSize: "0.72rem", color: "#94a3b8", margin: 0 }}>{rv.sessionDate || "Session"}</p>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 2 }}>
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{ fontSize: "0.85rem", color: rv.rating >= s ? "#f59e0b" : "#e2e8f0" }}>★</span>
                          ))}
                        </div>
                      </div>
                      <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1e293b", marginBottom: 4 }}>"{rv.title}"</p>
                      <p style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.5, marginBottom: rv.tags?.length ? 8 : 0 }}>
                        {rv.review.length > 120 ? rv.review.substring(0, 120) + "…" : rv.review}
                      </p>
                      {rv.tags?.length > 0 && (
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {rv.tags.slice(0, 3).map(tag => (
                            <span key={tag} style={{ padding: "2px 9px", borderRadius: "999px", background: "rgba(91,110,248,0.07)", color: "#5b6ef8", fontSize: "0.7rem", fontWeight: 700, border: "1px solid rgba(91,110,248,0.15)" }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {myReviews.length > 3 && (
                    <p style={{ fontSize: "0.82rem", color: "#5b6ef8", fontWeight: 700, textAlign: "center", cursor: "pointer", padding: "4px 0" }}>
                      View all {myReviews.length} reviews →
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })()}

      </div>
    </div>
  );
}