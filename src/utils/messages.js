/**
 * connectpro_conversations storage schema:
 * {
 *   [conversationId]: {
 *     id: string,           // "email1__email2" (sorted alphabetically)
 *     participants: [email1, email2],
 *     participantNames: { [email]: name },
 *     participantRoles: { [email]: role },
 *     messages: [
 *       { id, from, text, time, read }
 *     ],
 *     lastMessage: string,
 *     lastTime: string,
 *     unread: { [email]: number }
 *   }
 * }
 */

const STORAGE_KEY = "connectpro_conversations";

// Build a stable conversation ID from two emails (sorted)
export function buildConversationId(emailA, emailB) {
  return [emailA.toLowerCase(), emailB.toLowerCase()].sort().join("__");
}

// Load all conversations from localStorage
export function getAllConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Save all conversations back
function saveAllConversations(convos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convos));
}

// Get or create a conversation between two people
export function getOrCreateConversation(myEmail, myName, myRole, theirEmail, theirName, theirRole) {
  const id = buildConversationId(myEmail, theirEmail);
  const convos = getAllConversations();

  if (!convos[id]) {
    convos[id] = {
      id,
      participants: [myEmail.toLowerCase(), theirEmail.toLowerCase()],
      participantNames: {
        [myEmail.toLowerCase()]: myName,
        [theirEmail.toLowerCase()]: theirName,
      },
      participantRoles: {
        [myEmail.toLowerCase()]: myRole,
        [theirEmail.toLowerCase()]: theirRole,
      },
      messages: [],
      lastMessage: "",
      lastTime: "",
      unread: {
        [myEmail.toLowerCase()]: 0,
        [theirEmail.toLowerCase()]: 0,
      },
    };
    saveAllConversations(convos);
  } else {
    // Ensure names are up to date
    convos[id].participantNames[myEmail.toLowerCase()] = myName;
    convos[id].participantNames[theirEmail.toLowerCase()] = theirName;
    saveAllConversations(convos);
  }

  return convos[id];
}

// Get all conversations for a specific user (by email)
export function getConversationsForUser(email) {
  const convos = getAllConversations();
  const lower = email.toLowerCase();
  return Object.values(convos).filter(c =>
    c.participants.some(p => p.toLowerCase() === lower)
  );
}

// Send a message in a conversation
export function sendMessage(conversationId, fromEmail, text) {
  const convos = getAllConversations();
  const convo = convos[conversationId];
  if (!convo) return null;

  const msg = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    from: fromEmail.toLowerCase(),
    text: text.trim(),
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    timestamp: Date.now(),
    read: false,
  };

  convo.messages.push(msg);
  convo.lastMessage = text.trim();
  convo.lastTime = msg.time;

  // Increment unread for the OTHER participant
  convo.participants.forEach(p => {
    if (p.toLowerCase() !== fromEmail.toLowerCase()) {
      convo.unread[p.toLowerCase()] = (convo.unread[p.toLowerCase()] || 0) + 1;
    }
  });

  convos[conversationId] = convo;
  saveAllConversations(convos);
  return msg;
}

// Mark all messages in a conversation as read for a user
export function markConversationRead(conversationId, email) {
  const convos = getAllConversations();
  const convo = convos[conversationId];
  if (!convo) return;
  convo.unread[email.toLowerCase()] = 0;
  convo.messages = convo.messages.map(m => ({ ...m, read: true }));
  convos[conversationId] = convo;
  saveAllConversations(convos);
}

// Get total unread count for a user
export function getTotalUnread(email) {
  const convos = getAllConversations();
  const lower = email.toLowerCase();
  return Object.values(convos).reduce((sum, c) => sum + (c.unread?.[lower] || 0), 0);
}

// Get the other participant's email in a conversation
export function getOtherParticipant(conversation, myEmail) {
  return conversation.participants.find(p => p.toLowerCase() !== myEmail.toLowerCase());
}
