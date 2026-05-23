import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ProfileView.css";
import {
  FiArrowLeft, FiMail, FiCalendar, FiClock,
  FiMessageSquare, FiDollarSign, FiCheck,
  FiSend, FiX, FiUser, FiMapPin,
} from "react-icons/fi";
import { getStoredUsers, getAuth, getCurrentProfile } from "../utils/storage";
import { getOrCreateConversation, sendMessage as sendMsg, buildConversationId } from "../utils/messages";

export default function UserProfileView() {
  const navigate      = useNavigate();
  const { email }     = useParams();
  const decodedEmail  = decodeURIComponent(email);

  const auth    = getAuth();
  const me      = getCurrentProfile();
  const isProvider = auth?.role === "provider";

  // Chat modal state
  const [chatOpen, setChatOpen]   = useState(false);
  const [chatMsg, setChatMsg]     = useState("");
  const [chatSent, setChatSent]   = useState(false);
  const [sending, setSending]     = useState(false);
  const [chatError, setChatError] = useState("");

  // Load user profile
  const user = useMemo(() => {
    return getStoredUsers().find(
      u => u.email.toLowerCase() === decodedEmail.toLowerCase()
    ) || null;
  }, [decodedEmail]);

  // All bookings involving this user
  const allBookings = useMemo(() => JSON.parse(localStorage.getItem("userBookings") || "[]"), []);

  const userBookings = useMemo(() => {
    return allBookings.filter(b => b.userId?.toLowerCase() === decodedEmail.toLowerCase());
  }, [allBookings, decodedEmail]);

  // Bookings where the current provider is the one this user booked
  const sharedBookings = useMemo(() => {
    if (!auth?.email) return [];
    return userBookings.filter(
      b => b.providerEmail?.toLowerCase() === auth.email.toLowerCase()
    );
  }, [userBookings, auth]);

  const totalSpent = userBookings.reduce((s, b) => s + (b.totalPrice || 0), 0);

  // ── SEND MESSAGE ─────────────────────────────────────────────
  const handleOpenChat = () => {
    if (!isProvider && auth?.role !== "admin") return;
    setChatOpen(true);
    setChatSent(false);
    setChatMsg("");
    setChatError("");
    if (me && user) {
      getOrCreateConversation(
        auth.email, me.name || auth.email, auth.role,
        user.email, user.name, "user"
      );
    }
  };

  const handleSendMessage = () => {
    if (!chatMsg.trim()) { setChatError("Please type a message."); return; }
    if (!me || !user) return;
    setSending(true);
    const convoId = buildConversationId(auth.email, user.email);
    sendMsg(convoId, auth.email, chatMsg.trim());
    setTimeout(() => { setSending(false); setChatSent(true); }, 400);
  };

  const goToFullChat = () => {
    navigate("/messages", {
      state: { openEmail: user.email, openName: user.name, openRole: "user" }
    });
  };

  // ── NOT FOUND ─────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="pv-page">
        <div className="pv-container">
          <button className="pv-back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft size={16} /> Back
          </button>
          <div className="pv-not-found">
            <span>😕</span>
            <h2>User not found</h2>
            <p>This user profile does not exist or may have been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pv-page">
      <div className="pv-container">

        {/* ── Top bar ── */}
        <div className="pv-topbar">
          <button className="pv-back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft size={16} /> Back
          </button>
          {(isProvider || auth?.role === "admin") && (
            <div className="pv-top-actions">
              {auth?.email?.toLowerCase() !== decodedEmail.toLowerCase() && (
                <button className="pv-msg-btn" onClick={handleOpenChat}>
                  <FiMessageSquare size={16} /> Send Message
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── HERO CARD ── */}
        <div className="pv-hero">
          <div className="pv-cover" style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)" }} />
          <div className="pv-hero-body">
            <div className="pv-avatar-wrap">
              <div className="pv-avatar-initials">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
            </div>
            <div className="pv-hero-info">
              <h1 className="pv-name">{user.name}</h1>
              <div className="pv-role-tag" style={{ background: "rgba(14,165,233,0.12)", color: "#0ea5e9" }}>
                Learner
              </div>
              {user.location && (
                <div className="pv-meta-row">
                  <span><FiMapPin size={13} /> {user.location}</span>
                </div>
              )}
              {sharedBookings.length > 0 && isProvider && (
                <div className="pv-booked-badge" style={{ background: "rgba(14,165,233,0.1)", color: "#0ea5e9", borderColor: "rgba(14,165,233,0.2)" }}>
                  <FiCheck size={13} /> Booked {sharedBookings.length} session{sharedBookings.length !== 1 ? "s" : ""} with you
                </div>
              )}
            </div>
            <div className="pv-hero-cta">
              {(isProvider || auth?.role === "admin") && auth?.email?.toLowerCase() !== decodedEmail.toLowerCase() && (
                <button className="pv-msg-btn-hero" onClick={handleOpenChat}>
                  <FiMessageSquare size={15} /> Send Message
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── BODY GRID ── */}
        <div className="pv-body">

          {/* LEFT */}
          <div className="pv-left">

            {/* Stats */}
            <div className="pv-card">
              <h3 className="pv-card-title">Statistics</h3>
              <div className="pv-stats">
                <div className="pv-stat">
                  <div className="pv-stat-icon indigo"><FiCalendar size={16} /></div>
                  <div>
                    <p className="pv-stat-val">{userBookings.length}</p>
                    <p className="pv-stat-lbl">Sessions Booked</p>
                  </div>
                </div>
                <div className="pv-stat">
                  <div className="pv-stat-icon green"><FiDollarSign size={16} /></div>
                  <div>
                    <p className="pv-stat-val">₹{totalSpent.toFixed(0)}</p>
                    <p className="pv-stat-lbl">Total Invested</p>
                  </div>
                </div>
                <div className="pv-stat">
                  <div className="pv-stat-icon amber"><FiClock size={16} /></div>
                  <div>
                    <p className="pv-stat-val">
                      {userBookings.length > 0
                        ? `₹${(totalSpent / userBookings.length).toFixed(0)}`
                        : "—"}
                    </p>
                    <p className="pv-stat-lbl">Avg per Session</p>
                  </div>
                </div>
                {isProvider && (
                  <div className="pv-stat">
                    <div className="pv-stat-icon purple"><FiCheck size={16} /></div>
                    <div>
                      <p className="pv-stat-val">{sharedBookings.length}</p>
                      <p className="pv-stat-lbl">With You</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="pv-card">
              <h3 className="pv-card-title">Contact</h3>
              <div className="pv-contact-list">
                <div className="pv-contact-item">
                  <FiMail size={15} />
                  <span>{user.email}</span>
                </div>
                {user.location && (
                  <div className="pv-contact-item">
                    <FiMapPin size={15} />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>
              {(isProvider || auth?.role === "admin") && auth?.email?.toLowerCase() !== decodedEmail.toLowerCase() && (
                <button className="pv-msg-card-btn" onClick={handleOpenChat}>
                  <FiMessageSquare size={14} /> Send a Message
                </button>
              )}
            </div>

          </div>

          {/* RIGHT */}
          <div className="pv-right">

            {/* About / Bio */}
            <div className="pv-card">
              <h3 className="pv-card-title"><FiUser size={14} /> About</h3>
              <p className="pv-about">
                {user.bio || `${user.name} is a dedicated learner on ConnectPro, actively growing their skills through mentorship sessions. They have booked ${userBookings.length} session${userBookings.length !== 1 ? "s" : ""} on the platform.`}
              </p>
            </div>

            {/* Sessions booked with THIS provider */}
            {isProvider && sharedBookings.length > 0 && (
              <div className="pv-card">
                <h3 className="pv-card-title">Sessions With You</h3>
                <div className="pv-sessions-list">
                  {sharedBookings.map((b, i) => {
                    const isPast = new Date(`${b.date}T${b.time}`) <= new Date();
                    return (
                      <div key={i} className="pv-session-row">
                        <div className="pv-session-info">
                          <p className="pv-session-date"><FiCalendar size={12} /> {b.date} · {b.time}</p>
                          <p className="pv-session-dur"><FiClock size={12} /> {b.duration} min · ₹{(b.totalPrice || 0).toFixed(0)}</p>
                        </div>
                        <span className={`pv-session-badge ${isPast ? "done" : "upcoming"}`}>
                          {isPast ? "Done" : "Upcoming"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All their bookings (visible to admin) */}
            {auth?.role === "admin" && userBookings.length > 0 && (
              <div className="pv-card">
                <h3 className="pv-card-title">All Bookings</h3>
                <div className="pv-sessions-list">
                  {userBookings.map((b, i) => {
                    const isPast = new Date(`${b.date}T${b.time}`) <= new Date();
                    return (
                      <div key={i} className="pv-session-row">
                        <div className="pv-session-info">
                          <p className="pv-session-date">{b.mentor?.name || "Mentor"}</p>
                          <p className="pv-session-dur"><FiCalendar size={12} /> {b.date} · {b.time}</p>
                        </div>
                        <span className={`pv-session-badge ${isPast ? "done" : "upcoming"}`}>
                          {isPast ? "Done" : "Upcoming"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ══════════════════════════════════════
            CHAT MODAL
        ══════════════════════════════════════ */}
        {chatOpen && (
          <div className="pv-modal-overlay" onClick={() => setChatOpen(false)}>
            <div className="pv-modal" onClick={e => e.stopPropagation()}>
              <div className="pv-modal-header">
                <div className="pv-modal-to">
                  <div className="pv-modal-avatar-init">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="pv-modal-name">{user.name}</p>
                    <p className="pv-modal-role">Learner</p>
                  </div>
                </div>
                <button className="pv-modal-close" onClick={() => setChatOpen(false)}>
                  <FiX size={18} />
                </button>
              </div>

              {!chatSent ? (
                <div className="pv-modal-body">
                  <p className="pv-modal-hint">
                    Send a message to {user.name.split(" ")[0]} about their upcoming session or share feedback.
                  </p>
                  <textarea
                    className="pv-modal-textarea"
                    rows={5}
                    placeholder={`Hi ${user.name.split(" ")[0]}, looking forward to our session...`}
                    value={chatMsg}
                    onChange={e => { setChatMsg(e.target.value); setChatError(""); }}
                    autoFocus
                  />
                  {chatError && <p className="pv-modal-error">{chatError}</p>}
                  <div className="pv-modal-footer">
                    <button className="pv-modal-cancel" onClick={() => setChatOpen(false)}>Cancel</button>
                    <button className="pv-modal-send" onClick={handleSendMessage} disabled={sending}>
                      {sending ? "Sending…" : <><FiSend size={14} /> Send</>}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pv-modal-success">
                  <div className="pv-success-icon"><FiCheck size={28} /></div>
                  <h3>Message Sent!</h3>
                  <p>Your message has been delivered to <strong>{user.name}</strong>.</p>
                  <div className="pv-modal-footer">
                    <button className="pv-modal-cancel" onClick={() => setChatOpen(false)}>Close</button>
                    <button className="pv-modal-send" onClick={goToFullChat}>
                      <FiMessageSquare size={14} /> Open Full Chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
