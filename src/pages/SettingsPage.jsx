import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SettingsPage.css";
import {
  FiBell, FiLock, FiLogOut, FiTrash2, FiArrowLeft,
  FiAlertCircle, FiUser, FiSliders, FiShield, FiCheck,
  FiX, FiEye, FiEyeOff, FiSave,
} from "react-icons/fi";
import {
  getAuth, removeAuth, deleteCurrentProfile,
  getCurrentProfile, updateCurrentProfile,
} from "../utils/storage";

/* ─── Tab definitions ─────────────────────────────────────── */
const TABS = [
  { id: "profile",       label: "Profile",      icon: <FiUser size={16} /> },
  { id: "notifications", label: "Notifications", icon: <FiBell size={16} /> },
  { id: "security",      label: "Security",      icon: <FiShield size={16} /> },
  { id: "preferences",   label: "Preferences",   icon: <FiSliders size={16} /> },
  { id: "danger",        label: "Danger Zone",   icon: <FiAlertCircle size={16} /> },
];

/* ─── Default values ──────────────────────────────────────── */
const DEFAULT_NOTIFS = {
  emailNotifications:    true,
  sessionReminders:      true,
  newMentorNotifications: true,
  newsletter:            false,
  marketingEmails:       false,
};

const DEFAULT_PREFS = {
  language: "English",
  timezone: "Asia/Kolkata",
  currency: "INR",
};

/* ─── Toast component ─────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`settings-toast ${type}`}>
      {type === "success" ? <FiCheck size={16} /> : <FiAlertCircle size={16} />}
      {msg}
    </div>
  );
}

/* ─── Toggle switch ───────────────────────────────────────── */
function Toggle({ value, onChange }) {
  return (
    <button
      className={`settings-toggle-btn ${value ? "on" : "off"}`}
      onClick={() => onChange(!value)}
      aria-label="toggle"
      type="button"
    >
      <span className="toggle-knob" />
    </button>
  );
}

/* ─── Password input with eye button ─────────────────────── */
function PwInput({ field, placeholder, pwForm, setPwForm, showPw, setShowPw }) {
  return (
    <div className="pw-input-wrap">
      <input
        type={showPw[field] ? "text" : "password"}
        placeholder={placeholder}
        value={pwForm[field]}
        onChange={e => setPwForm({ ...pwForm, [field]: e.target.value })}
        className="settings-input"
      />
      <button
        type="button"
        className="pw-eye-btn"
        onClick={() => setShowPw({ ...showPw, [field]: !showPw[field] })}
      >
        {showPw[field] ? <FiEyeOff size={16} /> : <FiEye size={16} />}
      </button>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────── */
export default function SettingsPage() {
  const auth      = getAuth();
  const homeRoute = auth?.role === "provider" ? "/provider-home" : "/user-home";
  const navigate  = useNavigate();

  /* tabs & toast */
  const [activeTab, setActiveTab]   = useState("profile");
  const [toast, setToast]           = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* profile */
  const [profile, setProfile]         = useState(() => getCurrentProfile() || {});
  const [editProfile, setEditProfile] = useState(() => getCurrentProfile() || {});

  /* notifications */
  const [notifs, setNotifs] = useState(() => {
    try {
      const raw = localStorage.getItem("connectpro_notif_prefs");
      return raw ? JSON.parse(raw) : DEFAULT_NOTIFS;
    } catch (_) {
      return DEFAULT_NOTIFS;
    }
  });

  /* security */
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [twoFactor, setTwoFactor] = useState(false);

  /* preferences */
  const [prefs, setPrefs] = useState(() => {
    try {
      const raw = localStorage.getItem("connectpro_prefs");
      return raw ? JSON.parse(raw) : DEFAULT_PREFS;
    } catch (_) {
      return DEFAULT_PREFS;
    }
  });

  const showToast = (msg, type = "success") => setToast({ msg, type });

  /* ── Profile save ── */
  const saveProfile = () => {
    if (!editProfile.name?.trim()) {
      showToast("Name cannot be empty.", "error");
      return;
    }
    const updated = { ...profile, ...editProfile };
    updateCurrentProfile(updated);
    setProfile(updated);
    showToast("Profile saved successfully!");
  };

  /* ── Notifications save ── */
  const saveNotifs = () => {
    localStorage.setItem("connectpro_notif_prefs", JSON.stringify(notifs));
    showToast("Notification preferences saved!");
  };

  /* ── Password change ── */
  const changePassword = () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
      showToast("Please fill in all password fields.", "error");
      return;
    }
    if (pwForm.newPw.length < 6) {
      showToast("New password must be at least 6 characters.", "error");
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      showToast("New passwords do not match.", "error");
      return;
    }
    const stored = getCurrentProfile();
    if (stored && stored.password !== pwForm.current) {
      showToast("Current password is incorrect.", "error");
      return;
    }
    updateCurrentProfile({ ...stored, password: pwForm.newPw });
    setPwForm({ current: "", newPw: "", confirm: "" });
    showToast("Password changed successfully!");
  };

  /* ── Preferences save ── */
  const savePrefs = () => {
    localStorage.setItem("connectpro_prefs", JSON.stringify(prefs));
    showToast("Preferences saved!");
  };

  /* ── Logout ── */
  const handleLogout = () => {
    removeAuth();
    navigate("/login");
  };

  /* ── Delete account ── */
  const handleDeleteAccount = () => {
    deleteCurrentProfile();
    removeAuth();
    localStorage.removeItem("userBookings");
    navigate("/register");
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <div className="settings-page">

      {/* Toast */}
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="settings-header">
        <button className="back-btn" onClick={() => navigate(homeRoute)}>
          <FiArrowLeft size={16} /> Back
        </button>
        <div className="settings-header-text">
          <h1>Settings</h1>
          <p>Manage your account preferences and security</p>
        </div>
      </div>

      <div className="settings-body">

        {/* ── Sidebar nav ── */}
        <ul className="settings-nav">
          {TABS.map(tab => (
            <li
              key={tab.id}
              className={activeTab === tab.id ? "active-setting" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
              {tab.id === "danger" && <span className="danger-dot" />}
            </li>
          ))}
        </ul>

        {/* ── Content panel ── */}
        <div className="settings-section">

          {/* ══ PROFILE ══ */}
          {activeTab === "profile" && (
            <>
              <h2>Profile Information</h2>
              <p className="settings-section-subtitle">
                Update your personal information and public profile.
              </p>

              <div className="profile-avatar-row">
                <div className="settings-avatar">
                  {editProfile.name ? editProfile.name[0].toUpperCase() : "U"}
                </div>
                <div>
                  <p className="avatar-name">{profile.name || "Your Name"}</p>
                  <p className="avatar-role">
                    {auth?.role === "provider" ? "Mentor / Provider" : "Learner"}
                  </p>
                </div>
              </div>

              <div className="settings-form">
                <div className="settings-form-grid">
                  <div className="settings-row">
                    <label>Full Name</label>
                    <input
                      className="settings-input"
                      type="text"
                      value={editProfile.name || ""}
                      onChange={e => setEditProfile({ ...editProfile, name: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="settings-row">
                    <label>Email Address</label>
                    <input
                      className="settings-input"
                      type="email"
                      value={editProfile.email || ""}
                      disabled
                      style={{ opacity: 0.6, cursor: "not-allowed" }}
                    />
                  </div>
                  <div className="settings-row">
                    <label>Location</label>
                    <input
                      className="settings-input"
                      type="text"
                      value={editProfile.location || ""}
                      onChange={e => setEditProfile({ ...editProfile, location: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="settings-row">
                    <label>LinkedIn URL</label>
                    <input
                      className="settings-input"
                      type="url"
                      value={editProfile.linkedin || ""}
                      onChange={e => setEditProfile({ ...editProfile, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>

                  {auth?.role === "provider" && (
                    <>
                      <div className="settings-row">
                        <label>Skills / Expertise</label>
                        <input
                          className="settings-input"
                          type="text"
                          value={editProfile.skills || ""}
                          onChange={e => setEditProfile({ ...editProfile, skills: e.target.value })}
                          placeholder="e.g. React, UI/UX, Python"
                        />
                      </div>
                      <div className="settings-row">
                        <label>Experience</label>
                        <input
                          className="settings-input"
                          type="text"
                          value={editProfile.experience || ""}
                          onChange={e => setEditProfile({ ...editProfile, experience: e.target.value })}
                          placeholder="e.g. 5 Years"
                        />
                      </div>
                      <div className="settings-row">
                        <label>Hourly Rate (₹)</label>
                        <input
                          className="settings-input"
                          type="number"
                          value={editProfile.rate || ""}
                          onChange={e => setEditProfile({ ...editProfile, rate: e.target.value })}
                          placeholder="e.g. 500"
                        />
                      </div>
                      <div className="settings-row" style={{ gridColumn: "span 2" }}>
                        <label>Bio / About</label>
                        <textarea
                          className="settings-input"
                          rows={3}
                          value={editProfile.bio || ""}
                          onChange={e => setEditProfile({ ...editProfile, bio: e.target.value })}
                          placeholder="Tell learners about yourself..."
                        />
                      </div>
                    </>
                  )}
                </div>

                <button className="settings-save-btn" onClick={saveProfile}>
                  <FiSave size={15} /> Save Profile
                </button>
              </div>
            </>
          )}

          {/* ══ NOTIFICATIONS ══ */}
          {activeTab === "notifications" && (
            <>
              <h2>Notification Preferences</h2>
              <p className="settings-section-subtitle">
                Choose how and when you want to be notified.
              </p>
              <div className="settings-form">
                {[
                  { key: "emailNotifications",    label: "Email Notifications",  desc: "Receive important updates and alerts via email" },
                  { key: "sessionReminders",       label: "Session Reminders",    desc: "Get reminded 1 hour before your sessions start" },
                  { key: "newMentorNotifications", label: "New Mentor Alerts",    desc: "Be notified when new mentors join ConnectPro" },
                  { key: "newsletter",             label: "Weekly Newsletter",    desc: "Receive tips, news and updates every week" },
                  { key: "marketingEmails",        label: "Promotional Emails",   desc: "Offers, discounts and featured mentor highlights" },
                ].map(item => (
                  <div className="settings-toggle-row" key={item.key}>
                    <div className="settings-toggle-info">
                      <p className="settings-toggle-label">{item.label}</p>
                      <p className="settings-toggle-desc">{item.desc}</p>
                    </div>
                    <Toggle
                      value={notifs[item.key]}
                      onChange={v => setNotifs({ ...notifs, [item.key]: v })}
                    />
                  </div>
                ))}
                <button className="settings-save-btn" onClick={saveNotifs}>
                  <FiSave size={15} /> Save Preferences
                </button>
              </div>
            </>
          )}

          {/* ══ SECURITY ══ */}
          {activeTab === "security" && (
            <>
              <h2>Security Settings</h2>
              <p className="settings-section-subtitle">
                Keep your account safe with strong security settings.
              </p>
              <div className="settings-form">
                <h3 className="subsection-title">Change Password</h3>

                <div className="settings-row">
                  <label>Current Password</label>
                  <PwInput
                    field="current"
                    placeholder="Enter current password"
                    pwForm={pwForm} setPwForm={setPwForm}
                    showPw={showPw} setShowPw={setShowPw}
                  />
                </div>
                <div className="settings-row">
                  <label>New Password</label>
                  <PwInput
                    field="newPw"
                    placeholder="Min 6 characters"
                    pwForm={pwForm} setPwForm={setPwForm}
                    showPw={showPw} setShowPw={setShowPw}
                  />
                </div>
                <div className="settings-row">
                  <label>Confirm New Password</label>
                  <PwInput
                    field="confirm"
                    placeholder="Repeat new password"
                    pwForm={pwForm} setPwForm={setPwForm}
                    showPw={showPw} setShowPw={setShowPw}
                  />
                </div>

                <button className="settings-save-btn" onClick={changePassword}>
                  <FiLock size={15} /> Update Password
                </button>

                <hr className="settings-section-divider" />

                <div className="settings-toggle-row">
                  <div className="settings-toggle-info">
                    <p className="settings-toggle-label">Two-Factor Authentication</p>
                    <p className="settings-toggle-desc">Add an extra layer of security to your account</p>
                  </div>
                  <Toggle value={twoFactor} onChange={setTwoFactor} />
                </div>

                {twoFactor && (
                  <div className="twofa-info">
                    <FiShield size={18} />
                    <p>2FA is enabled. You'll be asked for a verification code on login.</p>
                  </div>
                )}

                <hr className="settings-section-divider" />

                <div className="settings-toggle-row">
                  <div className="settings-toggle-info">
                    <p className="settings-toggle-label">Active Sessions</p>
                    <p className="settings-toggle-desc">You are currently logged in on 1 device</p>
                  </div>
                  <button className="danger-btn" type="button" onClick={handleLogout}>
                    Sign Out All
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ══ PREFERENCES ══ */}
          {activeTab === "preferences" && (
            <>
              <h2>Preferences</h2>
              <p className="settings-section-subtitle">
                Customize your ConnectPro experience.
              </p>
              <div className="settings-form">
                <div className="settings-row">
                  <label>Language</label>
                  <select
                    className="settings-input"
                    value={prefs.language}
                    onChange={e => setPrefs({ ...prefs, language: e.target.value })}
                  >
                    {["English", "Hindi", "Spanish", "French", "German", "Arabic"].map(l => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="settings-row">
                  <label>Timezone</label>
                  <select
                    className="settings-input"
                    value={prefs.timezone}
                    onChange={e => setPrefs({ ...prefs, timezone: e.target.value })}
                  >
                    {["Asia/Kolkata", "UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Dubai"].map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="settings-row">
                  <label>Currency</label>
                  <select
                    className="settings-input"
                    value={prefs.currency}
                    onChange={e => setPrefs({ ...prefs, currency: e.target.value })}
                  >
                    {["INR", "USD", "EUR", "GBP", "AED"].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <button className="settings-save-btn" onClick={savePrefs}>
                  <FiSave size={15} /> Save Preferences
                </button>
              </div>
            </>
          )}

          {/* ══ DANGER ZONE ══ */}
          {activeTab === "danger" && (
            <>
              <h2>Account Management</h2>
              <p className="settings-section-subtitle">
                Manage critical account actions. These cannot be undone.
              </p>
              <div className="settings-form">
                <div className="danger-action-card">
                  <div>
                    <h3><FiLogOut size={16} /> Sign Out</h3>
                    <p>Sign out from your current session on this device.</p>
                  </div>
                  <button
                    className="settings-save-btn"
                    style={{ background: "#475569" }}
                    type="button"
                    onClick={handleLogout}
                  >
                    <FiLogOut size={15} /> Logout
                  </button>
                </div>

                <div className="danger-zone">
                  <h3><FiTrash2 size={16} /> Delete Account</h3>
                  <p>
                    Permanently delete your account and all data. This action{" "}
                    <strong>cannot be undone</strong>.
                  </p>
                  <button
                    className="danger-btn"
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <FiTrash2 size={15} /> Delete My Account
                  </button>
                </div>
              </div>
            </>
          )}

        </div>{/* end settings-section */}
      </div>{/* end settings-body */}

      {/* ── Delete confirmation modal ── */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon"><FiAlertCircle size={32} /></div>
            <h2>Delete Account?</h2>
            <p>
              This action <strong>cannot be undone</strong>. All your data including
              sessions, bookings and profile will be permanently deleted.
            </p>
            <div className="modal-buttons">
              <button
                className="cancel-modal-btn"
                type="button"
                onClick={() => setShowDeleteModal(false)}
              >
                <FiX size={15} /> Cancel
              </button>
              <button
                className="confirm-modal-btn"
                type="button"
                onClick={handleDeleteAccount}
              >
                <FiTrash2 size={15} /> Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
