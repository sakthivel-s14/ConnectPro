import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiTarget, FiVideo, FiBriefcase, FiTrendingUp, FiFileText, FiMail, FiPhone, FiMapPin, FiStar, FiZap, FiCheck } from "react-icons/fi";
import "../styles/App.css";

export default function LandingPage() {

  // ── Contact form state ─────────────────────────────────────
  const [contactName,    setContactName]    = useState("");
  const [contactEmail,   setContactEmail]   = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSent,    setContactSent]    = useState(false);
  const [contactError,   setContactError]   = useState("");

  const handleSendMessage = () => {
    // Basic validation
    if (!contactName.trim())    { setContactError("Please enter your name.");    return; }
    if (!contactEmail.trim())   { setContactError("Please enter your email.");   return; }
    if (!contactMessage.trim()) { setContactError("Please write your message."); return; }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim());
    if (!emailOk) { setContactError("Please enter a valid email address."); return; }

    // Save to localStorage so admin can view it
    const newMsg = {
      id:        Date.now(),
      name:      contactName.trim(),
      email:     contactEmail.trim(),
      message:   contactMessage.trim(),
      sentAt:    new Date().toISOString(),
      read:      false,
    };
    const existing = JSON.parse(localStorage.getItem("connectpro_contact_messages") || "[]");
    existing.push(newMsg);
    localStorage.setItem("connectpro_contact_messages", JSON.stringify(existing));

    setContactSent(true);
    setContactError("");
    setContactName("");
    setContactEmail("");
    setContactMessage("");
  };


  const services = [
    {
      title: "1:1 Mentorship",
      description:
        "Connect with experienced mentors and grow your career faster.",
      icon: <FiTarget size={22} />,
    },
    {
      title: "Live Video Meetings",
      description:
        "Join secure one-on-one sessions in a smooth video room experience.",
      icon: <FiVideo size={22} />,
    },
    {
      title: "Mock Interviews",
      description:
        "Practice real-world interviews with industry professionals.",
      icon: <FiBriefcase size={22} />,
    },
    {
      title: "Career Guidance",
      description:
        "Get personalized advice for your professional journey.",
      icon: <FiTrendingUp size={22} />,
    },
    {
      title: "Resume Review",
      description:
        "Improve your resume and LinkedIn profile professionally.",
      icon: <FiFileText size={22} />,
    },
  ];

  // ================= SCROLL FUNCTION =================

  const scrollToJoin = () => {
    const section = document.getElementById("join");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="landing-page">

      {/* ================= NAVBAR ================= */}

      <header className="navbar">

        <div className="logo">ConnectPro</div>

        <nav>
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="nav-buttons">
          <Link to="/login">
            <button className="login-btn">Login</button>
          </Link>
          <button className="start-btn" onClick={scrollToJoin}>
            Get Started
          </button>
        </div>

      </header>

      {/* ================= HERO SECTION ================= */}

      <section className="hero" id="home">

        <div className="hero-left">

          <div className="hero-tag">
            <FiZap size={13} /> The #1 Mentorship Platform
          </div>

          <h1>
            Monetize Your <span>Knowledge</span> With Online Mentorship
          </h1>

          <p>
            Build your personal brand, connect with learners, schedule
            mentorship sessions, and join live one-on-one meetings with mentors
            in a modern video room experience.
          </p>

          <div className="hero-buttons">
            <button className="hero-cta-primary" onClick={scrollToJoin}>
              Get Started Free
            </button>
            <Link to="/login">
              <button className="hero-cta-secondary">
                Explore Mentors
              </button>
            </Link>
          </div>

          <div className="stats">
            <div>
              <h2>10K+</h2>
              <p>Sessions</p>
            </div>
            <div>
              <h2>5K+</h2>
              <p>Users</p>
            </div>
            <div>
              <h2>1K+</h2>
              <p>Mentors</p>
            </div>
          </div>

        </div>

        <div className="hero-right">

          <div className="dashboard-card">

            <h2>Mentor Dashboard</h2>

            <div className="dashboard-box">
              <p>Total Earnings</p>
              <h3>₹1,24,000</h3>
            </div>

            <div className="dashboard-small">
              <div>
                <p>Bookings</p>
                <h4>142</h4>
              </div>
              <div>
                <p>Reviews</p>
                <h4>4.9 <FiStar size={14} style={{ color: "#f59e0b" }} /></h4>
              </div>
            </div>

            <div className="session-box">
              <h4>Upcoming Session</h4>
              <p>Frontend Interview • 7:30 PM</p>
              <Link to="/login">
                <button className="login-btn">JOIN NOW</button>
              </Link>
            </div>

          </div>

        </div>

      </section>

      {/* ================= ABOUT SECTION ================= */}

      <section className="about" id="about">

        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop"
            alt="Team collaboration"
          />
        </div>

        <div className="about-content">

          <h2>About Our Platform</h2>

          <p>
            Our platform helps professionals connect with learners through
            mentorship, consultations, career guidance, and online sessions.
          </p>

          <p>
            Whether you are a student, developer, freelancer, or mentor, our
            platform helps you build your professional network.
          </p>

          <div className="about-boxes">

            <div className="about-box">
              <h3>100%</h3>
              <p>Secure Payments</p>
            </div>

            <div className="about-box">
              <h3>24/7</h3>
              <p>Community Support</p>
            </div>

            <div className="about-box">
              <h3>50K+</h3>
              <p>Happy Learners</p>
            </div>

            <div className="about-box">
              <h3>4.9★</h3>
              <p>Average Rating</p>
            </div>

          </div>

        </div>

      </section>

      {/* ================= SERVICES SECTION ================= */}

      <section className="services" id="services">

        <h2>Our Services</h2>

        <p className="service-text">
          Everything you need to grow professionally and connect with experts.
        </p>

        <div className="service-container">

          {services.map((service, index) => (
            <div className="service-card" key={index}>
              <div className="service-icon">
                {service.icon}
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <button>Learn More</button>
            </div>
          ))}

        </div>

      </section>

      {/* ================= JOIN SECTION ================= */}

      <section className="join-section" id="join">

        {/* MEMBER */}
        <div className="join-card">
          <h2>Become A Member</h2>
          <p>
            Join thousands of learners and connect with industry professionals.
            Access curated mentorship and accelerate your growth.
          </p>
          <Link to="/user-signup">
            <button className="member-btn">Join Now →</button>
          </Link>
        </div>

        {/* PROVIDER */}
        <div className="join-card">
          <h2>Become A Provider</h2>
          <p>
            Start offering mentorship and monetize your professional skills.
            Build your brand and earn on your own schedule.
          </p>
          <Link to="/provider-signup">
            <button className="provider-btn">Start Providing →</button>
          </Link>
        </div>

      </section>

      {/* ================= CONTACT SECTION ================= */}

      <section className="contact" id="contact">

        <div className="contact-left">

          <h2>Contact Us</h2>

          <p>
            Have questions or partnership ideas? Reach out to us anytime.
            We'd love to hear from you.
          </p>

          <div className="contact-info">
            <p><FiMail size={17} /> support@connectpro.com</p>
            <p><FiPhone size={17} /> +91 78712 16558</p>
            <p><FiMapPin size={17} /> Chennai, Tamil Nadu</p>
          </div>

        </div>

        <div className="contact-right">
          {contactSent ? (
            /* ── Success state ── */
            <div className="contact-success">
              <div className="contact-success-icon">
                <FiCheck size={36} />
              </div>
              <h3>Message Sent!</h3>
              <p>Thank you for reaching out. We'll get back to you shortly.</p>
              <button
                className="contact-send-again-btn"
                onClick={() => setContactSent(false)}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <>
              <input
                type="text"
                placeholder="Enter your name"
                value={contactName}
                onChange={e => { setContactName(e.target.value); setContactError(""); }}
              />
              <input
                type="email"
                placeholder="Enter your email"
                value={contactEmail}
                onChange={e => { setContactEmail(e.target.value); setContactError(""); }}
              />
              <textarea
                rows="5"
                placeholder="Write your message"
                value={contactMessage}
                onChange={e => { setContactMessage(e.target.value); setContactError(""); }}
              />
              {contactError && (
                <p className="contact-error">{contactError}</p>
              )}
              <button onClick={handleSendMessage}>Send Message</button>
            </>
          )}
        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <div className="footer-content">

          <div>
            <h2>ConnectPro</h2>
            <p>
              Modern mentorship and networking platform for professionals
              and aspiring learners.
            </p>
          </div>

          <div>
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3>Services</h3>
            <ul>
              <li>Mentorship</li>
              <li>Mock Interviews</li>
              <li>Career Guidance</li>
              <li>Resume Review</li>
            </ul>
          </div>

          <div>
            <h3>Newsletter</h3>
            <input type="email" placeholder="Enter your email" />
            <button>Subscribe</button>
          </div>

        </div>

        <div className="footer-bottom">
          © 2026 ConnectPro. All rights reserved.
        </div>

      </footer>

    </div>
  );
}