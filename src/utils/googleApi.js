// ============================================================
// Google Calendar API + Google Meet Integration Utility
// ============================================================
//
// SETUP INSTRUCTIONS:
// 1. Go to https://console.cloud.google.com
// 2. Create a new project (or select existing)
// 3. Enable "Google Calendar API" from APIs & Services → Library
// 4. Go to APIs & Services → Credentials
// 5. Create OAuth 2.0 Client ID (Web Application)
//    - Add "http://localhost:5173" to Authorized JavaScript Origins
//    - Add "http://localhost:5173" to Authorized Redirect URIs
// 6. Create an API Key
// 7. Replace the values below with your actual credentials
// ============================================================

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
const GOOGLE_API_KEY   = "YOUR_GOOGLE_API_KEY";
const CALENDAR_SCOPE   = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");
const CALENDAR_ID      = "primary";

// Internal token state
let _tokenClient  = null;
let _accessToken  = null;
let _gapiReady    = false;
let _gisReady     = false;
let _googleUser   = null; // { name, email, picture }

// Auth-change subscribers (components subscribe to re-render)
const _listeners = new Set();
function _notifyListeners() {
  _listeners.forEach((fn) => fn(_accessToken, _googleUser));
}

/** Subscribe to Google auth state changes. Returns unsubscribe fn. */
export function subscribeToAuthChange(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}


// ─── Wait helpers ────────────────────────────────────────────

function waitForGapi() {
  return new Promise((resolve) => {
    const check = () => {
      if (window.gapi) resolve();
      else setTimeout(check, 100);
    };
    check();
  });
}

function waitForGoogle() {
  return new Promise((resolve) => {
    const check = () => {
      if (window.google?.accounts?.oauth2) resolve();
      else setTimeout(check, 100);
    };
    check();
  });
}

// ─── Init ────────────────────────────────────────────────────

/**
 * initGoogleApi()
 * Call once at app startup. Loads gapi client, sets API key, 
 * and prepares the OAuth2 token client.
 */
export async function initGoogleApi() {
  try {
    await waitForGapi();
    await new Promise((resolve, reject) => {
      window.gapi.load("client", { callback: resolve, onerror: reject });
    });
    await window.gapi.client.init({
      apiKey:         GOOGLE_API_KEY,
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
        "https://people.googleapis.com/$discovery/rest?version=v1",
      ],
    });
    _gapiReady = true;

    await waitForGoogle();
    _tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope:     CALENDAR_SCOPE,
      callback:  (tokenResponse) => {
        if (tokenResponse?.error) {
          console.warn("[GoogleApi] Token error:", tokenResponse.error);
          return;
        }
        _accessToken = tokenResponse.access_token;
        window.gapi.client.setToken({ access_token: _accessToken });
        localStorage.setItem("google_access_token", _accessToken);
        _notifyListeners();
      },
    });
    _gisReady = true;

    // Restore cached token if available
    const cached    = localStorage.getItem("google_access_token");
    const cachedUser = (() => {
      try { return JSON.parse(localStorage.getItem("google_user_info") || "null"); }
      catch { return null; }
    })();
    if (cached) {
      _accessToken = cached;
      _googleUser  = cachedUser;
      window.gapi.client.setToken({ access_token: cached });
      _notifyListeners();
    }

    console.log("[GoogleApi] Initialized successfully.");
    return true;
  } catch (err) {
    console.error("[GoogleApi] Init failed:", err);
    return false;
  }
}

// ─── Auth ────────────────────────────────────────────────────

/**
 * signInWithGoogle()
 * Opens a Google OAuth popup and requests calendar permissions.
 * Returns true if the user grants access.
 */
export function signInWithGoogle() {
  return new Promise((resolve) => {
    if (!_gisReady || !_tokenClient) {
      console.warn("[GoogleApi] GIS not ready.");
      resolve(false);
      return;
    }
    _tokenClient.callback = async (tokenResponse) => {
      if (tokenResponse?.error) {
        console.warn("[GoogleApi] Auth error:", tokenResponse.error);
        resolve(false);
        return;
      }
      _accessToken = tokenResponse.access_token;
      window.gapi.client.setToken({ access_token: _accessToken });
      localStorage.setItem("google_access_token", _accessToken);

      // Fetch real Google profile info
      try {
        const res = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${_accessToken}` } }
        );
        if (res.ok) {
          const data = await res.json();
          _googleUser = {
            name:    data.name    || "",
            email:   data.email   || "",
            picture: data.picture || "",
          };
          localStorage.setItem("google_user_info", JSON.stringify(_googleUser));
        }
      } catch (e) {
        console.warn("[GoogleApi] Could not fetch user info:", e);
      }

      _notifyListeners();
      resolve(true);
    };
    _tokenClient.requestAccessToken({ prompt: "" });
  });
}

/**
 * signOutGoogle()
 * Revokes the Google OAuth token and clears local state.
 */
export function signOutGoogle() {
  if (_accessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(_accessToken, () => {
      console.log("[GoogleApi] Token revoked.");
    });
  }
  _accessToken = null;
  _googleUser  = null;
  localStorage.removeItem("google_access_token");
  localStorage.removeItem("google_user_info");
  if (window.gapi?.client) {
    window.gapi.client.setToken(null);
  }
  _notifyListeners();
}

/**
 * isGoogleConnected()
 * Returns true if there is a valid access token.
 */
export function isGoogleConnected() {
  return !!_accessToken;
}

/**
 * isApiReady()
 * Returns true when both gapi and GIS are initialized.
 */
export function isApiReady() {
  return _gapiReady && _gisReady;
}

/**
 * getGoogleUserInfo()
 * Returns the signed-in Google user's name, email, picture.
 * Returns null if not connected.
 */
export function getGoogleUserInfo() {
  return _googleUser;
}

// ─── Ensure auth before API calls ────────────────────────────

async function ensureAuth() {
  if (!_accessToken) {
    const ok = await signInWithGoogle();
    if (!ok) throw new Error("Google sign-in was cancelled or failed.");
  }
}

// ─── Date/Time Helpers ────────────────────────────────────────

/**
 * Converts a date string ("2024-06-15") and a 12-hour time string
 * ("09:30 AM") into an ISO 8601 datetime string for Google Calendar.
 */
function toISODateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  try {
    // Parse 12-hour time: "09:30 AM" → 24-hour
    const [timePart, meridiem] = timeStr.trim().split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    if (meridiem?.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (meridiem?.toUpperCase() === "AM" && hours === 12) hours = 0;
    const dateTimeStr = `${dateStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
    return new Date(dateTimeStr).toISOString();
  } catch {
    return null;
  }
}

function addMinutesToISO(isoString, minutes) {
  try {
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() + minutes);
    return date.toISOString();
  } catch {
    return null;
  }
}

// ─── Calendar + Meet API Calls ───────────────────────────────

/**
 * createCalendarEvent(booking)
 * 
 * Creates a Google Calendar event with a Google Meet conference link.
 * Called after a session is booked. Uses the exact date and time
 * selected during booking — no changes to the booking flow.
 * 
 * @param {Object} booking - The booking object from BookingPage
 * @returns {Object|null} - { meetLink, calendarEventId } or null on failure
 */
export async function createCalendarEvent(booking) {
  try {
    await ensureAuth();

    const startISO = toISODateTime(booking.date, booking.time);
    if (!startISO) throw new Error("Invalid date/time for calendar event.");
    const endISO = addMinutesToISO(startISO, parseInt(booking.duration || 30));

    const event = {
      summary: `Mentoring Session: ${booking.userName} with ${booking.providerName}`,
      description: `Topic: ${booking.description || "Mentoring session"}\n\nBooked via ConnectPro.`,
      start:  { dateTime: startISO, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      end:    { dateTime: endISO,   timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      attendees: [
        { email: booking.userId,        displayName: booking.userName       },
        { email: booking.providerEmail, displayName: booking.providerName   },
      ],
      conferenceData: {
        createRequest: {
          requestId:             `connectpro-${booking.id}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email",  minutes: 60 },
          { method: "popup",  minutes: 10 },
        ],
      },
    };

    const response = await window.gapi.client.calendar.events.insert({
      calendarId:             CALENDAR_ID,
      resource:               event,
      conferenceDataVersion:  1,
      sendUpdates:            "all", // sends invite emails to both attendees
    });

    const createdEvent = response.result;
    const meetLink     = createdEvent.hangoutLink || createdEvent.conferenceData?.entryPoints?.[0]?.uri || null;
    const eventId      = createdEvent.id;

    console.log("[GoogleApi] Calendar event created:", eventId, "Meet link:", meetLink);
    return { meetLink, calendarEventId: eventId };

  } catch (err) {
    console.error("[GoogleApi] createCalendarEvent error:", err);
    return null;
  }
}

/**
 * addAvailabilityToCalendar(slot, providerName)
 * 
 * Adds a provider availability slot to Google Calendar as a 30-min
 * placeholder event (so it shows as busy / visible in Calendar).
 * 
 * @param {Object} slot - { date, time } from ProviderCalendar
 * @param {string} providerName
 * @returns {string|null} - Google Calendar event ID (store on the slot for deletion)
 */
export async function addAvailabilityToCalendar(slot, providerName) {
  try {
    await ensureAuth();

    const startISO = toISODateTime(slot.date, slot.time);
    if (!startISO) throw new Error("Invalid slot date/time.");
    const endISO = addMinutesToISO(startISO, 30);

    const event = {
      summary:     `Available: ${providerName || "Mentor"} (ConnectPro)`,
      description: "Availability slot published via ConnectPro.",
      start:  { dateTime: startISO, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      end:    { dateTime: endISO,   timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      colorId: "2", // sage green
      reminders: { useDefault: false },
    };

    const response = await window.gapi.client.calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource:   event,
    });

    const eventId = response.result.id;
    console.log("[GoogleApi] Availability slot added to Calendar:", eventId);
    return eventId;

  } catch (err) {
    console.error("[GoogleApi] addAvailabilityToCalendar error:", err);
    return null;
  }
}

/**
 * removeAvailabilityFromCalendar(googleEventId)
 * 
 * Deletes a previously created availability slot from Google Calendar.
 * 
 * @param {string} googleEventId - The Calendar event ID to delete
 * @returns {boolean} - true on success
 */
export async function removeAvailabilityFromCalendar(googleEventId) {
  if (!googleEventId) return false;
  try {
    await ensureAuth();
    await window.gapi.client.calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId:    googleEventId,
    });
    console.log("[GoogleApi] Availability slot removed from Calendar:", googleEventId);
    return true;
  } catch (err) {
    console.error("[GoogleApi] removeAvailabilityFromCalendar error:", err);
    return false;
  }
}
