import React, { useState } from "react";
import { FiCheckCircle, FiBriefcase, FiTrendingUp, FiUsers } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import "../styles/ProviderSignup.css";
import { getStoredUsers, getStoredProviders, saveStoredProviders } from "../utils/storage";

export default function ProviderSignup() {

  const navigate = useNavigate();

  // ================= STATES =================

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [skills, setSkills] = useState("");

  const [experience, setExperience] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  // ================= HANDLE SIGNUP =================

  const handleProviderSignup = () => {

    // EMPTY CHECK

    if (
      !name ||
      !email ||
      !skills ||
      !experience ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill all fields");
      return;
    }

    // NAME VALIDATION

    if (name.trim().length < 2) {
      alert("Name must be at least 2 characters long");
      return;
    }

    // EMAIL VALIDATION

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    // PASSWORD VALIDATION

    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    // PASSWORD CHECK

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // SKILLS VALIDATION

    if (skills.trim().length < 3) {
      alert("Please enter at least 3 characters for skills");
      return;
    }

    // EXPERIENCE VALIDATION

    if (experience.trim().length < 5) {
      alert("Please provide more details about your experience");
      return;
    }

    // CHECK IF EMAIL ALREADY EXISTS

    const existingUsers = getStoredUsers();
    const existingProviders = getStoredProviders();

    if (
      existingUsers.some((user) => user.email.toLowerCase() === email.toLowerCase()) ||
      existingProviders.some((provider) => provider.email.toLowerCase() === email.toLowerCase())
    ) {
      alert("This email is already registered. Please login or use a different email.");
      return;
    }

    // PROVIDER DATA

    const providerData = {
      name: name.trim(),
      email: email.toLowerCase(),
      skills: skills.trim(),
      experience: experience.trim(),
      password,
      role: "provider",
    };

    // SAVE TO LOCAL STORAGE

    saveStoredProviders([...existingProviders, providerData]);

    alert("Provider Account Created Successfully! Redirecting to login...");

    // CLEAR FORM

    setName("");
    setEmail("");
    setSkills("");
    setExperience("");
    setPassword("");
    setConfirmPassword("");

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
              <FiCheckCircle size={20} />
              <p>Earn From Mentorship</p>
            </div>

            <div className="feature-item">
              <FiCheckCircle size={20} />
              <p>Build Your Audience</p>
            </div>

            <div className="feature-item">
              <FiCheckCircle size={20} />
              <p>Conduct Live Sessions</p>
            </div>

            <div className="feature-item">
              <FiCheckCircle size={20} />
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
              placeholder="Create password (min 6 characters)"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

          </div>

          {/* CONFIRM PASSWORD */}

          <div className="input-group">

            <label>Confirm Password</label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
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