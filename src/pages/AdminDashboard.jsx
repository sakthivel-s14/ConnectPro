import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";
import { FiUsers, FiShield, FiDollarSign, FiTrendingUp, FiBell, FiCheckCircle, FiTrash2, FiEye, FiArrowRight } from "react-icons/fi";
import { getStoredUsers, getStoredProviders } from "../utils/storage";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const users = getStoredUsers();
  const providers = getStoredProviders();
  const bookings = JSON.parse(localStorage.getItem("userBookings") || "[]");

  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchUser, setSearchUser] = useState("");
  const [searchProvider, setSearchProvider] = useState("");

  const stats = useMemo(() => {
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    return {
      users: users.length,
      providers: providers.length,
      revenue: totalRevenue,
      sessionsToday: bookings.filter(b => {
        const bookingDate = new Date(b.date);
        const today = new Date();
        return bookingDate.toDateString() === today.toDateString();
      }).length,
      completedSessions: bookings.filter(b => new Date(`${b.date}T${b.time}`) < new Date()).length,
    };
  }, [users, providers, bookings]);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(searchProvider.toLowerCase()) ||
    p.email.toLowerCase().includes(searchProvider.toLowerCase())
  );

  const handleDeleteUser = (email) => {
    if (window.confirm(`Delete user ${email}? This cannot be undone.`)) {
      const updated = users.filter(u => u.email !== email);
      localStorage.setItem("connectpro_users", JSON.stringify(updated));
      window.location.reload();
    }
  };

  const handleDeleteProvider = (email) => {
    if (window.confirm(`Delete provider ${email}? This cannot be undone.`)) {
      const updated = providers.filter(p => p.email !== email);
      localStorage.setItem("connectpro_providers", JSON.stringify(updated));
      window.location.reload();
    }
  };

  const recentActions = [
    ...users.slice(-3).map(u => ({
      id: u.email,
      action: "New user registered",
      user: u.name,
      time: "recently",
      type: "user"
    })),
    ...providers.slice(-2).map(p => ({
      id: p.email,
      action: "New provider registered",
      user: p.name,
      time: "recently",
      type: "provider"
    }))
  ].sort(() => Math.random() - 0.5).slice(0, 5);

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Admin Control Center</h1>
          <p>Monitor platform health, users, providers, and revenue performance.</p>
        </div>
        <button className="admin-action" onClick={() => navigate("/")}>← Platform Home</button>
      </div>

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
      </div>

      {/* TAB NAVIGATION */}
      <div className="admin-tabs">
        <button className={`tab ${selectedTab === "overview" ? "active" : ""}`} onClick={() => setSelectedTab("overview")}>Overview</button>
        <button className={`tab ${selectedTab === "users" ? "active" : ""}`} onClick={() => setSelectedTab("users")}>Users ({stats.users})</button>
        <button className={`tab ${selectedTab === "providers" ? "active" : ""}`} onClick={() => setSelectedTab("providers")}>Providers ({stats.providers})</button>
        <button className={`tab ${selectedTab === "sessions" ? "active" : ""}`} onClick={() => setSelectedTab("sessions")}>Sessions ({bookings.length})</button>
      </div>

      {/* OVERVIEW TAB */}
      {selectedTab === "overview" && (
        <div className="admin-overview">
          <div className="admin-columns">
            <div className="admin-panel">
              <div className="panel-header">
                <h2>Platform Statistics</h2>
              </div>
              <div className="stats-detail">
                <div className="stat-row">
                  <span>Total Users</span>
                  <strong>{stats.users}</strong>
                </div>
                <div className="stat-row">
                  <span>Total Providers</span>
                  <strong>{stats.providers}</strong>
                </div>
                <div className="stat-row">
                  <span>Total Bookings</span>
                  <strong>{bookings.length}</strong>
                </div>
                <div className="stat-row">
                  <span>Completed Sessions</span>
                  <strong>{stats.completedSessions}</strong>
                </div>
                <div className="stat-row">
                  <span>Total Revenue</span>
                  <strong>${stats.revenue.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <div className="admin-panel activity-panel">
              <div className="panel-header">
                <h2>Recent Activity</h2>
                <span>{recentActions.length} updates</span>
              </div>
              <div className="activity-list">
                {recentActions.length > 0 ? recentActions.map((item) => (
                  <div key={item.id} className="activity-item">
                    <div className="activity-icon"><FiCheckCircle size={18} /></div>
                    <div>
                      <p className="activity-action">{item.action}</p>
                      <span>{item.user} • {item.time}</span>
                    </div>
                  </div>
                )) : <p style={{padding: "20px", color: "#999"}}>No recent activity</p>}
              </div>
            </div>
          </div>

          <div className="admin-insights">
            <div className="insight-card">
              <FiBell size={22} />
              <div>
                <p>Platform is running smoothly</p>
                <strong>{users.length + providers.length} total accounts</strong>
              </div>
            </div>
            <div className="insight-card">
              <FiDollarSign size={22} />
              <div>
                <p>Revenue from bookings</p>
                <strong>${stats.revenue.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {selectedTab === "users" && (
        <div className="admin-users-section">
          <div className="section-header">
            <h2>Users Management ({stats.users} total)</h2>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="search-input"
            />
          </div>
          
          {filteredUsers.length > 0 ? (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Bookings</th>
                    <th>Total Spent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const userBookings = bookings.filter(b => b.userId === user.email);
                    const spent = userBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
                    return (
                      <tr key={user.email}>
                        <td><strong>{user.name}</strong></td>
                        <td>{user.email}</td>
                        <td>{userBookings.length}</td>
                        <td>${spent.toFixed(2)}</td>
                        <td>
                          <button
                            className="btn-view"
                            onClick={() => navigate(`/user-profile/${encodeURIComponent(user.email)}`)}
                            title="View user profile"
                          >
                            <FiEye size={16} />
                          </button>
                          <button className="btn-delete" onClick={() => handleDeleteUser(user.email)} title="Delete user">
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-results">No users found</div>
          )}
        </div>
      )}

      {/* PROVIDERS TAB */}
      {selectedTab === "providers" && (
        <div className="admin-providers-section">
          <div className="section-header">
            <h2>Providers Management ({stats.providers} total)</h2>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchProvider}
              onChange={(e) => setSearchProvider(e.target.value)}
              className="search-input"
            />
          </div>

          {filteredProviders.length > 0 ? (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Skills</th>
                    <th>Sessions</th>
                    <th>Earnings</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviders.map((provider) => {
                    const providerBookings = bookings.filter(b => b.providerEmail === provider.email);
                    const earnings = providerBookings.reduce((sum, b) => sum + (b.totalPrice || 0) * 0.8, 0);
                    return (
                      <tr key={provider.email}>
                        <td><strong>{provider.name}</strong></td>
                        <td>{provider.email}</td>
                        <td>{provider.skills}</td>
                        <td>{providerBookings.length}</td>
                        <td>${earnings.toFixed(2)}</td>
                        <td>
                          <button
                            className="btn-view"
                            onClick={() => navigate(`/provider-profile/${encodeURIComponent(provider.email)}`)}
                            title="View provider profile"
                          >
                            <FiEye size={16} />
                          </button>
                          <button className="btn-delete" onClick={() => handleDeleteProvider(provider.email)} title="Delete provider">
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-results">No providers found</div>
          )}
        </div>
      )}

      {/* SESSIONS TAB */}
      {selectedTab === "sessions" && (
        <div className="admin-sessions-section">
          <div className="section-header">
            <h2>All Sessions ({bookings.length} total)</h2>
          </div>

          {bookings.length > 0 ? (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mentor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const isUpcoming = new Date(`${booking.date}T${booking.time}`) > new Date();
                    return (
                      <tr key={booking.id}>
                        <td><strong>{booking.mentor?.name || "N/A"}</strong></td>
                        <td>{booking.date}</td>
                        <td>{booking.time}</td>
                        <td>{booking.duration} min</td>
                        <td>${booking.totalPrice?.toFixed(2) || "0.00"}</td>
                        <td>
                          <span className={`status ${isUpcoming ? "upcoming" : "completed"}`}>
                            {isUpcoming ? "Upcoming" : "Completed"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-results">No sessions found</div>
          )}
        </div>
      )}
    </div>
  );
}

