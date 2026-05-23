import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfilePage.css";
import {
  FiEdit2, FiSave, FiX, FiArrowLeft, FiUser, FiMail,
  FiMapPin, FiLinkedin, FiCalendar, FiDollarSign,
  FiBriefcase, FiBook, FiStar, FiCheck, FiSettings,
} from "react-icons/fi";
import { getAuth, getCurrentProfile, updateCurrentProfile } from "../utils/storage";

export default function ProfilePage() {
  const navigate = useNavigate();
  const auth     = getAuth();
  const homeRoute = auth?.role === "provider" ? "/provider-home" : "/user-home";
  const initialProfile = getCurrentProfile() || {};

  const [user, setUser]         = useState({ ...auth, ...initialProfile });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData]   = useState({ ...user });
  const [toast, setToast]         = useState(null);

  const bookings    = JSON.parse(localStorage.getItem("userBookings") || "[]");
  const myBookings  = auth?.role === "provider"
    ? bookings.filter(b => b.providerEmail === auth.email)
    : bookings;
  const totalSpent  = myBookings.reduce((s, b) => s + (b.totalPrice || 0), 0);

  const handleSave = () => {
    if (!formData.name?.trim()) { setToast({ msg: "Name cannot be empty.", type: "error" }); return; }
    const updated = { ...user, ...formData };
    updateCurrentProfile(updated);
    setUser(updated);
    setIsEditing(false);
    setToast({ msg: "Profile saved successfully!", type: "success" });
    setTimeout(() => setToast(null), 3000);
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

          {/* LEFT: STATS */}
          <div className="profile-sidebar-col">
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

                {/* SKILL TAGS */}
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
