import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SessionsPage.css";
import { FiCalendar, FiClock, FiUser, FiX, FiVideo, FiCheck, FiArrowLeft, FiMessageSquare } from "react-icons/fi";
import { getAuth } from "../utils/storage";


export default function SessionsPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [bookings, setBookings] = useState(() => {
    const stored = localStorage.getItem("userBookings");
    return stored ? JSON.parse(stored) : [];
  });

  const [filter, setFilter] = useState("all");

  const homeRoute = auth?.role === "provider" ? "/provider-home" : auth?.role === "admin" ? "/admin" : "/user-home";

  const displayedBookings = bookings.filter((booking) => {
    if (auth?.role === "user") {
      return booking.userId === auth.email;
    }
    if (auth?.role === "provider") {
      return booking.providerEmail === auth.email;
    }
    return true;
  });

  const filteredBookings = displayedBookings.filter((booking) => {
    if (filter === "upcoming") {
      return new Date(`${booking.date}T${booking.time}`) > new Date();
    } else if (filter === "completed") {
      return new Date(`${booking.date}T${booking.time}`) <= new Date();
    }
    return true;
  });

  const handleCancelBooking = (id) => {
    if (window.confirm("Are you sure you want to cancel this session?")) {
      setBookings(bookings.filter((b) => b.id !== id));
      const updated = bookings.filter((b) => b.id !== id);
      localStorage.setItem("userBookings", JSON.stringify(updated));
    }
  };

  const handleReschedule = (id) => {
    navigate("/mentors");
  };

  return (
    <div className="sessions-page">
      <div className="sessions-header">
        <button className="back-btn" onClick={() => navigate(homeRoute)}>
          <FiArrowLeft /> Back
        </button>
        <div>
          <h1>My Sessions</h1>
          <p>Manage your mentorship sessions</p>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="sessions-filter">
        {["all", "upcoming", "completed"].map((tab) => (
          <button
            key={tab}
            className={`filter-tab ${filter === tab ? "active" : ""}`}
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "all" && ` (${bookings.length})`}
            {tab === "upcoming" && ` (${bookings.filter(b => new Date(`${b.date}T${b.time}`) > new Date()).length})`}
            {tab === "completed" && ` (${bookings.filter(b => new Date(`${b.date}T${b.time}`) <= new Date()).length})`}
          </button>
        ))}
      </div>

      {/* SESSIONS LIST */}
      <div className="sessions-container">
        {filteredBookings.length > 0 ? (
          <div className="sessions-grid">
            {filteredBookings.map((booking) => {
              const isUpcoming = new Date(`${booking.date}T${booking.time}`) > new Date();
              return (
                <div key={booking.id} className={`session-card ${isUpcoming ? "upcoming" : "completed"}`}>
                  {/* HEADER */}
                  <div className="session-card-header">
                    <div className="mentor-info">
                      <div className="mentor-avatar">{booking.mentor.image}</div>
                      <div>
                        <h3>{booking.mentor.name}</h3>
                        <p>{booking.mentor.title}</p>
                      </div>
                    </div>
                    <div className={`status-badge ${isUpcoming ? "upcoming-badge" : "completed-badge"}`}>
                      {isUpcoming ? "Upcoming" : "Completed"}
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="session-details">
                    <div className="detail-item">
                      <FiCalendar size={18} />
                      <span>{booking.date}</span>
                    </div>
                    <div className="detail-item">
                      <FiClock size={18} />
                      <span>{booking.time} • {booking.duration} minutes</span>
                    </div>
                    <div className="detail-item">
                      <FiUser size={18} />
                      <span>Topic: {booking.description.substring(0, 40)}...</span>
                    </div>
                  </div>

                  {/* PRICE */}
                  <div className="session-price">
                    <span className="amount">${booking.totalPrice.toFixed(2)}</span>
                  </div>

                  {/* ACTIONS */}
                  <div className="session-actions">
                    {auth?.role !== "user" && booking.userId && (
                      <>
                        <button
                          className="profile-btn"
                          onClick={() => navigate(`/user-profile/${encodeURIComponent(booking.userId)}`)}
                        >
                          View User Profile
                        </button>
                        <button
                          className="msg-btn"
                          onClick={() => navigate("/messages", {
                            state: { openEmail: booking.userId, openName: booking.userId, openRole: "user" }
                          })}
                        >
                          <FiMessageSquare size={14} /> Message
                        </button>
                      </>
                    )}
                    {auth?.role === "user" && booking.providerEmail && (
                      <>
                        <button
                          className="profile-btn"
                          onClick={() => navigate(`/provider-profile/${encodeURIComponent(booking.providerEmail)}`)}
                        >
                          View Provider Profile
                        </button>
                        <button
                          className="msg-btn"
                          onClick={() => navigate("/messages", {
                            state: { openEmail: booking.providerEmail, openName: booking.mentor?.name || booking.providerEmail, openRole: "provider" }
                          })}
                        >
                          <FiMessageSquare size={14} /> Message
                        </button>
                      </>
                    )}
                    {isUpcoming ? (
                      <>
                        <button className="join-btn" onClick={() => navigate(`/meeting/${booking.id}`)}>
                          <FiVideo size={16} /> Join Session
                        </button>
                        <button
                          className="reschedule-btn"
                          onClick={() => handleReschedule(booking.id)}
                        >
                          Reschedule
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <FiX size={16} /> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="review-btn">
                          <FiCheck size={16} /> Leave Review
                        </button>
                        <button className="rebook-btn">
                          <FiVideo size={16} /> Book Again
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-sessions">
            <FiCalendar size={48} />
            <h2>No sessions yet</h2>
            <p>Book your first mentorship session and start learning!</p>
            <button className="book-first-btn" onClick={() => navigate("/mentors")}>
              Browse Mentors
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
