// ============================================================
// Google Identity Services — OAuth 2.0 Sign-In helper
// ============================================================
// HOW TO GET YOUR CLIENT ID:
// 1. Go to https://console.cloud.google.com/
// 2. Create a project (or select existing)
// 3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
// 4. Application type: Web application
// 5. Authorised JavaScript origins: http://localhost:5173  (and your deployed URL)
// 6. Copy the Client ID and paste it below
// ============================================================

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

/**
 * Decode a Google JWT credential without a library.
 * Returns the payload object: { name, email, picture, sub, ... }
 */
export function decodeGoogleJwt(credential) {
  try {
    const base64Url = credential.split(".")[1];
    const base64    = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json      = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    console.error("[GoogleAuth] Failed to decode JWT", e);
    return null;
  }
}

/**
 * Initialise Google Identity Services and resolve/reject with the credential.
 * Returns a Promise<{ name, email, picture }>.
 */
export function googleSignIn() {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.id) {
      reject(new Error("Google Identity Services not loaded yet. Please wait a moment and try again."));
      return;
    }

    if (GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") {
      reject(new Error("SETUP_REQUIRED"));
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        if (response.credential) {
          const payload = decodeGoogleJwt(response.credential);
          if (payload) {
            resolve({
              name:    payload.name  || payload.email.split("@")[0],
              email:   payload.email,
              picture: payload.picture || null,
              sub:     payload.sub,
            });
          } else {
            reject(new Error("Failed to decode Google credential."));
          }
        } else {
          reject(new Error("No credential returned from Google."));
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Trigger the One-Tap / popup
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        // Fallback: render button flow — use renderButton instead
        const reason = notification.getNotDisplayedReason();
        if (reason === "opt_out_or_no_session" || reason === "unknown_reason") {
          // Try explicit sign-in via OAuth popup
          triggerOAuthPopup(resolve, reject);
        } else {
          reject(new Error(`Google prompt not displayed: ${reason}`));
        }
      }
    });
  });
}

/**
 * Fallback: uses the older gapi OAuth2 popup when One-Tap is suppressed.
 */
function triggerOAuthPopup(resolve, reject) {
  if (!window.google?.accounts?.oauth2) {
    reject(new Error("Google OAuth2 not available."));
    return;
  }

  const client = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: "openid email profile",
    callback: async (tokenResponse) => {
      if (tokenResponse.error) {
        reject(new Error(tokenResponse.error));
        return;
      }
      try {
        const resp = await fetch(
          `https://www.googleapis.com/oauth2/v3/userinfo`,
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        const user = await resp.json();
        resolve({
          name:    user.name  || user.email.split("@")[0],
          email:   user.email,
          picture: user.picture || null,
          sub:     user.sub,
        });
      } catch (e) {
        reject(e);
      }
    },
  });
  client.requestAccessToken({ prompt: "select_account" });
}
