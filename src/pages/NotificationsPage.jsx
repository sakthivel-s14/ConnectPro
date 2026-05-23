import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NotificationsPage.css";
import { getAuth } from "../utils/storage";
import {
  FiArrowLeft, FiBell, FiCalendar, FiMessageSquare,
  FiDollarSign, FiStar, FiInfo, FiCheck, FiTrash2,
} from "react-icons/fi";

const bookings = JSON.parse(localStorage.getItem("userBookings") || "[]");

function buildNotifications() {
  const base = [
    { id: "n1", type: "booking",  title: "Session Confirmed",    message: "Your session has been confirmed. Join on time!", time: "2 min ago",  unread: true  },
    { id: "n2", type: "message",  title: "New Message",          message: "Dr. Priya Sharma sent you a message: 'See you tomorrow!'", time: "15 min ago", unread: true  },
    { id: "n3", type: "payment",  title: "Payment Received",     message: "₹500 payment received for your session booking.", time: "1 hour ago", unread: true  },
    { id: "n4", type: "review",   title: "New Review",           message: "A learner left you a 5-star review! Great work.", time: "3 hours ago", unread: false },
    { id: "n5", type: "system",   title: "Profile Tip",          message: "Complete your profile to attract more learners.", time: "Yesterday",  unread: false },
    { id: "n6", type: "follow",   title: "New Follower",         message: "Arjun Mehta started following your profile.", time: "2 days ago",  unread: false },
    { id: "n7", type: "system",   title: "Weekly Summary",       message: "You had 3 sessions this week. Keep it up!", time: "3 days ago",  unread: false },
  ];
  // Inject real booking notifications
  bookings.slice(-3).forEach((b, i) => {
    base.unshift({
      id: `booking_${i}`,
      type: "booking",
      title: "Session Booked",
      message: `You have a session with ${b.mentor?.name || "a mentor"} on ${b.date} at ${b.time}.`,
      time: "Just now",
      unread: true,
    });
  });
  return base;
}

const ICON_MAP = {
  booking: { icon: <FiCalendar size={20} />, cls: "type-booking" },
  message: { icon: <FiMessageSquare size={20} />, cls: "type-message" },
  payment: { icon: <FiDollarSign size={20} />, cls: "type-payment" },
  review:  { icon: <FiStar size={20} />,        cls: "type-review"  },
  system:  { icon: <FiInfo size={20} />,         cls: "type-system"  },
  follow:  { icon: <FiBell size={20} />,         cls: "type-follow"  },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const homeRoute = auth?.role === "provider" ? "/provider-home" : "/user-home";

  const [notifs, setNotifs] = useState(() => buildNotifications());
  const [filter, setFilter]   = useState("all");

  const unreadCount = notifs.filter(n => n.unread).length;

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
  const markRead    = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  const dismiss     = (id) => setNotifs(prev => prev.filter(n => n.id !== id));
  const clearAll    = () => setNotifs([]);

  const displayed = filter === "unread"
    ? notifs.filter(n => n.unread)
    : notifs;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <button className="back-btn" onClick={() => navigate(homeRoute)}>
          <FiArrowLeft size={15} /> Back
        </button>
        <div className="notifications-header-text">
          <h1>Notifications</h1>
          <p className="subtitle">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
        </div>
        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={markAllRead}>
            <FiCheck size={14} /> Mark All Read
          </button>
        )}
        {notifs.length > 0 && (
          <button className="mark-all-btn" onClick={clearAll} style={{ color: "#ef4444", borderColor: "#fecaca" }}>
            <FiTrash2 size={14} /> Clear All
          </button>
        )}
      </div>

      {/* FILTER TABS */}
      <div className="notifications-tabs">
        <button className={`notif-tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          All ({notifs.length})
        </button>
        <button className={`notif-tab ${filter === "unread" ? "active" : ""}`} onClick={() => setFilter("unread")}>
          Unread ({unreadCount})
        </button>
      </div>

      {/* LIST */}
      {displayed.length > 0 ? (
        <div className="notifications-list">
          {displayed.map(notif => {
            const { icon, cls } = ICON_MAP[notif.type] || ICON_MAP.system;
            return (
              <div
                key={notif.id}
                className={`notification-item ${notif.unread ? "unread" : ""}`}
                onClick={() => markRead(notif.id)}
              >
                {notif.unread && <span className="notif-unread-dot" />}
                <div className={`notif-icon ${cls}`}>{icon}</div>
                <div className="notif-content">
                  <div className="notif-title">{notif.title}</div>
                  <div className="notif-message">{notif.message}</div>
                  <div className="notif-time">{notif.time}</div>
                </div>
                <div className="notif-meta">
                  <button
                    className="notif-dismiss-btn"
                    onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                    title="Dismiss"
                  >✕</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-notifications">
          <div className="empty-notifications-icon"><FiBell size={36} /></div>
          <h3>All caught up!</h3>
          <p>You have no {filter === "unread" ? "unread" : ""} notifications right now.</p>
        </div>
      )}
    </div>
  );
}
