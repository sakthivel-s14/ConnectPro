import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiMessageSquare, FiPhoneOff, FiAlertCircle } from "react-icons/fi";
import "../styles/MeetingRoom.css";
import { getAuth } from "../utils/storage";
import PageHeader from "../Components/PageHeader";

export default function MeetingRoom() {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = getAuth();
  const bookings = useMemo(() => {
    const stored = localStorage.getItem("userBookings");
    return stored ? JSON.parse(stored) : [];
  }, []);
  const booking = bookings.find((item) => String(item.id) === String(id));
  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, sender: "system", text: "Welcome to your one-on-one meeting room." },
  ]);

  const partner = booking ? (auth?.role === "user" ? booking.mentor : { name: booking.userName, title: "Learner" }) : null;

  const handleSend = () => {
    if (!chatInput.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: auth?.role || "user", text: chatInput.trim() }]);
    setChatInput("");
  };

  const handleLeave = () => {
    setJoined(false);
    setTimeout(() => navigate(auth?.role === "provider" ? "/provider-home" : "/user-home"), 100);
  };

  if (!booking) {
    return (
      <div className="meeting-room empty-room">
        <PageHeader
          title="Meeting Not Found"
          subtitle="The requested session could not be located."
          onBack={() => navigate(auth?.role === "provider" ? "/provider-home" : "/user-home")}
        />
        <div className="meeting-empty-card">
          <FiAlertCircle size={60} />
          <h2>Session not available</h2>
          <p>Please return to your sessions page and choose a valid meeting.</p>
          <button onClick={() => navigate("/sessions")}>Go to Sessions</button>
        </div>
      </div>
    );
  }

  return (
    <div className="meeting-room">
      <PageHeader
        title="One-on-One Meeting"
        subtitle={`Session with ${partner?.name || "your mentor"}`}
        onBack={() => navigate("/sessions")}
        actionLabel={joined ? "Leave Meet" : "Join Meet"}
        onAction={() => (joined ? handleLeave() : setJoined(true))}
      />

      <div className="meeting-main">
        <div className="meeting-video-panel">
          <div className={`video-stage ${joined ? "joined" : "waiting"}`}>
            {joined ? (
              <>
                <div className="video-window local-window">
                  <span className="video-label">You</span>
                  <div className={`video-camera ${cameraOn ? "on" : "off"}`}>
                    {cameraOn ? <FiVideo size={40} /> : <FiVideoOff size={40} />}
                  </div>
                </div>
                <div className="video-window remote-window">
                  <span className="video-label">{partner?.name}</span>
                  <div className={`video-camera ${cameraOn ? "on" : "off"}`}>
                    {cameraOn ? <FiVideo size={40} /> : <FiVideoOff size={40} />}
                  </div>
                </div>
              </>
            ) : (
              <div className="waiting-card">
                <FiVideo size={50} />
                <h2>Ready to start your video meeting</h2>
                <p>Click Join Meet to enter the session room and connect with your mentor.</p>
              </div>
            )}
          </div>

          <div className="meeting-controls">
            <button className={micOn ? "control-btn active" : "control-btn"} onClick={() => setMicOn(!micOn)}>
              {micOn ? <FiMic size={18} /> : <FiMicOff size={18} />} {micOn ? "Mic On" : "Mic Off"}
            </button>
            <button className={cameraOn ? "control-btn active" : "control-btn"} onClick={() => setCameraOn(!cameraOn)}>
              {cameraOn ? <FiVideo size={18} /> : <FiVideoOff size={18} />} {cameraOn ? "Camera On" : "Camera Off"}
            </button>
            {joined && (
              <button className="control-btn end-call" onClick={handleLeave}>
                <FiPhoneOff size={18} /> Leave Call
              </button>
            )}
          </div>
        </div>

        <div className="meeting-chat-panel">
          <div className="meeting-chat-header">
            <FiMessageSquare size={18} />
            <h3>Meeting Chat</h3>
          </div>
          <div className="meeting-chat-history">
            {messages.map((message) => (
              <div key={message.id} className={`chat-message ${message.sender === auth?.role ? "chat-outgoing" : "chat-incoming"}`}>
                <span>{message.text}</span>
              </div>
            ))}
          </div>
          <div className="meeting-chat-input">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
