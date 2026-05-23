import React, { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import "../styles/UserSignup.css";

export default function UserSignup() {

  // ================= NAVIGATION =================

  const navigate = useNavigate();

  // ================= STATES =================

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  // ================= SIGNUP FUNCTION =================

  const handleSignup = () => {

    // EMPTY CHECK

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword
    ) {

      alert("Please fill all fields");

      return;
    }

    // PASSWORD CHECK

    if (password !== confirmPassword) {

      alert("Passwords do not match");

      return;
    }

    // USER DATA

    const userData = {

      name,
      email,
      password,
      role: "user",

    };

    // SAVE TO LOCAL STORAGE

    localStorage.setItem(
      "connectproUser",
      JSON.stringify(userData)
    );

    // SUCCESS MESSAGE

    alert("Account Created Successfully");

    // REDIRECT TO LOGIN

    navigate("/login");
  };

  return (

    <div className="signup-page">

      {/* ================= LEFT SIDE ================= */}

      <div className="signup-left">

        {/* BACK BUTTON */}

        <Link
          to="/"
          className="top-back-btn"
        >
          ← Back
        </Link>

        <div className="left-container">

          <div className="welcome-tag">

            👨‍🎓 User Account

          </div>

          <h1>

            Start Your
            <br />
            Learning Journey

          </h1>

          <p>

            Create your account and connect
            with industry mentors, book sessions,
            improve your skills, and grow
            professionally.

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
                Career Guidance
              </p>

            </div>

            <div className="feature-item">

              <span>✓</span>

              <p>
                Mock Interviews
              </p>

            </div>

            <div className="feature-item">

              <span>✓</span>

              <p>
                Resume Reviews
              </p>

            </div>

          </div>

          {/* TAGS */}

          <div className="tags">

            <span>
              🚀 Career
            </span>

            <span>
              💼 Interview
            </span>

            <span>
              📄 Resume
            </span>

            <span>
              🎯 Mentorship
            </span>

          </div>

        </div>

      </div>

      {/* ================= RIGHT SIDE ================= */}

      <div className="signup-right">

        <div className="signup-card">

          <h2>
            Create Account
          </h2>

          <p className="subtitle">

            Create your ConnectPro account

          </p>

          {/* FULL NAME */}

          <div className="input-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

          </div>

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
              placeholder="Create password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

          </div>

          {/* CONFIRM PASSWORD */}

          <div className="input-group">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
            />

          </div>

          {/* BUTTON */}

          <button
            className="signup-btn"
            onClick={handleSignup}
          >
            Create Account
          </button>

          {/* DIVIDER */}

          <div className="divider">

            <span>
              OR
            </span>

          </div>

          {/* GOOGLE */}

          <button className="google-btn">

            Continue with Google

          </button>

          {/* LOGIN */}

          <p className="bottom-text">

            Already have an account?{" "}

            <Link to="/login">

              Sign In

            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}