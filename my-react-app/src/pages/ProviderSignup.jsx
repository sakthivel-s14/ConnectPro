import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/ProviderSignup.css";

export default function ProviderSignup() {

  const navigate = useNavigate();

  // ================= STATES =================

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [skills, setSkills] = useState("");

  const [experience, setExperience] = useState("");

  const [password, setPassword] = useState("");

  // ================= HANDLE SIGNUP =================

  const handleProviderSignup = () => {

    // EMPTY CHECK

    if (
      !name ||
      !email ||
      !skills ||
      !experience ||
      !password
    ) {
      alert("Please fill all fields");
      return;
    }

    // PROVIDER DATA

    const providerData = {
      name,
      email,
      skills,
      experience,
      password,
      role: "provider",
    };

    // SAVE TO LOCAL STORAGE

    localStorage.setItem(
      "connectpro_provider",
      JSON.stringify(providerData)
    );

    alert("Provider Account Created Successfully!");

    // REDIRECT TO LOGIN

    navigate("/login");
  };

  return (

    <div className="provider-page">

      {/* ================= LEFT SIDE ================= */}

      <div className="provider-left">

        {/* LEFT CONTAINER */}

        <div className="left-container">

          <div className="welcome-tag">
            Provider Account
          </div>

          <h1>
            Become A
            <br />
            Mentor Today
          </h1>

          <p>
            Share your expertise, guide learners,
            conduct mentorship sessions, and build
            your professional brand with ConnectPro.
          </p>

          {/* FEATURES */}

          <div className="feature-list">

            <div className="feature-item">
              <span>✓</span>
              <p>Earn From Mentorship</p>
            </div>

            <div className="feature-item">
              <span>✓</span>
              <p>Build Your Audience</p>
            </div>

            <div className="feature-item">
              <span>✓</span>
              <p>Conduct Live Sessions</p>
            </div>

            <div className="feature-item">
              <span>✓</span>
              <p>Professional Growth</p>
            </div>

          </div>

          {/* TAGS */}

          <div className="tags">

            <span>Earn</span>

            <span>Mentor</span>

            <span>Growth</span>

            <span>Career</span>

          </div>

        </div>

      </div>

      {/* ================= RIGHT SIDE ================= */}

      <div className="provider-right">

        <div className="provider-card">

          <div className="provider-badge">
            Start Mentoring
          </div>

          <h2>Create Provider Account</h2>

          <p className="subtitle">
            Join as a mentor and inspire learners.
          </p>

          {/* FULL NAME */}

          <div className="input-group">

            <label>Full Name</label>

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

            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>

          {/* SKILLS */}

          <div className="input-group">

            <label>Skills / Expertise</label>

            <input
              type="text"
              placeholder="Example: React, UI/UX, AI"
              value={skills}
              onChange={(e) =>
                setSkills(e.target.value)
              }
            />

          </div>

          {/* EXPERIENCE */}

          <div className="input-group">

            <label>Experience</label>

            <input
              type="text"
              placeholder="Example: 3 Years"
              value={experience}
              onChange={(e) =>
                setExperience(e.target.value)
              }
            />

          </div>

          {/* PASSWORD */}

          <div className="input-group">

            <label>Password</label>

            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

          </div>

          {/* BUTTON */}

          <button
            className="provider-btn"
            onClick={handleProviderSignup}
          >
            Become A Provider
          </button>

          {/* DIVIDER */}

          <div className="divider">
            <span>OR</span>
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