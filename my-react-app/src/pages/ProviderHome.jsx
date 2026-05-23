import React from "react";
import "../styles/ProviderHome.css";

export default function ProviderHome() {

  // ================= GREETING =================

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  }

  return (

    <div className="provider-home">

      {/* ================= SIDEBAR ================= */}

      <div className="provider-sidebar">

        {/* LOGO */}

        <div>

          <div className="provider-logo-section">

            <div className="provider-logo-circle">
              C
            </div>

            <div>

              <h2 className="provider-logo">
                ConnectPro
              </h2>

              <p className="provider-subtitle">
                Provider Dashboard
              </p>

            </div>

          </div>

          {/* STATUS */}

          <div className="provider-status-box">

            <div className="status-icon">
              ⌘
            </div>

            <p>
              Mentorship Active
            </p>

          </div>

          {/* MENU */}

          <div className="provider-menu-section">

            <p className="provider-menu-title">
              Manage
            </p>

            <ul>

              <li className="active-provider-menu">
                <span>⌂</span>
                Dashboard
              </li>

              <li>
                <span>◫</span>
                Session Bookings
              </li>

              <li>
                <span>◷</span>
                Calendar
              </li>

              <li>
                <span>✦</span>
                Upcoming Meetings
              </li>

              <li>
                <span>⌁</span>
                Reviews
              </li>

            </ul>

          </div>

          {/* ANALYTICS */}

          <div className="provider-menu-section">

            <p className="provider-menu-title">
              Insights
            </p>

            <ul>

              <li>
                <span>◔</span>
                Analytics
              </li>

              <li>
                <span>⬒</span>
                Earnings
              </li>

              <li>
                <span>⚙</span>
                Settings
              </li>

            </ul>

          </div>

        </div>

        {/* PROFILE */}

        <div className="provider-profile-box">

          <img
            src="https://i.pravatar.cc/100?img=12"
            alt="profile"
          />

          <div>

            <h4>Sakthivel</h4>

            <p>Professional Mentor</p>

          </div>

        </div>

      </div>

      {/* ================= MAIN CONTENT ================= */}

      <div className="provider-main">

        {/* TOP NAVBAR */}

        <div className="provider-navbar">

          {/* SEARCH */}

          <div className="provider-search">

            <input
              type="text"
              placeholder="Search bookings, sessions..."
            />

          </div>

          {/* RIGHT */}

          <div className="provider-nav-right">

            <button className="notification-btn">
              ⌁
            </button>

            <img
              src="https://i.pravatar.cc/100?img=12"
              alt="profile"
              className="top-profile"
            />

          </div>

        </div>

        {/* GREETING */}

        <div className="provider-greeting">

          <h1>
            {greeting}, Sakthivel
          </h1>

          <p>
            Manage your mentorship sessions and grow your earnings.
          </p>

        </div>

        {/* HERO SECTION */}

        <div className="provider-hero">

          {/* LEFT */}

          <div className="provider-hero-left">

            <div className="hero-badge">
              Provider Dashboard
            </div>

            <h2>
              Grow Your
              <br />
              Mentorship Career
            </h2>

            <p>
              Manage bookings, conduct mentorship sessions,
              track earnings, and build your professional brand.
            </p>

            <div className="provider-hero-buttons">

              <button className="primary-provider-btn">
                View Sessions
              </button>

              <button className="secondary-provider-btn">
                Calendar
              </button>

            </div>

          </div>

          {/* RIGHT */}

          <div className="provider-progress-card">

           

           

            

            <p className="progress-text">
              Excellent provider profile performance
            </p>

          </div>

        </div>

        {/* CARDS */}

        <div className="provider-cards">

          {/* EARNINGS */}

          <div className="provider-card">

            <h3>Total Earnings</h3>

            <h1>₹1,24,000</h1>

            <p>
              +18% this month
            </p>

          </div>

          {/* BOOKINGS */}

          <div className="provider-card">

            <h3>Session Bookings</h3>

            <h1>142</h1>

            <p>
              12 new bookings this week
            </p>

          </div>

          {/* MEETING */}

          <div className="provider-card">

            <h3>Upcoming Meeting</h3>

            <h4>
              Frontend Interview Session
            </h4>

            <p>
              Today • 7:30 PM
            </p>

            <button className="join-session-btn">
              Join Session
            </button>

          </div>

          {/* ANALYTICS */}

          <div className="provider-card">

            <h3>Analytics</h3>

            <ul>

              <li>
                24 Sessions Completed
              </li>

              <li>
                12 Certificates Shared
              </li>

              <li>
                98% Positive Feedback
              </li>

            </ul>

          </div>

        </div>

      </div>

    </div>

  );
}