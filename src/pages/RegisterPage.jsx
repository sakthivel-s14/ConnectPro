import React from "react";
import { Link } from "react-router-dom";
import { FiTrendingUp, FiTarget, FiBriefcase, FiUser, FiSmile } from "react-icons/fi";
import "../styles/RegisterPage.css";

export default function RegisterPage() {
  return (
    <div className="register-page">

      {/* LEFT SIDE */}

      <div className="register-left">

        <div className="overlay"></div>

        <div className="left-content">

          

          <h1>
            Choose Your
            <br />
            Account Type
          </h1>

          <p>
            Start your journey with ConnectPro.
            Learn from experts or become a mentor
            and grow your professional network.
          </p>

          <div className="features">

            <div className="feature-card">
              <FiTrendingUp size={22} />
              <p>Career Growth</p>
            </div>

            <div className="feature-card">
              <FiTarget size={22} />
              <p>1:1 Mentorship</p>
            </div>

            <div className="feature-card">
              <FiBriefcase size={22} />
              <p>Mock Interviews</p>
            </div>

          </div>

        </div>
      </div>

      {/* RIGHT SIDE */}

      <div className="register-right">

        <div className="register-card">

          <div className="welcome-badge">
            <FiSmile size={18} /> Welcome
          </div>

          <h2>Create Account</h2>

          <p className="subtitle">
            Select how you want to continue.
          </p>

          {/* USER CARD */}

          <Link
            to="/user-signup"
            className="role-card"
          >

            <div className="role-icon">
              <FiUser size={24} />
            </div>

            <div className="role-info">

              <h3>Continue as User</h3>

              <p>
                Book mentorship sessions,
                learn skills, and grow your career.
              </p>

            </div>

          </Link>

          {/* PROVIDER CARD */}

          <Link
            to="/provider-signup"
            className="role-card"
          >

            <div className="role-icon">
              <FiBriefcase size={24} />
            </div>

            <div className="role-info">

              <h3>Continue as Provider</h3>

              <p>
                Offer mentorship, consultations,
                and grow your professional audience.
              </p>

            </div>

          </Link>

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