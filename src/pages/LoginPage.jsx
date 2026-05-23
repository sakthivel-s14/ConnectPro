import React, { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";

import "../styles/LoginPage.css";
import { getStoredUsers, getStoredProviders, setAuth } from "../utils/storage";

import {
  Link,
  useNavigate,
} from "react-router-dom";

export default function LoginPage() {

  // ================= NAVIGATION =================

  const navigate = useNavigate();

  // ================= STATES =================

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  // ================= GREETING =================

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {

    greeting = "Good Morning";

  }

  else if (hour < 18) {

    greeting = "Good Afternoon";

  }

  // ================= LOGIN FUNCTION =================

  const handleLogin = () => {

    // EMPTY CHECK

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    // EMAIL VALIDATION

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    // ADMIN LOGIN

    const adminEmail = "admin@connectpro.com";
    const adminPassword = "admin123";

    if (
      email.toLowerCase() === adminEmail &&
      password === adminPassword
    ) {
      setAuth({ role: "admin", email: adminEmail });

      alert("Admin Login Successful!");
      setEmail("");
      setPassword("");
      navigate("/admin");
      return;
    }

    // GET USER DATA

    const savedUsers = getStoredUsers();
    const savedProviders = getStoredProviders();

    const foundUser = savedUsers.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
    const foundProvider = savedProviders.find(
      (provider) => provider.email.toLowerCase() === email.toLowerCase()
    );

    // ================= USER LOGIN =================

    if (
      foundUser &&
      password === foundUser.password
    ) {
      setAuth({ role: "user", email: foundUser.email });

      alert("User Login Successful!");
      setEmail("");
      setPassword("");
      navigate("/user-home");
      return;
    }

    // ================= PROVIDER LOGIN =================

    if (
      foundProvider &&
      password === foundProvider.password
    ) {
      setAuth({ role: "provider", email: foundProvider.email });

      alert("Provider Login Successful!");
      setEmail("");
      setPassword("");
      navigate("/provider-home");
      return;
    }

    // ================= INVALID LOGIN =================

    alert(
      "Invalid email or password. Please check your credentials or create a new account."
    );
  };

  return (

    <div className="login-page">

      {/* ================= LEFT SIDE ================= */}

      <div className="login-left">

        {/* BACK BUTTON */}

        <Link
          to="/"
          className="top-back-btn"
        >
          ← Back
        </Link>

        {/* CONTENT BOX */}

        <div className="left-container">

          {/* GREETING */}

          <div className="welcome-tag">

            {greeting}

          </div>

          {/* HEADING */}

          <h1>

            Welcome Back

          </h1>

          <h3>

            Continue Your Learning Journey

          </h3>

          {/* DESCRIPTION */}

          <p>

            Connect with mentors,
            attend live mentorship sessions,
            prepare for interviews,
            and accelerate your
            professional growth.

          </p>

          {/* FEATURES */}

          <div className="feature-list">

            <div className="feature-item">

              <FiCheckCircle size={20} />

              <p>
                1:1 Mentorship Sessions
              </p>

            </div>

            <div className="feature-item">

              <FiCheckCircle size={20} />

              <p>
                Mock Interview Preparation
              </p>

            </div>

            <div className="feature-item">

              <FiCheckCircle size={20} />

              <p>
                Career Guidance & Support
              </p>

            </div>

            <div className="feature-item">

              <FiCheckCircle size={20} />

              <p>
                Trusted by 10,000+ Learners
              </p>

            </div>

          </div>

          {/* TAGS */}

          <div className="tags">

            <span>Career</span>

            <span>Interview</span>

            <span>Resume</span>

            <span>Mentorship</span>

          </div>

        </div>

      </div>

      {/* ================= RIGHT SIDE ================= */}

      <div className="login-right">

        <div className="login-card">

          {/* TITLE */}

          <h2>
            Sign In
          </h2>

          <p className="subtitle">

            Continue your mentorship
            journey with us.

          </p>

          {/* EMAIL */}

          <div className="input-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>

          {/* PASSWORD */}

          <div className="input-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

          </div>

          {/* OPTIONS */}

          <div className="options">

            <label className="remember">

              <input type="checkbox" />

              <span>
                Remember me
              </span>

            </label>

            <a
              href="/"
              className="forgot-link"
            >
              Forgot Password?
            </a>

          </div>

          {/* SIGN IN BUTTON */}

          <button
            className="signin-btn"
            onClick={handleLogin}
          >
            Sign In
          </button>

          {/* DIVIDER */}

          <div className="divider">

            <span>OR</span>

          </div>

          {/* GOOGLE */}

          <button className="google-btn">

            Continue with Google

          </button>

          {/* BOTTOM */}

          <p className="bottom-text">

            Don’t have an account?{" "}

            <Link to="/register">

              Create Account

            </Link>

          </p>

        </div>

      </div>

    </div>

  );
}