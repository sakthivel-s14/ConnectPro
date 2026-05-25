import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/BookingPage.css";
import {
  FiArrowLeft, FiClock, FiCalendar, FiCheck, FiStar,
  FiVideo, FiExternalLink, FiX, FiCreditCard, FiSmartphone,
  FiLock, FiAlertCircle, FiLoader
} from "react-icons/fi";
import { getAuth, getCurrentProfile, getProviderAvailability } from "../utils/storage";
import { createCalendarEvent } from "../utils/googleApi";

// ── Razorpay Key — replace with your real key from razorpay.com ──
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_YourKeyHere";

// Load Razorpay script dynamically
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BookingPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = getCurrentProfile();

  const [selectedMentor] = useState(() => {
    const stored = localStorage.getItem("selectedMentor");
    return stored ? JSON.parse(stored) : null;
  });

  const [bookingStep,      setBookingStep]      = useState(1);
  const [selectedDate,     setSelectedDate]     = useState("");
  const [selectedTime,     setSelectedTime]     = useState("");
  const [duration,         setDuration]         = useState("30");
  const [description,      setDescription]      = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [manualMode,       setManualMode]       = useState(false);
  const [meetLink,         setMeetLink]         = useState(null);
  const [calendarCreating, setCalendarCreating] = useState(false);

  // Payment popup state
  const [showPayment,  setShowPayment]  = useState(false);
  const [payMethod,    setPayMethod]    = useState("upi"); // upi | card | netbanking | wallet
  const [upiId,        setUpiId]        = useState("");
  const [cardNumber,   setCardNumber]   = useState("");
  const [cardExpiry,   setCardExpiry]   = useState("");
  const [cardCvv,      setCardCvv]      = useState("");
  const [cardName,     setCardName]     = useState("");
  const [payLoading,   setPayLoading]   = useState(false);
  const [payError,     setPayError]     = useState("");

  const availability = useMemo(() => {
    if (!selectedMentor) return [];
    return getProviderAvailability(selectedMentor.email);
  }, [selectedMentor]);

  // ── Get already-booked slots for this provider ──
  const bookedSlots = useMemo(() => {
    const all = JSON.parse(localStorage.getItem("userBookings") || "[]");
    return all
      .filter(b => b.providerEmail === selectedMentor?.email)
      .map(b => ({ date: b.date, time: b.time }));
  }, [selectedMentor]);

  const isSlotBooked = (date, time) =>
    bookedSlots.some(s => s.date === date && s.time === time);

  useEffect(() => {
    if (availability.length > 0 && !selectedDate) setSelectedDate(availability[0].date);
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

  // ── Save booking after successful payment ──
  const saveBooking = async () => {
    const booking = {
      id:            Date.now(),
      mentor:        selectedMentor,
      date:          selectedDate,
      time:          selectedTime,
      duration,
      description,
      totalPrice:    getTotalPrice(),
      status:        "confirmed",
      createdAt:     new Date().toISOString(),
      userId:        auth?.email || "",
      userName:      currentUser?.name || auth?.email || "Learner",
      providerEmail: selectedMentor.email || "",
      providerName:  selectedMentor.name,
      paymentMethod: payMethod,
    };

    const existing = JSON.parse(localStorage.getItem("userBookings") || "[]");
    existing.push(booking);
    localStorage.setItem("userBookings", JSON.stringify(existing));

    setCalendarCreating(true);
    try {
      const googleResult = await createCalendarEvent(booking);
      if (googleResult?.meetLink) {
        setMeetLink(googleResult.meetLink);
        const updated = JSON.parse(localStorage.getItem("userBookings") || "[]");
        const idx = updated.findIndex(b => b.id === booking.id);
        if (idx !== -1) {
          updated[idx].meetLink = googleResult.meetLink;
          updated[idx].calendarEventId = googleResult.calendarEventId;
          localStorage.setItem("userBookings", JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.warn("[BookingPage] Calendar creation failed:", err);
    } finally {
      setCalendarCreating(false);
    }

    setBookingConfirmed(true);
    setShowPayment(false);
    setTimeout(() => navigate("/sessions"), 5000);
  };

  // ── Razorpay payment flow ──
  const handleRazorpay = async () => {
    setPayLoading(true);
    setPayError("");
    const ok = await loadRazorpay();
    if (!ok) {
      setPayError("Failed to load Razorpay. Please check your internet connection.");
      setPayLoading(false);
      return;
    }

    const amountPaise = Math.round(getTotalPrice() * 100); // in paise

    if (RAZORPAY_KEY_ID === "rzp_test_YourKeyHere") {
      // Demo mode — simulate payment success
      setPayLoading(false);
      await saveBooking();
      return;
    }

    const options = {
      key:         RAZORPAY_KEY_ID,
      amount:      amountPaise,
      currency:    "INR",
      name:        "ConnectPro",
      description: `Session with ${selectedMentor.name}`,
      image:       "https://i.pravatar.cc/100?u=connectpro",
      prefill: {
        name:    currentUser?.name  || "",
        email:   auth?.email        || "",
        contact: "",
      },
      notes: {
        provider:  selectedMentor.name,
        date:      selectedDate,
        time:      selectedTime,
        duration:  `${duration} min`,
      },
      theme: { color: "#5b6ef8" },
      method: {
        upi:        payMethod === "upi",
        card:       payMethod === "card",
        netbanking: payMethod === "netbanking",
        wallet:     payMethod === "wallet",
      },
      handler: async (response) => {
        // Payment success
        await saveBooking();
      },
      modal: {
        ondismiss: () => {
          setPayLoading(false);
          setPayError("Payment was cancelled.");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      setPayError(`Payment failed: ${response.error.description}`);
      setPayLoading(false);
    });
    rzp.open();
    setPayLoading(false);
  };

  // ── Custom UPI / demo payment submit ──
  const handlePaySubmit = async () => {
    setPayError("");

    if (payMethod === "upi") {
      if (!upiId.trim()) { setPayError("Please enter your UPI ID."); return; }
      if (!/^[\w.\-_]{3,}@[a-zA-Z]{3,}$/.test(upiId.trim())) { setPayError("Enter a valid UPI ID (e.g. name@upi)"); return; }
    }
    if (payMethod === "card") {
      if (!cardName || !cardNumber || !cardExpiry || !cardCvv) { setPayError("Please fill all card details."); return; }
      if (cardNumber.replace(/\s/g, "").length !== 16) { setPayError("Enter a valid 16-digit card number."); return; }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) { setPayError("Enter expiry as MM/YY."); return; }
      if (cardCvv.length < 3) { setPayError("Enter a valid CVV."); return; }
    }

    await handleRazorpay();
  };

  // ── Format card number with spaces ──
  const formatCard = (val) => val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (val) => {
    const d = val.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  if (!selectedMentor) {
    return (
      <div className="booking-page">
        <div className="booking-error">
          <h2>No mentor selected</h2>
          <button onClick={() => navigate("/mentors")} className="back-to-mentors">Back to Mentors</button>
        </div>
      </div>
    );
  }

  if (bookingConfirmed) {
    return (
      <div className="booking-page">
        <div className="booking-success">
          <div className="success-icon"><FiCheck size={60} /></div>
          <h1>Session Booked Successfully!</h1>
          <p>Your payment was received. A confirmation has been sent to your email.</p>
          <div className="booking-details">
            <p><strong>Mentor:</strong> {selectedMentor.name}</p>
            <p><strong>Date:</strong> {selectedDate}</p>
            <p><strong>Time:</strong> {selectedTime}</p>
            <p><strong>Duration:</strong> {duration} minutes</p>
            <p><strong>Amount Paid:</strong> ₹{getTotalPrice().toFixed(2)}</p>
          </div>
          {calendarCreating && (
            <div className="meet-link-creating">
              <div className="meet-spinner" />
              <p>Creating your Google Meet room...</p>
            </div>
          )}
          {meetLink && !calendarCreating && (
            <div className="meet-link-box">
              <FiVideo size={22} className="meet-icon" />
              <div>
                <p className="meet-link-label">Your Google Meet Room is ready!</p>
                <a href={meetLink} target="_blank" rel="noopener noreferrer" className="meet-link-anchor">
                  {meetLink} <FiExternalLink size={14} />
                </a>
              </div>
            </div>
          )}
          <p className="redirecting">Redirecting to your sessions in a moment...</p>
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
            <span className="rate">₹{selectedMentor.hourlyRate}/hour</span>
          </div>
        </div>

        {/* BOOKING FORM */}
        <div className="booking-form">
          <div className="steps-indicator">
            {["Date & Time", "Details", "Confirm"].map((label, i) => (
              <div key={i} className={`step ${bookingStep >= i + 1 ? "active" : ""}`}>
                <span>{i + 1}</span><p>{label}</p>
              </div>
            ))}
          </div>

          {/* STEP 1: DATE & TIME */}
          {bookingStep === 1 && (
            <div className="form-section">
              <h3><FiCalendar /> Choose a session slot</h3>

              {availability.length > 0 && !manualMode ? (
                <>
                  <p className="availability-note">
                    Available slots from {selectedMentor.name}. Greyed slots are already booked.
                  </p>
                  <div className="availability-dates">
                    {Array.from(new Set(availability.map(s => s.date))).map(date => (
                      <button
                        key={date}
                        className={`date-pill ${selectedDate === date ? "selected" : ""}`}
                        onClick={() => { setSelectedDate(date); setSelectedTime(""); }}
                      >{date}</button>
                    ))}
                  </div>
                  {selectedDate && (
                    <div className="availability-times">
                      {availability.filter(s => s.date === selectedDate).map(slot => {
                        const booked = isSlotBooked(slot.date, slot.time);
                        return (
                          <button
                            key={`${slot.date}-${slot.time}`}
                            className={`time-slot ${selectedTime === slot.time ? "selected" : ""} ${booked ? "booked-slot" : ""}`}
                            onClick={() => !booked && setSelectedTime(slot.time)}
                            disabled={booked}
                            title={booked ? "Already booked" : ""}
                          >
                            {slot.time}
                            {booked && <span className="booked-label">Booked</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="availability-footer">
                    <p>Need a different time?</p>
                    <button className="manual-mode-btn" onClick={() => setManualMode(true)}>Use manual date/time</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="availability-note">Choose any date and time. Greyed slots are already booked.</p>
                  <h3><FiCalendar /> Select Date</h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => { setSelectedDate(e.target.value); setSelectedTime(""); }}
                    className="date-input"
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <h3><FiClock /> Select Time</h3>
                  <div className="time-slots">
                    {timeSlots.map(slot => {
                      const booked = isSlotBooked(selectedDate, slot);
                      return (
                        <button
                          key={slot}
                          className={`time-slot ${selectedTime === slot ? "selected" : ""} ${booked ? "booked-slot" : ""}`}
                          onClick={() => !booked && setSelectedTime(slot)}
                          disabled={booked}
                          title={booked ? "This slot is already booked" : ""}
                        >
                          {slot}
                          {booked && <span className="booked-label">Booked</span>}
                        </button>
                      );
                    })}
                  </div>
                  {manualMode && (
                    <button className="manual-mode-btn" onClick={() => setManualMode(false)}>
                      See provider's available slots
                    </button>
                  )}
                </>
              )}

              <h3>Session Duration</h3>
              <div className="duration-options">
                {["30", "60", "90"].map(min => (
                  <button
                    key={min}
                    className={`duration-btn ${duration === min ? "selected" : ""}`}
                    onClick={() => setDuration(min)}
                  >
                    {min} min — ₹{((parseInt(min) / 60) * selectedMentor.hourlyRate).toFixed(0)}
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
                onChange={e => setDescription(e.target.value)}
                placeholder="E.g., Help with React debugging, Career guidance for senior role transition, Mock interview preparation..."
                className="description-input"
                rows="8"
              />
              <div className="form-buttons">
                <button className="back-step-btn" onClick={() => setBookingStep(1)}>Back</button>
                <button className="next-btn" onClick={() => setBookingStep(3)} disabled={!description.trim()}>
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
                <div className="review-item"><span className="label">Date &amp; Time:</span><span className="value">{selectedDate} at {selectedTime}</span></div>
                <div className="review-item"><span className="label">Duration:</span><span className="value">{duration} minutes</span></div>
                <div className="review-item"><span className="label">Mentor:</span><span className="value">{selectedMentor.name}</span></div>
                <div className="review-item"><span className="label">Topic:</span><span className="value">{description}</span></div>
              </div>
              <div className="pricing-breakdown">
                <div className="price-row">
                  <span>₹{selectedMentor.hourlyRate} × {(parseInt(duration) / 60).toFixed(2)} hours</span>
                  <span>₹{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="price-row total-row">
                  <span><strong>Total</strong></span>
                  <span><strong>₹{getTotalPrice().toFixed(2)}</strong></span>
                </div>
              </div>
              <div className="form-buttons">
                <button className="back-step-btn" onClick={() => setBookingStep(2)}>Back</button>
                <button className="confirm-btn" onClick={() => { setPayError(""); setShowPayment(true); }}>
                  <FiLock size={15} /> Confirm &amp; Pay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          PAYMENT POPUP MODAL
          ═══════════════════════════════════════ */}
      {showPayment && (
        <div className="pay-overlay" onClick={() => !payLoading && setShowPayment(false)}>
          <div className="pay-modal" onClick={e => e.stopPropagation()}>

            {/* HEADER */}
            <div className="pay-header">
              <div className="pay-header-left">
                <FiLock size={18} />
                <div>
                  <h3>Secure Payment</h3>
                  <p>256-bit SSL encrypted</p>
                </div>
              </div>
              <button className="pay-close" onClick={() => !payLoading && setShowPayment(false)}>
                <FiX size={20} />
              </button>
            </div>

            {/* ORDER SUMMARY */}
            <div className="pay-summary">
              <div className="pay-summary-row">
                <span>Session with {selectedMentor.name}</span>
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="pay-summary-row">
                <span className="pay-summary-meta">{selectedDate} · {selectedTime} · {duration} min</span>
              </div>
            </div>

            {/* PAYMENT METHOD TABS */}
            <div className="pay-methods">
              {[
                { id: "upi",        icon: <FiSmartphone size={16} />, label: "UPI" },
                { id: "card",       icon: <FiCreditCard size={16} />, label: "Card" },
                { id: "netbanking", icon: <span style={{ fontSize: "1rem" }}>🏦</span>, label: "Net Banking" },
                { id: "wallet",     icon: <span style={{ fontSize: "1rem" }}>👛</span>, label: "Wallet" },
              ].map(m => (
                <button
                  key={m.id}
                  className={`pay-method-tab ${payMethod === m.id ? "active" : ""}`}
                  onClick={() => { setPayMethod(m.id); setPayError(""); }}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>

            {/* UPI FORM */}
            {payMethod === "upi" && (
              <div className="pay-form">
                <label className="pay-label">UPI ID</label>
                <input
                  className="pay-input"
                  type="text"
                  placeholder="yourname@upi  or  number@paytm"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                />
                <div className="upi-apps">
                  {["GPay", "PhonePe", "Paytm", "BHIM"].map(app => (
                    <span key={app} className="upi-app-chip">{app}</span>
                  ))}
                </div>
                <p className="pay-hint">Enter UPI ID and click Pay. A payment request will be sent to your UPI app.</p>
              </div>
            )}

            {/* CARD FORM */}
            {payMethod === "card" && (
              <div className="pay-form">
                <label className="pay-label">Cardholder Name</label>
                <input className="pay-input" type="text" placeholder="Name on card"
                  value={cardName} onChange={e => setCardName(e.target.value)} />
                <label className="pay-label">Card Number</label>
                <input className="pay-input" type="text" placeholder="1234 5678 9012 3456"
                  value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} maxLength={19} />
                <div className="pay-row-2">
                  <div>
                    <label className="pay-label">Expiry</label>
                    <input className="pay-input" type="text" placeholder="MM/YY"
                      value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} maxLength={5} />
                  </div>
                  <div>
                    <label className="pay-label">CVV</label>
                    <input className="pay-input" type="password" placeholder="•••"
                      value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} maxLength={4} />
                  </div>
                </div>
              </div>
            )}

            {/* NET BANKING */}
            {payMethod === "netbanking" && (
              <div className="pay-form">
                <p className="pay-hint" style={{ marginBottom: 12 }}>Select your bank to proceed:</p>
                <div className="bank-grid">
                  {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB", "BOB", "Yes Bank"].map(bank => (
                    <button key={bank} className="bank-chip">{bank}</button>
                  ))}
                </div>
                <p className="pay-hint">You will be redirected to your bank's secure net banking portal.</p>
              </div>
            )}

            {/* WALLET */}
            {payMethod === "wallet" && (
              <div className="pay-form">
                <div className="bank-grid">
                  {["Paytm", "Amazon Pay", "Mobikwik", "Freecharge"].map(w => (
                    <button key={w} className="bank-chip">{w}</button>
                  ))}
                </div>
                <p className="pay-hint">Select your wallet to proceed with payment.</p>
              </div>
            )}

            {/* ERROR */}
            {payError && (
              <div className="pay-error">
                <FiAlertCircle size={14} /> {payError}
              </div>
            )}

            {/* PAY BUTTON */}
            <button
              className="pay-btn"
              onClick={handlePaySubmit}
              disabled={payLoading}
            >
              {payLoading
                ? <><span className="pay-spinner" /> Processing...</>
                : <><FiLock size={15} /> Pay ₹{getTotalPrice().toFixed(2)}</>}
            </button>

            <p className="pay-secure-note">
              🔒 Powered by Razorpay · Your payment info is never stored
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
