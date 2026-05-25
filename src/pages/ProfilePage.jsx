import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfilePage.css";
import {
  FiEdit2, FiSave, FiX, FiArrowLeft, FiUser, FiMail,
  FiMapPin, FiLinkedin, FiCalendar, FiDollarSign,
  FiBriefcase, FiStar, FiCheck, FiSettings,
  FiVideo, FiRefreshCw, FiWifi, FiWifiOff,
} from "react-icons/fi";
import { getAuth, getCurrentProfile, updateCurrentProfile } from "../utils/storage";
import {
  signInWithGoogle, signOutGoogle,
  isGoogleConnected, getGoogleUserInfo,
  subscribeToAuthChange, isApiReady,
} from "../utils/googleApi";

export default function ProfilePage() {
  const navigate  = useNavigate();
  const auth      = getAuth();
  const homeRoute = auth?.role === "provider" ? "/provider-home" : "/user-home";
  const initialProfile = getCurrentProfile() || {};

  const [user, setUser]           = useState({ ...auth, ...initialProfile });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData]   = useState({ ...user });
  const [toast, setToast]         = useState(null);

  // ── Google connection state ──────────────────────────────────
  const [googleConnected, setGoogleConnected] = useState(isGoogleConnected());
  const [googleUser,      setGoogleUser]      = useState(getGoogleUserInfo());
  const [apiReady,        setApiReady]        = useState(isApiReady());
  const [connecting,      setConnecting]      = useState(false);

  // Subscribe to auth changes so UI updates reactively
  useEffect(() => {
    const unsub = subscribeToAuthChange((token, userInfo) => {
      setGoogleConnected(!!token);
      setGoogleUser(userInfo);
    });
    // Poll for API readiness (resolves quickly, usually < 3 s)
    const interval = setInterval(() => {
      if (isApiReady()) {
        setApiReady(true);
        setGoogleConnected(isGoogleConnected());
        setGoogleUser(getGoogleUserInfo());
        clearInterval(interval);
      }
    }, 300);
    return () => { unsub(); clearInterval(interval); };
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleGoogleConnect = async () => {
    setConnecting(true);
    try {
      const ok = await signInWithGoogle();
      if (ok) {
        setGoogleConnected(true);
        setGoogleUser(getGoogleUserInfo());
        showToast("Google Calendar & Meet connected!", "success");
      } else {
        showToast("Google sign-in was cancelled.", "error");
      }
    } catch {
      showToast("Connection failed. Check credentials.", "error");
    } finally {
      setConnecting(false);
    }
  };

  const handleGoogleDisconnect = () => {
    signOutGoogle();
    setGoogleConnected(false);
    setGoogleUser(null);
    showToast("Google account disconnected.", "success");
  };

  // ── Profile stats ────────────────────────────────────────────
  const bookings   = JSON.parse(localStorage.getItem("userBookings") || "[]");
  const myBookings = auth?.role === "provider"
    ? bookings.filter(b => b.providerEmail === auth.email)
    : bookings;
  const totalSpent = myBookings.reduce((s, b) => s + (b.totalPrice || 0), 0);

  const handleSave = () => {
    if (!formData.name?.trim()) { showToast("Name cannot be empty.", "error"); return; }
    const updated = { ...user, ...formData };
    updateCurrentProfile(updated);
    setUser(updated);
    setIsEditing(false);
    showToast("Profile saved successfully!");
  };

  const handleCancel = () => { setFormData({ ...user }); setIsEditing(false); };

  const Field = ({ label, name, type = "text", placeholder, disabled }) => (
    <div className="pf-row">
      <label className="pf-label">{label}</label>
      {isEditing && !disabled ? (
        <input
          className="pf-input"
          type={type}
          name={name}
          value={formData[name] || ""}
          onChange={e => setFormData({ ...formData, [name]: e.target.value })}
          placeholder={placeholder}
        />
      ) : (
        <p className={`pf-value ${!user[name] ? "pf-empty" : ""}`}>
          {type === "url" && user[name]
            ? <a href={user[name]} target="_blank" rel="noopener noreferrer">{user[name]}</a>
            : user[name] || "Not set"}
        </p>
      )}
    </div>
  );

  const TextareaField = ({ label, name, placeholder }) => (
    <div className="pf-row">
      <label className="pf-label">{label}</label>
      {isEditing ? (
        <textarea
          className="pf-input pf-textarea"
          name={name}
          value={formData[name] || ""}
          onChange={e => setFormData({ ...formData, [name]: e.target.value })}
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <p className={`pf-value ${!user[name] ? "pf-empty" : ""}`}>{user[name] || "Not set"}</p>
      )}
    </div>
  );

  return (
    <div className="profile-page">

      {/* TOAST */}
      {toast && (
        <div className={`profile-toast ${toast.type}`}>
          {toast.type === "success" ? <FiCheck size={15} /> : <FiX size={15} />}
          {toast.msg}
        </div>
      )}

      <div className="profile-container">

        {/* BACK + SETTINGS */}
        <div className="profile-top-actions">
          <button className="back-btn" onClick={() => navigate(homeRoute)}>
            <FiArrowLeft size={15} /> Back
          </button>
          <button className="profile-settings-link" onClick={() => navigate("/settings")}>
            <FiSettings size={15} /> Settings
          </button>
        </div>

        {/* PROFILE HEADER CARD */}
        <div className="profile-header-card">
          <div className="profile-cover" />
          <div className="profile-header-content">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar-big">
                {auth?.role === "provider"
                  ? <img src={`https://i.pravatar.cc/120?u=${user.email}`} alt={user.name} />
                  : <span>{user.name ? user.name[0].toUpperCase() : "U"}</span>
                }
              </div>
              {auth?.role === "provider" && (
                <div className="provider-rating">
                  <FiStar size={12} fill="#f59e0b" color="#f59e0b" /> 4.9
                </div>
              )}
            </div>
            <div className="profile-header-info">
              <h1 className="profile-name">{user.name || "Your Name"}</h1>
              <p className="profile-role-pill">{auth?.role === "provider" ? "Mentor / Provider" : "Learner"}</p>
              {user.skills && <p className="profile-skills">{user.skills}</p>}
              {user.location && (
                <p className="profile-location"><FiMapPin size={13} /> {user.location}</p>
              )}
            </div>
            <div className="profile-header-actions">
              {!isEditing ? (
                <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                  <FiEdit2 size={15} /> Edit Profile
                </button>
              ) : (
                <>
                  <button className="save-profile-btn" onClick={handleSave}>
                    <FiSave size={15} /> Save
                  </button>
                  <button className="cancel-profile-btn" onClick={handleCancel}>
                    <FiX size={15} /> Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="profile-body">

          {/* LEFT: STATS + GOOGLE CONNECT */}
          <div className="profile-sidebar-col">

            {/* Stats card */}
            <div className="profile-stats-card">
              <h3>Statistics</h3>
              <div className="profile-stat">
                <div className="pstat-icon indigo"><FiCalendar size={16} /></div>
                <div>
                  <p className="pstat-val">{myBookings.length}</p>
                  <p className="pstat-lbl">{auth?.role === "provider" ? "Sessions Given" : "Sessions Booked"}</p>
                </div>
              </div>
              <div className="profile-stat">
                <div className="pstat-icon green"><FiDollarSign size={16} /></div>
                <div>
                  <p className="pstat-val">₹{totalSpent.toFixed(0)}</p>
                  <p className="pstat-lbl">{auth?.role === "provider" ? "Total Earned" : "Total Invested"}</p>
                </div>
              </div>
              {auth?.role === "provider" && (
                <div className="profile-stat">
                  <div className="pstat-icon amber"><FiStar size={16} /></div>
                  <div>
                    <p className="pstat-val">4.9 / 5</p>
                    <p className="pstat-lbl">Avg Rating</p>
                  </div>
                </div>
              )}
              <div className="profile-stat">
                <div className="pstat-icon purple"><FiCalendar size={16} /></div>
                <div>
                  <p className="pstat-val">{new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
                  <p className="pstat-lbl">Joined</p>
                </div>
              </div>
            </div>

            {/* ── GOOGLE CONNECT CARD ── */}
            <div className={`google-connect-card${googleConnected ? " gc-connected" : ""}`}>

              {/* Header */}
              <div className="gc-header">
                <svg className="gc-google-logo" viewBox="0 0 48 48" width="30" height="30">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <div className="gc-header-text">
                  <span className="gc-title">Google Services</span>
                  <span className="gc-subtitle">Calendar &amp; Meet</span>
                </div>
                {googleConnected && (
                  <span className="gc-live-badge">
                    <span className="gc-live-dot" /> Live
                  </span>
                )}
              </div>

              {/* Service pills */}
              <div className="gc-services">
                <div className={`gc-service-pill${googleConnected ? " active" : ""}`}>
                  <FiCalendar size={12} /> Google Calendar
                </div>
                <div className={`gc-service-pill${googleConnected ? " active" : ""}`}>
                  <FiVideo size={12} /> Google Meet
                </div>
              </div>

              {/* Connected account */}
              {googleConnected && googleUser && (
                <div className="gc-user-info">
                  {googleUser.picture
                    ? <img src={googleUser.picture} alt={googleUser.name} className="gc-user-avatar" />
                    : <div className="gc-user-avatar-fallback">{googleUser.name?.[0] || "G"}</div>
                  }
                  <div className="gc-user-details">
                    <p className="gc-user-name">{googleUser.name}</p>
                    <p className="gc-user-email">{googleUser.email}</p>
                  </div>
                  <FiCheck size={18} className="gc-check-icon" />
                </div>
              )}

              {/* Description */}
              <p className="gc-desc">
                {googleConnected
                  ? "Your Google account is connected. Sessions auto-create Calendar events with Meet links."
                  : "Connect to sync sessions to Calendar and auto-generate Google Meet links."}
              </p>

              {/* Action */}
              {!googleConnected ? (
                <button
                  className="gc-connect-btn"
                  onClick={handleGoogleConnect}
                  disabled={connecting || !apiReady}
                  id="google-connect-btn"
                >
                  {connecting || !apiReady ? (
                    <><FiRefreshCw size={14} className="gc-spin" /> {connecting ? "Connecting…" : "Loading API…"}</>
                  ) : (
                    <>
                      <svg viewBox="0 0 48 48" width="16" height="16" style={{ flexShrink: 0 }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      </svg>
                      Connect with Google
                    </>
                  )}
                </button>
              ) : (
                <div className="gc-connected-row">
                  <div className="gc-status-pill">
                    <FiWifi size={13} /> Connected &amp; syncing
                  </div>
                  <button className="gc-disconnect-btn" onClick={handleGoogleDisconnect} id="google-disconnect-btn">
                    <FiWifiOff size={12} /> Disconnect
                  </button>
                </div>
              )}

              {/* Benefits */}
              <ul className="gc-benefits">
                <li className={googleConnected ? "benefit-active" : ""}>
                  <FiCheck size={11} /> Auto Calendar event on booking
                </li>
                <li className={googleConnected ? "benefit-active" : ""}>
                  <FiCheck size={11} /> Google Meet link generated
                </li>
                <li className={googleConnected ? "benefit-active" : ""}>
                  <FiCheck size={11} /> Email reminders for both parties
                </li>
                {auth?.role === "provider" && (
                  <li className={googleConnected ? "benefit-active" : ""}>
                    <FiCheck size={11} /> Availability synced to Calendar
                  </li>
                )}
              </ul>
            </div>

            {user.linkedin && (
              <div className="profile-link-card">
                <a href={user.linkedin} target="_blank" rel="noopener noreferrer">
                  <FiLinkedin size={18} /> View LinkedIn
                </a>
              </div>
            )}
          </div>

          {/* RIGHT: FORM */}
          <div className="profile-main-col">
            <div className="profile-info-card">
              <h2 className="pcard-title"><FiUser size={16} /> Personal Information</h2>
              <div className="pf-grid">
                <Field label="Full Name"    name="name"     placeholder="Your full name" />
                <Field label="Email"        name="email"    type="email" disabled />
                <Field label="Location"     name="location" placeholder="City, Country" />
                <Field label="LinkedIn URL" name="linkedin" type="url" placeholder="https://linkedin.com/in/..." />
              </div>
              <TextareaField label="Bio / About" name="bio" placeholder="Tell people about yourself..." />
            </div>

            {auth?.role === "provider" && (
              <div className="profile-info-card">
                <h2 className="pcard-title"><FiBriefcase size={16} /> Provider Details</h2>
                <div className="pf-grid">
                  <Field label="Skills / Expertise" name="skills"     placeholder="e.g. React, Python, Design" />
                  <Field label="Experience"          name="experience" placeholder="e.g. 5 Years" />
                  <Field label="Hourly Rate (₹)"     name="rate"       type="number" placeholder="e.g. 500" />
                  <Field label="Education"            name="education"  placeholder="e.g. B.Tech Computer Science" />
                </div>
                <TextareaField label="What learners get" name="offering" placeholder="Describe what you offer in sessions..." />
                {user.skills && (
                  <div style={{ marginTop: 16 }}>
                    <p className="pf-label" style={{ marginBottom: 8 }}>Skills</p>
                    <div className="skill-tags-row">
                      {user.skills.split(",").map((s, i) => (
                        <span key={i} className="profile-skill-tag">{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
