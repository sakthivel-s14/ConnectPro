import React, { useState, useRef, useEffect } from "react";
import { FiCheckCircle } from "react-icons/fi";
import "../styles/LoginPage.css";
import { getStoredUsers, getStoredProviders, setAuth, saveStoredUsers } from "../utils/storage";
import { Link, useNavigate } from "react-router-dom";
import { googleSignIn, GOOGLE_CLIENT_ID } from "../utils/googleAuth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef(null);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  // ── Decode Google JWT and return user info ──
  const decodeJwt = (credential) => {
    try {
      const base64 = credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(decodeURIComponent(atob(base64).split("").map(c =>
        "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")));
    } catch { return null; }
  };

  // ── Given Google user info → find or create account ──
  const loginWithGoogleUser = ({ name, email: gEmail, picture }) => {
    // Provider?
    const providers    = getStoredProviders();
    const foundProvider = providers.find(p => p.email.toLowerCase() === gEmail.toLowerCase());
    if (foundProvider) {
      setAuth({ role: "provider", email: foundProvider.email, picture });
      navigate("/provider-home"); return;
    }
    // Pending application?
    const apps = JSON.parse(localStorage.getItem("connectpro_provider_applications") || "[]");
    const app  = apps.find(a => a.email.toLowerCase() === gEmail.toLowerCase());
    if (app?.status === "pending")  { alert("⏳ Your provider application is under review. Please wait for admin approval."); return; }
    if (app?.status === "rejected") { alert("❌ Your provider application was not approved. Please contact support."); return; }
    // Existing user?
    const users     = getStoredUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === gEmail.toLowerCase());
    if (foundUser) {
      setAuth({ role: "user", email: foundUser.email, picture });
      navigate("/user-home"); return;
    }
    // New user — auto-register
    const newUser = { name, email: gEmail, password: "", role: "user", picture, googleAuth: true, createdAt: new Date().toISOString() };
    saveStoredUsers([...users, newUser]);
    setAuth({ role: "user", email: gEmail, picture });
    navigate("/user-home");
  };

  // ── Google button click ──
  const handleGoogleClick = async () => {
    if (GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") {
      alert("Google Sign-In is not configured yet.\n\nTo enable it:\n1. Get a Client ID from console.cloud.google.com\n2. Create .env file with VITE_GOOGLE_CLIENT_ID=your_id\n3. Restart the dev server");
      return;
    }
    setGoogleLoading(true);
    try {
      const googleUser = await googleSignIn();
      loginWithGoogleUser(googleUser);
    } catch (err) {
      alert(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Email/password login ──
  const handleLogin = () => {
    if (!email || !password) { alert("Please enter email and password"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert("Please enter a valid email address"); return; }

    // Admin
    if (email.toLowerCase() === "admin@connectpro.com" && password === "admin123") {
      setAuth({ role: "admin", email: "admin@connectpro.com" });
      navigate("/admin"); return;
    }
    // Pending applications
    const apps  = JSON.parse(localStorage.getItem("connectpro_provider_applications") || "[]");
    const app   = apps.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
    if (app?.status === "pending")  { alert("⏳ Your provider application is under review."); return; }
    if (app?.status === "rejected") { alert("❌ Your provider application was not approved.\n" + (app.rejectionReason ? `Reason: ${app.rejectionReason}` : "")); return; }

    const users     = getStoredUsers();
    const providers = getStoredProviders();
    const foundUser     = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    const foundProvider = providers.find(p => p.email.toLowerCase() === email.toLowerCase());

    if (foundUser && password === foundUser.password) {
      setAuth({ role: "user", email: foundUser.email });
      navigate("/user-home"); return;
    }
    if (foundProvider && password === foundProvider.password) {
      setAuth({ role: "provider", email: foundProvider.email });
      navigate("/provider-home"); return;
    }
    alert("Invalid email or password. Please check your credentials or create a new account.");
  };

  return (
    <div className="login-page">

      {/* ===== LEFT SIDE ===== */}
      <div className="login-left">
        <Link to="/" className="top-back-btn">← Back</Link>
        <div className="left-container">
          <div className="welcome-tag">{greeting}</div>
          <h1>Welcome Back</h1>
          <h3>Continue Your Learning Journey</h3>
          <p>Connect with mentors, attend live mentorship sessions, prepare for interviews, and accelerate your professional growth.</p>
          <div className="feature-list">
            <div className="feature-item"><FiCheckCircle size={20} /><p>1:1 Mentorship Sessions</p></div>
            <div className="feature-item"><FiCheckCircle size={20} /><p>Mock Interview Preparation</p></div>
            <div className="feature-item"><FiCheckCircle size={20} /><p>Career Guidance &amp; Support</p></div>
            <div className="feature-item"><FiCheckCircle size={20} /><p>Trusted by 10,000+ Learners</p></div>
          </div>
          <div className="tags">
            <span>Career</span><span>Interview</span><span>Resume</span><span>Mentorship</span>
          </div>
        </div>
      </div>

      {/* ===== RIGHT SIDE ===== */}
      <div className="login-right">
        <div className="login-card">

          <h2>Sign In</h2>
          <p className="subtitle">Continue your mentorship journey with us.</p>

          {/* EMAIL */}
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="Enter your email" value={email}
              onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>

          {/* PASSWORD */}
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" value={password}
              onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>

          {/* OPTIONS */}
          <div className="options">
            <label className="remember"><input type="checkbox" /><span>Remember me</span></label>
            <a href="/" className="forgot-link">Forgot Password?</a>
          </div>

          {/* SIGN IN BUTTON */}
          <button className="signin-btn" onClick={handleLogin}>Sign In</button>

          {/* DIVIDER */}
          <div className="divider"><span>OR</span></div>

          {/* GOOGLE SIGN-IN — below Sign In button */}
          <button
            className={`google-btn ${googleLoading ? "google-btn-loading" : ""}`}
            onClick={handleGoogleClick}
            disabled={googleLoading}
            id="google-signin-btn"
          >
            {googleLoading ? (
              <><span className="google-spinner" /> Signing in with Google...</>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.4 30.2 0 24 0 14.7 0 6.8 5.4 2.9 13.3l7.9 6.1C12.7 13 17.9 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>
                  <path fill="#FBBC05" d="M10.8 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.7-4.6L2.3 13.3A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.7l8.3-6.1z"/>
                  <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.7 2.2-7.7 2.2-6.1 0-11.3-4.1-13.2-9.6l-8.3 6.1C6.8 42.6 14.7 48 24 48z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* BOTTOM */}
          <p className="bottom-text">
            Don't have an account?{" "}<Link to="/register">Create Account</Link>
          </p>

        </div>
      </div>
    </div>
  );
}