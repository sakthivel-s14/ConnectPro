import React, { useState } from "react";
import { getCurrentProfile, removeAuth } from "../utils/storage";

import "../styles/UserHome.css";

import { Link, useNavigate } from "react-router-dom";

import {
  FiHome,
  FiCalendar,
  FiSettings,
  FiBell,
  FiSearch,
  FiBook,
  FiMessageSquare,
  FiTrendingUp,
  FiLogOut,
  FiUser,
  FiMenu,
  FiX,
  FiZap,
  FiBarChart2,
  FiActivity,
  FiUsers,
} from "react-icons/fi";

export default function UserHome() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(() => getCurrentProfile() || {});

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  }

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      removeAuth();
      navigate("/login");
    }
  };

  const bookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
  const upcomingBookings = bookings.filter(b => new Date(`${b.date}T${b.time}`) > new Date());

  return (
    <div className="user-home">
      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* LOGO */}
        <div>
          <div className="sidebar-header">
            <div className="logo-circle">C</div>
            <div>
              <h2 className="logo-text">ConnectPro</h2>
              <p className="logo-subtitle">Dashboard</p>
            </div>
          </div>

          {/* QUICK STATUS */}
          <div className="status-box">
            <span className="status-icon"><FiZap size={18} /></span>
            <p>Learning actively</p>
          </div>

          {/* MENU */}
          <div className="menu-section">
            <p className="menu-title">Manage</p>
            <ul>
              <li className="active-menu" onClick={() => { setSidebarOpen(false); }}>
                <span><FiHome size={18} /></span>
                <span>Home</span>
              </li>
              <li onClick={() => { navigate("/mentors"); setSidebarOpen(false); }}>
                <span><FiUsers size={18} /></span>
                <span>Find Mentors</span>
              </li>
              <li onClick={() => { navigate("/sessions"); setSidebarOpen(false); }}>
                <span><FiCalendar size={18} /></span>
                <span>My Sessions</span>
              </li>
              <li onClick={() => { navigate("/analytics"); setSidebarOpen(false); }}>
                <span><FiTrendingUp size={18} /></span>
                <span>Analytics</span>
              </li>
            </ul>
          </div>

          {/* SETTINGS SECTION */}
          <div className="menu-section">
            <p className="menu-title">Account</p>
            <ul>
              <li onClick={() => { navigate("/profile"); setSidebarOpen(false); }}>
                <span><FiUser size={18} /></span>
                <span>Profile</span>
              </li>
              <li onClick={() => { navigate("/settings"); setSidebarOpen(false); }}>
                <span><FiSettings size={18} /></span>
                <span>Settings</span>
              </li>
              <li onClick={handleLogout} style={{ color: "#ff6b6b" }}>
                <span><FiLogOut size={18} /></span>
                <span>Logout</span>
              </li>
            </ul>
          </div>
        </div>

        {/* PROFILE */}
        <div className="sidebar-profile">
          <div className="profile-avatar"><FiUser size={24} /></div>
          <div>
            <h4>{user.name || "User"}</h4>
            <p>Learner</p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {/* TOPBAR */}
        <div className="topbar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* SEARCH */}
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search mentors, sessions..." />
          </div>

          {/* RIGHT */}
          <div className="top-icons">
            <button className="icon-btn" onClick={() => navigate("/notifications")}> 
              <FiBell size={20} />
              {upcomingBookings.length > 0 && (
                <span className="notification-badge">{upcomingBookings.length}</span>
              )}
            </button>
            <button className="icon-btn" onClick={() => navigate("/messages")}> 
              <FiMessageSquare size={20} />
            </button>
            <button
              className="profile-btn"
              onClick={() => navigate("/profile")}
              title="Profile"
            >
              <FiUser size={20} />
            </button>
          </div>
        </div>

        {/* GREETING SECTION */}
        <div className="greeting-section">
          <h1>{greeting}</h1>
          <h2>Welcome back, {user.name || "User"}!</h2>
        </div>

        {/* HERO SECTION */}
        <div className="hero-section">
          <div className="hero-left">
            <span className="hero-tag">Your Dashboard</span>
            <h2>
              Continue Growing
              <br />
              Your Career
            </h2>
            <p>
              Learn from industry experts, attend mentorship sessions, and unlock your
              professional potential.
            </p>
            <div className="hero-buttons">
              <button className="primary-btn" onClick={() => navigate("/mentors")}> 
                <FiSearch size={18} /> Explore Mentors
              </button>
              <button className="secondary-btn" onClick={() => navigate("/sessions")}>
                <FiCalendar size={18} /> My Sessions
              </button>
            </div>
          </div>

          {/* PROGRESS CARD */}
          <div className="progress-card">
            <h2>Career Progress</h2>
            <div className="progress-stats">
              <div>
                <h3>{bookings.length}</h3>
                <p>Sessions</p>
              </div>
              <div>
                <h3>{upcomingBookings.length}</h3>
                <p>Upcoming</p>
              </div>
              <div>
                <h3>${bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0).toFixed(0)}</h3>
                <p>Invested</p>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "75%" }}></div>
            </div>
            <span className="progress-text">75% Learning Progress</span>
          </div>
        </div>

        {/* DASHBOARD GRID */}
        <div className="dashboard-grid">
          {/* UPCOMING SESSION */}
          <div className="dashboard-card">
            <div className="card-icon"><FiCalendar size={24} /></div>
            <h3>Next Session</h3>
            {upcomingBookings.length > 0 ? (
              <>
                <p className="card-title">{upcomingBookings[0].mentor.name}</p>
                <p className="card-date">
                  {upcomingBookings[0].date} • {upcomingBookings[0].time}
                </p>
                <button className="card-btn" onClick={() => navigate("/sessions")}>
                  View Sessions →
                </button>
              </>
            ) : (
              <>
                <p className="no-data">No upcoming sessions</p>
                <button className="card-btn" onClick={() => navigate("/mentors")}>
                  Book Now →
                </button>
              </>
            )}
          </div>

          {/* STATS */}
          <div className="dashboard-card">
            <div className="card-icon"><FiBarChart2 size={24} /></div>
            <h3>Statistics</h3>
            <div className="stats-mini">
              <div>
                <p className="stat-number">{bookings.length}</p>
                <p className="stat-label">Total Sessions</p>
              </div>
              <div>
                <p className="stat-number">${bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0).toFixed(0)}</p>
                <p className="stat-label">Total Spent</p>
              </div>
            </div>
            <button className="card-btn" onClick={() => navigate("/analytics")}>
              View Analytics →
            </button>
          </div>

          {/* QUICK ACTIONS */}
          <div className="dashboard-card">
            <div className="card-icon"><FiZap size={24} /></div>
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <button onClick={() => navigate("/mentors")}>Find Mentor</button>
              <button onClick={() => navigate("/sessions")}>My Sessions</button>
              <button onClick={() => navigate("/profile")}>Edit Profile</button>
            </div>
          </div>

          {/* LEARNING TIPS */}
          <div className="dashboard-card">
            <div className="card-icon"><FiActivity size={24} /></div>
            <h3>Learning Tip</h3>
            <p className="tip-text">
              "Consistency is key! Book regular sessions with your mentors to see faster progress in your career."
            </p>
            <p className="tip-source">- ConnectPro Tips</p>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="activity-section">
          <h2>Recent Activity</h2>
          {bookings.length > 0 ? (
            <div className="activity-list">
              {bookings.slice(-3).map((booking, idx) => (
                <div key={idx} className="activity-item">
                  <span className="activity-date">{booking.date}</span>
                  <span className="activity-text">
                    Booked session with {booking.mentor.name}
                  </span>
                  <span className="activity-price">${booking.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-activity">No bookings yet. Start your learning journey today!</p>
          )}
        </div>
      </div>
    </div>
  );
}
