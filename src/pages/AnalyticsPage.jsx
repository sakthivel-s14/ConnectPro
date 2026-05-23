import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AnalyticsPage.css";
import { FiTrendingUp, FiCalendar, FiDollarSign, FiStar, FiBarChart2, FiUser, FiArrowLeft, FiActivity, FiTarget } from "react-icons/fi";
import { getAuth } from "../utils/storage";

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const homeRoute = auth?.role === "provider" ? "/provider-home" : auth?.role === "admin" ? "/admin" : "/user-home";
  const [bookings] = useState(() => {
    const stored = localStorage.getItem("userBookings");
    return stored ? JSON.parse(stored) : [];
  });

  const stats = {
    totalSessions: bookings.length,
    totalSpent: bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
    upcomingSessions: bookings.filter(b => new Date(`${b.date}T${b.time}`) > new Date()).length,
    averageRating: 4.8,
  };

  const sessionsByMonth = () => {
    const months = {};
    bookings.forEach((booking) => {
      const month = booking.date.substring(0, 7);
      months[month] = (months[month] || 0) + 1;
    });
    return months;
  };

  const topMentors = () => {
    const mentors = {};
    bookings.forEach((booking) => {
      const name = booking.mentor.name;
      mentors[name] = (mentors[name] || 0) + 1;
    });
    return Object.entries(mentors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const categories = () => {
    const cats = {};
    bookings.forEach((booking) => {
      const cat = booking.mentor.category || "other";
      cats[cat] = (cats[cat] || 0) + 1;
    });
    return cats;
  };

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        {/* HEADER */}
        <div className="analytics-header">
          <button className="back-btn" onClick={() => navigate(homeRoute)}>
            <FiArrowLeft size={18} /> Back
          </button>
          <div>
            <h1>Your Learning Analytics</h1>
            <p>Track your mentorship journey and progress</p>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-icon sessions">
              <FiCalendar size={32} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Sessions</p>
              <p className="stat-value">{stats.totalSessions}</p>
              <p className="stat-subtext">All time</p>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon spent">
              <FiDollarSign size={32} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Spent</p>
              <p className="stat-value">${stats.totalSpent.toFixed(2)}</p>
              <p className="stat-subtext">Investment in learning</p>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon upcoming">
              <FiTrendingUp size={32} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Upcoming Sessions</p>
              <p className="stat-value">{stats.upcomingSessions}</p>
              <p className="stat-subtext">Scheduled ahead</p>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon rating">
              <FiStar size={32} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Average Rating</p>
              <p className="stat-value">{stats.averageRating}</p>
              <p className="stat-subtext">Based on feedback</p>
            </div>
          </div>
        </div>

        {/* CHARTS GRID */}
        <div className="charts-grid">
          {/* SESSIONS BY MONTH */}
          <div className="chart-card">
            <h2>Sessions by Month</h2>
            {Object.keys(sessionsByMonth()).length > 0 ? (
              <div className="bar-chart">
                {Object.entries(sessionsByMonth())
                  .sort()
                  .map(([month, count]) => (
                    <div key={month} className="bar-item">
                      <div className="bar-label">{month}</div>
                      <div className="bar-container">
                        <div
                          className="bar-fill"
                          style={{
                            height: `${Math.min(count * 30, 150)}px`,
                          }}
                        />
                      </div>
                      <div className="bar-value">{count}</div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="no-data">No session data yet</p>
            )}
          </div>

          {/* CATEGORY BREAKDOWN */}
          <div className="chart-card">
            <h2>Sessions by Category</h2>
            {Object.keys(categories()).length > 0 ? (
              <div className="category-list">
                {Object.entries(categories())
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, count]) => (
                    <div key={category} className="category-item">
                      <div className="category-info">
                        <span className="category-name">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                        <span className="category-count">{count}</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${(count / Math.max(...Object.values(categories()))) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="no-data">No category data yet</p>
            )}
          </div>
        </div>

        {/* TOP MENTORS */}
        <div className="top-mentors-card">
          <h2>Your Top Mentors</h2>
          {topMentors().length > 0 ? (
            <div className="mentors-list">
              {topMentors().map(([name, count], index) => (
                <div key={name} className="mentor-row">
                  <div className="mentor-rank">#{index + 1}</div>
                  <div className="mentor-name">{name}</div>
                  <div className="mentor-sessions">{count} sessions</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No mentor data yet</p>
          )}
        </div>

        {/* PROGRESS OVERVIEW */}
        <div className="progress-overview">
          <h2>Learning Progress Overview</h2>
          <div className="progress-grid">
            <div className="progress-item">
              <div className="progress-circle" style={{ background: "conic-gradient(#667eea 0deg 180deg, #f0f0f0 180deg)" }}>
                <div className="progress-text">50%</div>
              </div>
              <p>Learning Consistency</p>
            </div>
            <div className="progress-item">
              <div className="progress-circle" style={{ background: "conic-gradient(#764ba2 0deg 200deg, #f0f0f0 200deg)" }}>
                <div className="progress-text">56%</div>
              </div>
              <p>Goal Completion</p>
            </div>
            <div className="progress-item">
              <div className="progress-circle" style={{ background: "conic-gradient(#27ae60 0deg 240deg, #f0f0f0 240deg)" }}>
                <div className="progress-text">67%</div>
              </div>
              <p>Skill Improvement</p>
            </div>
            <div className="progress-item">
              <div className="progress-circle" style={{ background: "conic-gradient(#f39c12 0deg 160deg, #f0f0f0 160deg)" }}>
                <div className="progress-text">44%</div>
              </div>
              <p>Mentorship ROI</p>
            </div>
          </div>
        </div>

        {/* INSIGHTS */}
        <div className="insights-card">
          <h2>Key Insights</h2>
          <div className="insights-list">
            <div className="insight-item">
              <span className="insight-icon"><FiActivity size={20} /></span>
              <div className="insight-text">
                <p className="insight-title">Keep Growing</p>
                <p className="insight-desc">You've completed {stats.totalSessions} sessions so far. Keep booking to accelerate your growth!</p>
              </div>
            </div>
            <div className="insight-item">
              <span className="insight-icon"><FiTarget size={20} /></span>
              <div className="insight-text">
                <p className="insight-title">Focus on Frontend</p>
                <p className="insight-desc">Most of your sessions are with frontend mentors. Consider exploring other specializations.</p>
              </div>
            </div>
            <div className="insight-item">
              <span className="insight-icon"><FiStar size={20} /></span>
              <div className="insight-text">
                <p className="insight-title">Excellent Progress</p>
                <p className="insight-desc">Your 4.8 rating shows great engagement. Keep up the momentum!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
