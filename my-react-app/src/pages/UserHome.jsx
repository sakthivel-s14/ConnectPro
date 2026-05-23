import React from "react";

import "../styles/UserHome.css";

import { Link } from "react-router-dom";

import {

  FiHome,
  FiCalendar,
  FiSettings,
  FiBell,
  FiSearch,
  FiBook,
  FiMessageSquare,
  FiTrendingUp,
  FiLogOut,

} from "react-icons/fi";

export default function UserHome() {

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  }

  else if (hour < 18) {
    greeting = "Good Afternoon";
  }

  return (

    <div className="user-home">

      {/* ================= SIDEBAR ================= */}
<div className="sidebar">

  {/* LOGO */}

  <div>

    <div className="sidebar-header">

      <div className="logo-circle">
        C
      </div>

      <div>

        <h2 className="logo-text">
          ConnectPro
        </h2>

        <p className="logo-subtitle">
          User Dashboard
        </p>

      </div>

    </div>

    {/* QUICK STATUS */}

    <div className="status-box">

      <span className="status-icon">
        ⌘
      </span>

      <p>
        Learning actively
      </p>

    </div>

    {/* MENU */}

    <div className="menu-section">

      <p className="menu-title">
        Manage
      </p>

      <ul>

        <li className="active-menu">
          <span>⌂</span>
          Home
        </li>

        <li>
          <span>◫</span>
          Sessions
        </li>

        <li>
          <span>⌁</span>
          Mentors
        </li>

        <li>
          <span>✉</span>
          Messages
        </li>

        <li>
          <span>☰</span>
          Resources
        </li>

      </ul>

    </div>

    {/* PAGE SECTION */}

    <div className="menu-section">

      <p className="menu-title">
        Insights
      </p>

      <ul>

        <li>
          <span>◔</span>
          Analytics
        </li>

        <li>
          <span>⚙</span>
          Settings
        </li>

      </ul>

    </div>

  </div>

  {/* PROFILE */}

  <div className="sidebar-profile">

    <img
      src="https://i.pravatar.cc/100"
      alt="profile"
    />

    <div>

      <h4>Sakthivel</h4>

      <p>User Account</p>

    </div>

  </div>

</div>

      {/* ================= MAIN ================= */}

      <div className="main-content">

        {/* ================= TOPBAR ================= */}

        <div className="topbar">

          {/* SEARCH */}

          <div className="search-box">

            <FiSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search mentors, sessions..."
            />

          </div>

          {/* RIGHT */}

          <div className="top-icons">

            <div className="icon-btn">
              <FiBell />
            </div>

            <img
              className="profile-img"
              src="https://i.pravatar.cc/100"
              alt="profile"
            />

          </div>

        </div>

        {/* ================= GREETING ================= */}

        <div className="greeting-section">

          <h1>
            {greeting}
          </h1>

          <h2>
            Continue your professional learning journey.
          </h2>

        </div>

        {/* ================= HERO ================= */}

        <div className="hero-section">

          <div className="hero-left">

            <span className="hero-tag">
              Learning Dashboard
            </span>

            <h2>

              Continue Growing
              <br />
              Your Career

            </h2>

            <p>

              Learn from industry experts,
              attend mentorship sessions,
              and unlock your professional
              potential.

            </p>

            <div className="hero-buttons">

              <button className="primary-btn">

                Explore Mentors

              </button>

              <button className="secondary-btn">

                My Sessions

              </button>

            </div>

          </div>

          {/* RIGHT */}

          <div className="progress-card">

            <h2>
              Career Progress
            </h2>

            <div className="progress-stats">

              <div>

                <h3>24</h3>

                <p>Sessions</p>

              </div>

              <div>

                <h3>12</h3>

                <p>Certificates</p>

              </div>

            </div>

            <div className="progress-bar">

              <div className="progress-fill"></div>

            </div>

            <span className="progress-text">

              75% Learning Progress

            </span>

          </div>

        </div>

        {/* ================= GRID ================= */}

        <div className="dashboard-grid">

          <div className="dashboard-card">

            <h3>
              Upcoming Session
            </h3>

            <p>
              Frontend Mock Interview
            </p>

            <span>
              Today • 7:30 PM
            </span>

            <button>
              Join Session
            </button>

          </div>

          <div className="dashboard-card">

            <h3>
              Total Bookings
            </h3>

            <div className="big-number">
              142
            </div>

            <p>
              +12 this week
            </p>

          </div>

          <div className="dashboard-card">

            <h3>
              Recent Activity
            </h3>

            <ul className="activity-list">

              <li>
                Completed Resume Review
              </li>

              <li>
                Joined React Workshop
              </li>

              <li>
                Booked Career Session
              </li>

            </ul>

          </div>

          <div className="dashboard-card">

            <h3>
              Recommended Mentors
            </h3>

            <p>UI/UX Expert</p>

            <p>Frontend Developer</p>

            <p>Career Coach</p>

          </div>

        </div>

      </div>

    </div>

  );
}