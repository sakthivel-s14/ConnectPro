import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/MessagesPage.css";
import {
  FiArrowLeft, FiSend, FiMessageSquare,
  FiPhone, FiVideo, FiMoreVertical, FiPaperclip, FiSmile,
} from "react-icons/fi";
import { getAuth, getCurrentProfile } from "../utils/storage";
import {
  getConversationsForUser,
  getOrCreateConversation,
  sendMessage as sendMsg,
  markConversationRead,
  buildConversationId,
  getOtherParticipant,
  getAllConversations,
} from "../utils/messages";

export default function MessagesPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const auth      = getAuth();
  const me        = getCurrentProfile();
  const homeRoute = auth?.role === "provider" ? "/provider-home" : "/user-home";

  const bottomRef = useRef(null);

  /* ── Conversation list ── */
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId]           = useState(null);
  const [text, setText]                   = useState("");
  const [searchQ, setSearchQ]             = useState("");

  /* Load conversations from storage */
  const loadConversations = () => {
    if (!auth?.email) return;
    const convos = getConversationsForUser(auth.email);
    // Sort by lastTime (most recent first)
    convos.sort((a, b) => {
      const ta = a.messages?.[a.messages.length - 1]?.timestamp || 0;
      const tb = b.messages?.[b.messages.length - 1]?.timestamp || 0;
      return tb - ta;
    });
    setConversations(convos);
  };

  /* On mount – check if navigated with a "open this chat" state */
  useEffect(() => {
    if (!auth?.email || !me) return;

    const nav = location.state;
    if (nav?.openEmail && nav?.openName) {
      // Create / open conversation with that person
      const convo = getOrCreateConversation(
        auth.email,
        me.name || auth.email,
        auth.role,
        nav.openEmail,
        nav.openName,
        nav.openRole || "user"
      );
      loadConversations();
      setActiveId(convo.id);
      // Clear navigation state so refreshing doesn't reopen
      window.history.replaceState({}, "");
    } else {
      loadConversations();
    }
  }, []);

  /* Refresh when activeId changes */
  useEffect(() => {
    if (activeId && auth?.email) {
      markConversationRead(activeId, auth.email);
      loadConversations();
    }
  }, [activeId]);

  /* Auto-scroll to bottom when messages change */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, conversations]);

  /* Current active conversation object */
  const activeConvo = useMemo(() => {
    if (!activeId) return null;
    const all = getAllConversations();
    return all[activeId] || null;
  }, [activeId, conversations]);

  /* Other person's info */
  const otherEmail = activeConvo
    ? getOtherParticipant(activeConvo, auth?.email || "")
    : null;

  const otherName = activeConvo && otherEmail
    ? activeConvo.participantNames?.[otherEmail] || otherEmail
    : "";

  const otherRole = activeConvo && otherEmail
    ? activeConvo.participantRoles?.[otherEmail] || ""
    : "";

  /* Filtered conversations (search) */
  const filteredConvos = useMemo(() => {
    if (!searchQ.trim()) return conversations;
    const q = searchQ.toLowerCase();
    return conversations.filter(c => {
      const other = getOtherParticipant(c, auth?.email || "");
      const name = c.participantNames?.[other] || other || "";
      return name.toLowerCase().includes(q) || c.lastMessage?.toLowerCase().includes(q);
    });
  }, [conversations, searchQ]);

  /* Send a message */
  const handleSend = () => {
    if (!text.trim() || !activeId || !auth?.email) return;
    sendMsg(activeId, auth.email, text.trim());
    setText("");
    // Reload so new message appears
    const all = getAllConversations();
    const updated = Object.values(all).filter(c =>
      c.participants.some(p => p.toLowerCase() === auth.email.toLowerCase())
    );
    updated.sort((a, b) => {
      const ta = a.messages?.[a.messages.length - 1]?.timestamp || 0;
      const tb = b.messages?.[b.messages.length - 1]?.timestamp || 0;
      return tb - ta;
    });
    setConversations(updated);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const selectConvo = (id) => {
    setActiveId(id);
    markConversationRead(id, auth?.email || "");
  };

  /* Get unread count for ME in a conversation */
  const myUnread = (convo) => convo.unread?.[auth?.email?.toLowerCase()] || 0;

  /* ═══════════════════════════════════════
     RENDER
  ═══════════════════════════════════════ */
  return (
    <div className="messages-page">
      {/* Header */}
      <div className="messages-header">
        <button className="back-btn" onClick={() => navigate(homeRoute)}>
          <FiArrowLeft size={16} /> Back
        </button>
        <h1>Messages</h1>
        {conversations.length > 0 && (
          <span className="messages-badge">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      <div className="messages-container">
        {/* ── LEFT: Conversation List ── */}
        <div className="conversations-list">
          <div className="conversations-search">
            <input
              type="text"
              placeholder="Search conversations…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
          </div>

          <div className="conversations-title">Conversations</div>

          <div className="conversations-scroll">
            {filteredConvos.length === 0 && (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "#94a3b8", fontSize: "0.84rem" }}>
                {conversations.length === 0
                  ? "No conversations yet.\nBook a session and message your mentor!"
                  : "No results found."}
              </div>
            )}

            {filteredConvos.map(convo => {
              const other    = getOtherParticipant(convo, auth?.email || "");
              const name     = convo.participantNames?.[other] || other || "Unknown";
              const role     = convo.participantRoles?.[other] || "";
              const unread   = myUnread(convo);
              const isActive = convo.id === activeId;
              const lastMsg  = convo.lastMessage || "No messages yet";
              const lastTime = convo.lastTime || "";

              return (
                <div
                  key={convo.id}
                  className={`conversation-item ${isActive ? "active" : ""} ${unread > 0 ? "has-unread" : ""}`}
                  onClick={() => selectConvo(convo.id)}
                >
                  <div className="convo-avatar">
                    {role === "user" ? (
                      <div style={{
                        width: 44, height: 44, borderRadius: 14,
                        background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                        color: "#fff", fontWeight: 900, fontSize: "1rem",
                        display: "grid", placeItems: "center",
                      }}>
                        {name[0]?.toUpperCase()}
                      </div>
                    ) : (
                      <img src={`https://i.pravatar.cc/44?u=${other}`} alt={name} style={{ width: 44, height: 44, borderRadius: 14, objectFit: "cover" }} />
                    )}
                    <span className="online-dot" />
                  </div>

                  <div className="convo-info">
                    <div className="convo-top">
                      <span className="convo-name">{name}</span>
                      <span className="convo-time">{lastTime}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                      <p className="convo-preview">{lastMsg}</p>
                      {unread > 0 && (
                        <span style={{
                          background: "#5b6ef8", color: "#fff",
                          fontSize: "0.65rem", fontWeight: 800,
                          minWidth: 18, height: 18, borderRadius: 999,
                          display: "grid", placeItems: "center", padding: "0 4px",
                          flexShrink: 0,
                        }}>
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Chat Area ── */}
        {activeConvo ? (
          <div className="chat-area">
            {/* Chat header */}
            <div className="chat-header">
              <div className="chat-avatar">
                {otherRole === "user" ? (
                  <div style={{
                    width: 42, height: 42, borderRadius: 13,
                    background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                    color: "#fff", fontWeight: 900, fontSize: "1rem",
                    display: "grid", placeItems: "center",
                  }}>
                    {otherName[0]?.toUpperCase()}
                  </div>
                ) : (
                  <img src={`https://i.pravatar.cc/42?u=${otherEmail}`} alt={otherName} style={{ width: 42, height: 42, borderRadius: 13, objectFit: "cover" }} />
                )}
              </div>
              <div className="chat-header-info">
                <p className="chat-header-name">{otherName}</p>
                <p className="chat-header-status">
                  {otherRole === "provider" ? "Mentor · Provider" : "Learner"} · Online
                </p>
              </div>
              <div className="chat-header-actions">
                <button className="chat-action-btn" title="Voice call" onClick={() => alert("📞 Voice call – coming soon!")}>
                  <FiPhone size={16} />
                </button>
                <button className="chat-action-btn" title="Video call" onClick={() => alert("📹 Video call – coming soon!")}>
                  <FiVideo size={16} />
                </button>
                <button
                  className="chat-action-btn"
                  title="View profile"
                  onClick={() => navigate(
                    otherRole === "provider"
                      ? `/provider-profile/${encodeURIComponent(otherEmail)}`
                      : `/user-profile/${encodeURIComponent(otherEmail)}`
                  )}
                >
                  <FiMoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Messages list */}
            <div className="messages-list">
              {activeConvo.messages.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 20px", color: "#94a3b8", fontSize: "0.88rem" }}>
                  <FiMessageSquare size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                  <p>No messages yet.</p>
                  <p style={{ marginTop: 4 }}>Say hello to {otherName}! 👋</p>
                </div>
              )}

              {activeConvo.messages.map(msg => {
                const isMine = msg.from.toLowerCase() === auth?.email?.toLowerCase();
                return (
                  <div key={msg.id} className={`message ${isMine ? "sent" : "received"}`}>
                    <div className="message-bubble">{msg.text}</div>
                    <div className="message-time">{msg.time}</div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="chat-input-area">
              <div className="chat-input-extra-btns">
                <button className="chat-extra-btn" title="Attach file" onClick={() => alert("📎 File attach – coming soon!")}>
                  <FiPaperclip size={15} />
                </button>
                <button className="chat-extra-btn" title="Emoji" onClick={() => alert("😊 Emoji picker – coming soon!")}>
                  <FiSmile size={15} />
                </button>
              </div>
              <textarea
                className="chat-input"
                placeholder={`Message ${otherName}…`}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button className="send-btn" onClick={handleSend} disabled={!text.trim()} title="Send message">
                <FiSend size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="empty-chat">
            <div className="empty-chat-icon">💬</div>
            <h3>Your Messages</h3>
            <p>
              Select a conversation on the left, or visit a mentor's profile and click{" "}
              <strong>"Send Message"</strong> to start a new chat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
