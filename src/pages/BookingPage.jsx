import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/BookingPage.css";
import { FiArrowLeft, FiClock, FiCalendar, FiCheck, FiStar, FiVideo, FiExternalLink } from "react-icons/fi";
import { getAuth, getCurrentProfile, getProviderAvailability } from "../utils/storage";
import { createCalendarEvent } from "../utils/googleApi";

export default function BookingPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = getCurrentProfile();
  const [selectedMentor, setSelectedMentor] = useState(() => {
    const stored = localStorage.getItem("selectedMentor");
    return stored ? JSON.parse(stored) : null;
  });

  const [bookingStep, setBookingStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [description, setDescription] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [meetLink, setMeetLink] = useState(null);
  const [calendarCreating, setCalendarCreating] = useState(false);

  const availability = useMemo(() => {
    if (!selectedMentor) return [];
    return getProviderAvailability(selectedMentor.email);
  }, [selectedMentor]);

  useEffect(() => {
    if (availability.length > 0 && !selectedDate) {
      setSelectedDate(availability[0].date);
    }
  }, [availability, selectedDate]);

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  ];

  const getTotalPrice = () => {
    if (!selectedMentor) return 0;
    return (parseInt(duration) / 60) * selectedMentor.hourlyRate;
  };

  const handleConfirmBooking = async () => {
    if (selectedDate && selectedTime && duration && description) {
      const booking = {
        id: Date.now(),
        mentor: selectedMentor,
        date: selectedDate,
        time: selectedTime,
        duration: duration,
        description: description,
        totalPrice: getTotalPrice(),
        status: "confirmed",
        createdAt: new Date().toISOString(),
        userId: auth?.email || "",
        userName: currentUser?.name || auth?.email || "Learner",
        providerEmail: selectedMentor.email || "",
        providerName: selectedMentor.name,
      };

      // ── Save booking to localStorage (unchanged) ──────────────
      const existingBookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
      existingBookings.push(booking);
      localStorage.setItem("userBookings", JSON.stringify(existingBookings));

      // ── Create Google Calendar event with Meet link ───────────
      // This runs after localStorage save so booking is always stored
      // even if Google API is not yet configured or auth fails.
      setCalendarCreating(true);
      try {
        const googleResult = await createCalendarEvent(booking);
        if (googleResult?.meetLink) {
          setMeetLink(googleResult.meetLink);
          // Update the stored booking with the meet link and calendar event ID
          const updatedBookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
          const idx = updatedBookings.findIndex((b) => b.id === booking.id);
          if (idx !== -1) {
            updatedBookings[idx].meetLink       = googleResult.meetLink;
            updatedBookings[idx].calendarEventId = googleResult.calendarEventId;
            localStorage.setItem("userBookings", JSON.stringify(updatedBookings));
          }
        }
      } catch (err) {
        console.warn("[BookingPage] Calendar event creation failed:", err);
      } finally {
        setCalendarCreating(false);
      }

      setBookingConfirmed(true);
      setTimeout(() => {
        navigate("/user-home");
      }, 5000);
    }
  };

  if (!selectedMentor) {
    return (
      <div className="booking-page">
        <div className="booking-error">
          <h2>No mentor selected</h2>
          <button onClick={() => navigate("/mentors")} className="back-to-mentors">
            Back to Mentors
          </button>
        </div>
      </div>
    );
  }

  if (bookingConfirmed) {
    return (
      <div className="booking-page">
        <div className="booking-success">
          <div className="success-icon">
            <FiCheck size={60} />
          </div>
          <h1>Session Booked Successfully!</h1>
          <p>A confirmation email has been sent to your registered email address.</p>
          <div className="booking-details">
            <p><strong>Mentor:</strong> {selectedMentor.name}</p>
            <p><strong>Date:</strong> {selectedDate}</p>
            <p><strong>Time:</strong> {selectedTime}</p>
            <p><strong>Duration:</strong> {duration} minutes</p>
            <p><strong>Total Price:</strong> ${getTotalPrice().toFixed(2)}</p>
          </div>

          {/* ── Google Meet Link ──────────────────────────────── */}
          {calendarCreating && (
            <div className="meet-link-creating">
              <div className="meet-spinner"></div>
              <p>Creating your Google Meet room...</p>
            </div>
          )}
          {meetLink && !calendarCreating && (
            <div className="meet-link-box">
              <FiVideo size={22} className="meet-icon" />
              <div>
                <p className="meet-link-label">Your Google Meet Room is ready!</p>
                <a
                  href={meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="meet-link-anchor"
                >
                  {meetLink} <FiExternalLink size={14} />
                </a>
                <p className="meet-link-hint">Share this link with your mentor to join the meeting.</p>
              </div>
            </div>
          )}
          {!meetLink && !calendarCreating && (
            <div className="meet-link-fallback">
              <p>💡 Connect your Google account to auto-generate a Meet link next time.</p>
            </div>
          )}

          <p className="redirecting">Redirecting to home in a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      {/* HEADER */}
      <div className="booking-header">
        <button className="back-btn" onClick={() => navigate("/mentors")}>
          <FiArrowLeft /> Back to Mentors
        </button>
        <h1>Book Your Session</h1>
      </div>

      <div className="booking-container">
        {/* MENTOR CARD */}
        <div className="booking-mentor-card">
          <div className="mentor-card-header">
            <div className="mentor-avatar">{selectedMentor.image}</div>
            <div className="mentor-details">
              <h2>{selectedMentor.name}</h2>
              <p>{selectedMentor.title}</p>
              <div className="rating">
                <FiStar size={16} /> {selectedMentor.rating} • {selectedMentor.reviews} reviews
              </div>
            </div>
          </div>
          <p className="mentor-bio">{selectedMentor.bio}</p>
          <div className="price-section">
            <span className="rate">${selectedMentor.hourlyRate}/hour</span>
          </div>
        </div>

        {/* BOOKING FORM */}
        <div className="booking-form">
          <div className="steps-indicator">
            <div className={`step ${bookingStep >= 1 ? "active" : ""}`}>
              <span>1</span>
              <p>Date & Time</p>
            </div>
            <div className={`step ${bookingStep >= 2 ? "active" : ""}`}>
              <span>2</span>
              <p>Details</p>
            </div>
            <div className={`step ${bookingStep >= 3 ? "active" : ""}`}>
              <span>3</span>
              <p>Confirm</p>
            </div>
          </div>

          {/* STEP 1: DATE & TIME */}
          {bookingStep === 1 && (
            <div className="form-section">
              <h3><FiCalendar /> Choose a session slot</h3>

              {availability.length > 0 && !manualMode ? (
                <>
                  <p className="availability-note">
                    Available slots from {selectedMentor.name}. Pick a free date and time.
                  </p>

                  <div className="availability-dates">
                    {Array.from(new Set(availability.map((slot) => slot.date))).map((date) => (
                      <button
                        key={date}
                        className={`date-pill ${selectedDate === date ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedTime("");
                        }}
                      >
                        {date}
                      </button>
                    ))}
                  </div>

                  {selectedDate && (
                    <div className="availability-times">
                      {availability
                        .filter((slot) => slot.date === selectedDate)
                        .map((slot) => (
                          <button
                            key={`${slot.date}-${slot.time}`}
                            className={`time-slot ${selectedTime === slot.time ? "selected" : ""}`}
                            onClick={() => setSelectedTime(slot.time)}
                          >
                            {slot.time}
                          </button>
                        ))}
                    </div>
                  )}

                  <div className="availability-footer">
                    <p>If you need a different time, switch to manual mode.</p>
                    <button className="manual-mode-btn" onClick={() => setManualMode(true)}>
                      Use manual date/time
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="availability-note">
                    No published slots available yet, or manual mode selected. Choose any date/time.
                  </p>

                  <h3><FiCalendar /> Select Date</h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="date-input"
                    min={new Date().toISOString().split("T")[0]}
                  />

                  <h3><FiClock /> Select Time</h3>
                  <div className="time-slots">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        className={`time-slot ${selectedTime === slot ? "selected" : ""}`}
                        onClick={() => setSelectedTime(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>

                  <button className="manual-mode-btn" onClick={() => setManualMode(false)}>
                    See available provider slots
                  </button>
                </>
              )}

              <h3>Session Duration</h3>
              <div className="duration-options">
                {["30", "60", "90"].map((min) => (
                  <button
                    key={min}
                    className={`duration-btn ${duration === min ? "selected" : ""}`}
                    onClick={() => setDuration(min)}
                  >
                    {min} min - ${((parseInt(min) / 60) * selectedMentor.hourlyRate).toFixed(2)}
                  </button>
                ))}
              </div>

              <button
                className="next-btn"
                onClick={() => setBookingStep(2)}
                disabled={!selectedDate || !selectedTime}
              >
                Next: Add Details
              </button>
            </div>
          )}

          {/* STEP 2: DETAILS */}
          {bookingStep === 2 && (
            <div className="form-section">
              <h3>What would you like to discuss?</h3>
              <p className="section-subtitle">Describe your goals and challenges</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., Help with React debugging, Career guidance for senior role transition, Mock interview preparation..."
                className="description-input"
                rows="8"
              />

              <div className="form-buttons">
                <button
                  className="back-step-btn"
                  onClick={() => setBookingStep(1)}
                >
                  Back
                </button>
                <button
                  className="next-btn"
                  onClick={() => setBookingStep(3)}
                  disabled={!description.trim()}
                >
                  Review Booking
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRM */}
          {bookingStep === 3 && (
            <div className="form-section">
              <h3>Review Your Booking</h3>

              <div className="review-section">
                <div className="review-item">
                  <span className="label">Date & Time:</span>
                  <span className="value">{selectedDate} at {selectedTime}</span>
                </div>
                <div className="review-item">
                  <span className="label">Duration:</span>
                  <span className="value">{duration} minutes</span>
                </div>
                <div className="review-item">
                  <span className="label">Mentor:</span>
                  <span className="value">{selectedMentor.name}</span>
                </div>
                <div className="review-item">
                  <span className="label">Topic:</span>
                  <span className="value">{description}</span>
                </div>
              </div>

              <div className="pricing-breakdown">
                <div className="price-row">
                  <span>${selectedMentor.hourlyRate} × {(parseInt(duration) / 60).toFixed(2)} hours</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              <div className="form-buttons">
                <button
                  className="back-step-btn"
                  onClick={() => setBookingStep(2)}
                >
                  Back
                </button>
                <button
                  className="confirm-btn"
                  onClick={handleConfirmBooking}
                >
                  Confirm & Pay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
