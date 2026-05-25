import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth } from "../utils/storage";
import {
  FiStar, FiArrowLeft, FiCheck, FiThumbsUp, FiThumbsDown,
  FiSend, FiAlertCircle, FiCheckCircle
} from "react-icons/fi";
import "../styles/LeaveReview.css";

const QUALITY_TAGS = [
  "Very knowledgeable", "Great communicator", "Patient teacher",
  "Practical examples", "Well structured", "Inspiring", "Punctual",
  "Good listener", "Career advice", "Technically strong"
];

export default function LeaveReviewPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const auth      = getAuth();

  // Booking info passed via navigate state
  const booking   = location.state?.booking || null;
  const returnTo  = location.state?.returnTo || "/sessions";

  const [rating,       setRating]       = useState(0);
  const [hoverRating,  setHoverRating]  = useState(0);
  const [title,        setTitle]        = useState("");
  const [review,       setReview]       = useState("");
  const [recommend,    setRecommend]    = useState(null); // true | false | null
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitted,    setSubmitted]    = useState(false);
  const [error,        setError]        = useState("");

  // Check if already reviewed
  const reviewKey = `connectpro_reviews`;
  const existingReview = (() => {
    const all = JSON.parse(localStorage.getItem(reviewKey) || "[]");
    return booking ? all.find(r => r.bookingId === booking.id && r.userId === auth?.email) : null;
  })();

  useEffect(() => {
    if (existingReview) setSubmitted(true);
  }, []);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (rating === 0)   { setError("Please select a star rating."); return; }
    if (!title.trim())  { setError("Please add a review title."); return; }
    if (review.trim().length < 20) { setError("Please write at least 20 characters in your review."); return; }

    const reviewData = {
      id:            Date.now(),
      bookingId:     booking?.id || null,
      userId:        auth?.email || "anonymous",
      userName:      auth?.email?.split("@")[0] || "User",
      providerEmail: booking?.providerEmail || null,
      providerName:  booking?.mentor?.name || "Provider",
      sessionDate:   booking?.date || null,
      sessionTopic:  booking?.description?.substring(0, 60) || null,
      rating,
      title:         title.trim(),
      review:        review.trim(),
      recommend,
      tags:          selectedTags,
      submittedAt:   new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem(reviewKey) || "[]");
    existing.push(reviewData);
    localStorage.setItem(reviewKey, JSON.stringify(existing));

    // Also mark booking as reviewed
    const bookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
    const updated  = bookings.map(b => b.id === booking?.id ? { ...b, reviewed: true, reviewRating: rating } : b);
    localStorage.setItem("userBookings", JSON.stringify(updated));

    setSubmitted(true);
    setError("");
  };

  const StarRow = ({ interactive = true }) => (
    <div className="rv-stars">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          className={`rv-star ${(interactive ? (hoverRating || rating) : rating) >= s ? "filled" : ""}`}
          onMouseEnter={() => interactive && setHoverRating(s)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => { if (interactive) { setRating(s); setError(""); } }}
          disabled={!interactive}
        >
          <FiStar size={32} />
        </button>
      ))}
      <span className="rv-rating-label">
        {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][(interactive ? (hoverRating || rating) : rating)] || ""}
      </span>
    </div>
  );

  if (!booking) {
    return (
      <div className="rv-page">
        <div className="rv-card">
          <FiAlertCircle size={48} style={{ color: "#f87171", marginBottom: 12 }} />
          <h2>No session found</h2>
          <p>Please go to your sessions and click "Leave Review" on a completed session.</p>
          <button className="rv-submit-btn" onClick={() => navigate("/sessions")}>Go to Sessions</button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rv-page">
        <div className="rv-card rv-success-card">
          <div className="rv-success-ring">
            <FiCheckCircle size={52} />
          </div>
          <h2>{existingReview && !rating ? "Already Reviewed!" : "Review Submitted!"}</h2>
          <p>
            {existingReview && !rating
              ? "You have already left a review for this session."
              : `Thank you for your feedback! Your review for ${booking.mentor?.name} has been submitted.`}
          </p>
          {rating > 0 && (
            <div className="rv-success-stars">
              {[1,2,3,4,5].map(s => (
                <span key={s} className={`rv-success-star ${rating >= s ? "filled" : ""}`}>★</span>
              ))}
            </div>
          )}
          <button className="rv-submit-btn" onClick={() => navigate(returnTo)} style={{ marginTop: 20 }}>
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rv-page">
      <div className="rv-container">

        {/* BACK */}
        <button className="rv-back-btn" onClick={() => navigate(returnTo)}>
          <FiArrowLeft size={16} /> Back to Sessions
        </button>

        {/* SESSION SUMMARY CARD */}
        <div className="rv-session-summary">
          <div className="rv-session-avatar">{booking.mentor?.name?.[0] || "?"}</div>
          <div className="rv-session-info">
            <h3>{booking.mentor?.name}</h3>
            <p className="rv-session-meta">{booking.mentor?.title}</p>
            <div className="rv-session-chips">
              <span>📅 {booking.date}</span>
              <span>🕐 {booking.time}</span>
              <span>⏱ {booking.duration} min</span>
              <span>💰 ${booking.totalPrice?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* MAIN REVIEW FORM */}
        <div className="rv-form-card">
          <div className="rv-form-header">
            <h1>Leave a Review</h1>
            <p>Share your experience to help other learners and improve mentorship quality.</p>
          </div>

          {/* STAR RATING */}
          <div className="rv-section">
            <label className="rv-label">Overall Rating <span className="rv-required">*</span></label>
            <StarRow interactive={true} />
          </div>

          {/* RECOMMEND */}
          <div className="rv-section">
            <label className="rv-label">Would you recommend this mentor?</label>
            <div className="rv-recommend-row">
              <button
                className={`rv-recommend-btn ${recommend === true ? "yes-active" : ""}`}
                onClick={() => setRecommend(recommend === true ? null : true)}
              >
                <FiThumbsUp size={18} /> Yes, definitely!
              </button>
              <button
                className={`rv-recommend-btn ${recommend === false ? "no-active" : ""}`}
                onClick={() => setRecommend(recommend === false ? null : false)}
              >
                <FiThumbsDown size={18} /> Not really
              </button>
            </div>
          </div>

          {/* QUALITY TAGS */}
          <div className="rv-section">
            <label className="rv-label">What stood out? <span className="rv-optional">(optional)</span></label>
            <div className="rv-tags-grid">
              {QUALITY_TAGS.map(tag => (
                <button
                  key={tag}
                  className={`rv-tag-btn ${selectedTags.includes(tag) ? "tag-selected" : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  {selectedTags.includes(tag) && <FiCheck size={11} />}
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* TITLE */}
          <div className="rv-section">
            <label className="rv-label">Review Title <span className="rv-required">*</span></label>
            <input
              className="rv-input"
              type="text"
              placeholder="e.g. Amazing session, learned a lot!"
              value={title}
              maxLength={80}
              onChange={e => { setTitle(e.target.value); setError(""); }}
            />
            <span className="rv-char-count">{title.length}/80</span>
          </div>

          {/* REVIEW TEXT */}
          <div className="rv-section">
            <label className="rv-label">Your Review <span className="rv-required">*</span></label>
            <textarea
              className="rv-textarea"
              rows={5}
              placeholder="Describe your experience. What did you learn? How was the mentor's teaching style? What could be improved? (min. 20 characters)"
              value={review}
              maxLength={1000}
              onChange={e => { setReview(e.target.value); setError(""); }}
            />
            <span className="rv-char-count">{review.length}/1000</span>
          </div>

          {/* ERROR */}
          {error && (
            <div className="rv-error">
              <FiAlertCircle size={14} /> {error}
            </div>
          )}

          {/* SUBMIT */}
          <button className="rv-submit-btn" onClick={handleSubmit}>
            <FiSend size={16} /> Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}
