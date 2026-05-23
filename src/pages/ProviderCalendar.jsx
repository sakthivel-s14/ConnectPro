import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProviderCalendar.css";
import { FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";
import { getCurrentProfile, getProviderAvailability, saveProviderAvailability } from "../utils/storage";

export default function ProviderCalendar() {
  const navigate = useNavigate();
  const provider = useMemo(() => getCurrentProfile(), []);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availability, setAvailability] = useState(() => {
    if (!provider) return [];
    return getProviderAvailability(provider.email);
  });

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM",
  ];

  const handleAddSlot = () => {
    if (!selectedDate || !selectedTime) return;
    const exists = availability.some(
      (slot) => slot.date === selectedDate && slot.time === selectedTime
    );
    if (exists) return;

    const updated = [...availability, { date: selectedDate, time: selectedTime }].sort((a, b) => {
      if (a.date === b.date) return a.time.localeCompare(b.time);
      return a.date.localeCompare(b.date);
    });
    setAvailability(updated);
    saveProviderAvailability(provider.email, updated);
    setSelectedTime("");
  };

  const handleRemoveSlot = (removeSlot) => {
    const updated = availability.filter(
      (slot) => !(slot.date === removeSlot.date && slot.time === removeSlot.time)
    );
    setAvailability(updated);
    saveProviderAvailability(provider.email, updated);
  };

  if (!provider) {
    return (
      <div className="provider-calendar-page">
        <div className="calendar-empty">
          <h2>No provider profile found</h2>
          <p>Please sign in as a provider to manage availability.</p>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-calendar-page">
      <div className="calendar-header">
        <button className="back-btn" onClick={() => navigate("/provider-home") }>
          <FiArrowLeft size={18} /> Back
        </button>
        <div>
          <h1>My Availability Calendar</h1>
          <p>Publish the dates and times you are free so users can book your sessions.</p>
        </div>
      </div>

      <div className="calendar-content">
        <div className="calendar-pane">
          <h2>Add Available Slot</h2>
          <div className="calendar-form-row">
            <label>Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="calendar-form-row">
            <label>Time</label>
            <div className="calendar-time-grid">
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
          </div>

          <button className="add-slot-btn" onClick={handleAddSlot} disabled={!selectedDate || !selectedTime}>
            <FiPlus size={16} /> Add to calendar
          </button>
        </div>

        <div className="calendar-pane">
          <h2>Published Availability</h2>
          {availability.length > 0 ? (
            <div className="availability-list">
              {availability.map((slot) => (
                <div className="availability-item" key={`${slot.date}-${slot.time}`}>
                  <div>
                    <strong>{slot.date}</strong>
                    <span>{slot.time}</span>
                  </div>
                  <button className="delete-slot-btn" onClick={() => handleRemoveSlot(slot)}>
                    <FiTrash2 size={16} /> Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="availability-empty">
              <h3>No published times yet</h3>
              <p>Add slots above so users can book you directly from the booking page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
