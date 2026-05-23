import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ProfileView.css";
import {
  FiArrowLeft, FiMail, FiStar, FiBook, FiCalendar,
  FiMessageSquare, FiLinkedin, FiMapPin, FiAward,
  FiClock, FiDollarSign, FiCheck, FiSend, FiX,
} from "react-icons/fi";
import { getStoredProviders, getAuth, getCurrentProfile } from "../utils/storage";
import { getOrCreateConversation, sendMessage as sendMsg, buildConversationId } from "../utils/messages";

export default function ProviderProfileView() {
  const navigate  = useNavigate();
  const { email } = useParams();
  const decodedEmail = decodeURIComponent(email);

  const auth     = getAuth();
  const me       = getCurrentProfile();
  const isUser   = auth?.role === "user";
  const isProvider = auth?.role === "provider";
  const isAdmin  = auth?.role === "admin";

  // Chat modal state
  const [chatOpen, setChatOpen]     = useState(false);
  const [chatMsg, setChatMsg]       = useState("");
  const [chatSent, setChatSent]     = useState(false);
  const [sending, setSending]       = useState(false);
  const [chatError, setChatError]   = useState("");

  // Load provider
  const provider = useMemo(() => {
    return getStoredProviders().find(
      p => p.email.toLowerCase() === decodedEmail.toLowerCase()
    ) || null;
  }, [decodedEmail]);

  // Load bookings for this provider
  const allBookings = useMemo(() => {
    return JSON.parse(localStorage.getItem("userBookings") || "[]");
  }, []);

  const providerBookings = useMemo(() => {
    return allBookings.filter(b => b.providerEmail?.toLowerCase() === decodedEmail.toLowerCase());
  }, [allBookings, decodedEmail]);

  // Has this current user booked this provider?
  const hasBooked = useMemo(() => {
    if (!auth?.email) return false;
    return allBookings.some(
      b => b.providerEmail?.toLowerCase() === decodedEmail.toLowerCase()
        && b.userId?.toLowerCase() === auth.email.toLowerCase()
    );
  }, [allBookings, auth, decodedEmail]);

  const earnings  = providerBookings.reduce((s, b) => s + (b.totalPrice || 0) * 0.8, 0);
  const rating    = 4.9;

  // ── SEND MESSAGE ────────────────────────────────────────────
  const handleOpenChat = () => {
    if (!isUser && !isProvider) return;
    setChatOpen(true);
    setChatSent(false);
    setChatMsg("");
    setChatError("");
    // Pre-create conversation
    if (me && provider) {
      getOrCreateConversation(
        auth.email, me.name || auth.email, auth.role,
        provider.email, provider.name, "provider"
      );
    }
  };

  const handleSendMessage = () => {
    if (!chatMsg.trim()) { setChatError("Please enter a message."); return; }
    if (!me || !provider) return;
    setSending(true);

    const convoId = buildConversationId(auth.email, provider.email);
    sendMsg(convoId, auth.email, chatMsg.trim());

    setTimeout(() => {
      setSending(false);
      setChatSent(true);
    }, 400);
  };

  const goToFullChat = () => {
    navigate("/messages", {
      state: { openEmail: provider.email, openName: provider.name, openRole: "provider" }
    });
  };

  // ── BOOK SESSION ─────────────────────────────────────────────
  const handleBook = () => {
    navigate("/booking", { state: { mentor: provider } });
  };

  // ── NOT FOUND ─────────────────────────────────────────────────
  if (!provider) {
    return (
      <div className="pv-page">
        <div className="pv-container">
          <button className="pv-back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft size={16} /> Back
          </button>
          <div className="pv-not-found">
            <span>😕</span>
            <h2>Provider not found</h2>
            <p>This provider profile does not exist or may have been removed.</p>
            <button onClick={() => navigate("/mentors")}>Browse Mentors</button>
          </div>
        </div>
      </div>
    );
  }

  const skillList = provider.skills ? provider.skills.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="pv-page">
      <div className="pv-container">

        {/* ── Top bar ── */}
        <div className="pv-topbar">
          <button className="pv-back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft size={16} /> Back
          </button>
          {isUser && (
            <div className="pv-top-actions">
              <button className="pv-msg-btn" onClick={handleOpenChat}>
                <FiMessageSquare size={16} /> Send Message
              </button>
              <button className="pv-book-btn" onClick={handleBook}>
                <FiCalendar size={16} /> Book Session
              </button>
            </div>
          )}
          {(isProvider || isAdmin) && (
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
          <div className="pv-cover" />
          <div className="pv-hero-body">
            <div className="pv-avatar-wrap">
              <img
                src={`https://i.pravatar.cc/120?u=${provider.email}`}
                alt={provider.name}
                className="pv-avatar"
              />
              <div className="pv-verified"><FiCheck size={12} /></div>
            </div>
            <div className="pv-hero-info">
              <h1 className="pv-name">{provider.name}</h1>
              <div className="pv-role-tag">Mentor / Provider</div>
              {provider.skills && (
                <p className="pv-headline">Expert in {provider.skills.split(",")[0].trim()}</p>
              )}
              <div className="pv-meta-row">
                <span><FiStar size={13} fill="#f59e0b" color="#f59e0b" /> {rating} rating</span>
                {provider.experience && <span><FiAward size={13} /> {provider.experience}</span>}
                {provider.location && <span><FiMapPin size={13} /> {provider.location}</span>}
              </div>
              {hasBooked && (
                <div className="pv-booked-badge">
                  <FiCheck size={13} /> You've booked this mentor
                </div>
              )}
            </div>
            <div className="pv-hero-cta">
              {provider.rate && (
                <div className="pv-rate">
                  <span>₹{provider.rate}</span>
                  <small>per hour</small>
                </div>
              )}
              {isUser && (
                <>
                  <button className="pv-book-btn-hero" onClick={handleBook}>
                    <FiCalendar size={15} /> Book a Session
                  </button>
                  <button className="pv-msg-btn-hero" onClick={handleOpenChat}>
                    <FiMessageSquare size={15} /> Message
                  </button>
                </>
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
                    <p className="pv-stat-val">{providerBookings.length}</p>
                    <p className="pv-stat-lbl">Total Sessions</p>
                  </div>
                </div>
                <div className="pv-stat">
                  <div className="pv-stat-icon amber"><FiStar size={16} /></div>
                  <div>
                    <p className="pv-stat-val">{rating}</p>
                    <p className="pv-stat-lbl">Avg Rating</p>
                  </div>
                </div>
                <div className="pv-stat">
                  <div className="pv-stat-icon green"><FiDollarSign size={16} /></div>
                  <div>
                    <p className="pv-stat-val">₹{earnings.toFixed(0)}</p>
                    <p className="pv-stat-lbl">Total Earned</p>
                  </div>
                </div>
                {provider.rate && (
                  <div className="pv-stat">
                    <div className="pv-stat-icon purple"><FiClock size={16} /></div>
                    <div>
                      <p className="pv-stat-val">₹{provider.rate}/hr</p>
                      <p className="pv-stat-lbl">Session Rate</p>
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
                  <span>{provider.email}</span>
                </div>
                {provider.linkedin && (
                  <div className="pv-contact-item">
                    <FiLinkedin size={15} />
                    <a href={provider.linkedin} target="_blank" rel="noopener noreferrer">
                      View LinkedIn
                    </a>
                  </div>
                )}
              </div>
              {isUser && (
                <button className="pv-msg-card-btn" onClick={handleOpenChat}>
                  <FiMessageSquare size={14} /> Send a Message
                </button>
              )}
            </div>

          </div>

          {/* RIGHT */}
          <div className="pv-right">

            {/* About */}
            <div className="pv-card">
              <h3 className="pv-card-title">About</h3>
              <p className="pv-about">
                {provider.bio ||
                  `A dedicated mentor with ${provider.experience || "years of experience"}. 
                  Expert in ${provider.skills || "professional skills"}.
                  Committed to helping learners achieve their career goals through personalized guidance and hands-on mentorship.`}
              </p>
            </div>

            {/* Skills */}
            {skillList.length > 0 && (
              <div className="pv-card">
                <h3 className="pv-card-title"><FiBook size={14} /> Skills & Expertise</h3>
                <div className="pv-skills">
                  {skillList.map((s, i) => (
                    <span key={i} className="pv-skill-tag">{s}</span>
                  ))}
                </div>
                {provider.experience && (
                  <div className="pv-experience-row">
                    <FiAward size={14} />
                    <span>{provider.experience} of experience</span>
                  </div>
                )}
              </div>
            )}

            {/* Recent sessions this provider had */}
            {providerBookings.length > 0 && (
              <div className="pv-card">
                <h3 className="pv-card-title">Recent Sessions</h3>
                <div className="pv-sessions-list">
                  {providerBookings.slice(0, 3).map((b, i) => {
                    const isPast = new Date(`${b.date}T${b.time}`) <= new Date();
                    return (
                      <div key={i} className="pv-session-row">
                        <div className="pv-session-info">
                          <p className="pv-session-date"><FiCalendar size={12} /> {b.date} · {b.time}</p>
                          <p className="pv-session-dur"><FiClock size={12} /> {b.duration} min</p>
                        </div>
                        <span className={`pv-session-badge ${isPast ? "done" : "upcoming"}`}>
                          {isPast ? "Completed" : "Upcoming"}
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
                  <img src={`https://i.pravatar.cc/48?u=${provider.email}`} alt={provider.name} />
                  <div>
                    <p className="pv-modal-name">{provider.name}</p>
                    <p className="pv-modal-role">Mentor · Provider</p>
                  </div>
                </div>
                <button className="pv-modal-close" onClick={() => setChatOpen(false)}>
                  <FiX size={18} />
                </button>
              </div>

              {!chatSent ? (
                <div className="pv-modal-body">
                  <p className="pv-modal-hint">
                    Introduce yourself or ask about their availability. They'll reply in Messages.
                  </p>
                  <textarea
                    className="pv-modal-textarea"
                    rows={5}
                    placeholder={`Hi ${provider.name.split(" ")[0]}, I'm interested in booking a session with you...`}
                    value={chatMsg}
                    onChange={e => { setChatMsg(e.target.value); setChatError(""); }}
                    autoFocus
                  />
                  {chatError && <p className="pv-modal-error">{chatError}</p>}
                  <div className="pv-modal-footer">
                    <button className="pv-modal-cancel" onClick={() => setChatOpen(false)}>Cancel</button>
                    <button className="pv-modal-send" onClick={handleSendMessage} disabled={sending}>
                      {sending ? "Sending…" : <><FiSend size={14} /> Send Message</>}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pv-modal-success">
                  <div className="pv-success-icon"><FiCheck size={28} /></div>
                  <h3>Message Sent!</h3>
                  <p>Your message has been delivered to <strong>{provider.name}</strong>. They'll reply soon.</p>
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
