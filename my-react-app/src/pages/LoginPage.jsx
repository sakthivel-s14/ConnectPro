import React, { useState } from "react";

import "../styles/LoginPage.css";

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

  let greeting = "Good Evening 🌙";

  if (hour < 12) {

    greeting = "Good Morning ☀️";

  }

  else if (hour < 18) {

    greeting = "Good Afternoon 🌤️";

  }

  // ================= LOGIN FUNCTION =================

  const handleLogin = () => {

    // GET USER DATA

    const savedUser = JSON.parse(
      localStorage.getItem(
        "connectpro_user"
      )
    );

    // GET PROVIDER DATA

    const savedProvider = JSON.parse(
      localStorage.getItem(
        "connectpro_provider"
      )
    );

    // EMPTY CHECK

    if (!email || !password) {

      alert(
        "Please enter email and password"
      );

      return;
    }

    // ================= USER LOGIN =================

    if (

      savedUser &&

      email === savedUser.email &&

      password === savedUser.password

    ) {

      alert("User Login Successful");

      navigate("/user-home");

      return;
    }

    // ================= PROVIDER LOGIN =================

    if (

      savedProvider &&

      email === savedProvider.email &&

      password === savedProvider.password

    ) {

      alert("Provider Login Successful");

      navigate("/provider-home");

      return;
    }

    // ================= INVALID LOGIN =================

    alert(
      "Invalid email or password"
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

              <span>✓</span>

              <p>
                1:1 Mentorship Sessions
              </p>

            </div>

            <div className="feature-item">

              <span>✓</span>

              <p>
                Mock Interview Preparation
              </p>

            </div>

            <div className="feature-item">

              <span>✓</span>

              <p>
                Career Guidance & Support
              </p>

            </div>

            <div className="feature-item">

              <span>✓</span>

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