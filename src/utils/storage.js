export function getAuth() {
  try {
    return JSON.parse(localStorage.getItem("connectpro_auth") || "null");
  } catch {
    return null;
  }
}

export function setAuth(auth) {
  localStorage.setItem("connectpro_auth", JSON.stringify(auth));
}

export function removeAuth() {
  localStorage.removeItem("connectpro_auth");
}

export function getStoredUsers() {
  const stored = localStorage.getItem("connectpro_users");
  if (stored) return JSON.parse(stored);
  const legacy = localStorage.getItem("connectpro_user");
  if (legacy) {
    return [JSON.parse(legacy)];
  }
  return [];
}

export function getStoredProviders() {
  const stored = localStorage.getItem("connectpro_providers");
  if (stored) return JSON.parse(stored);
  const legacy = localStorage.getItem("connectpro_provider");
  if (legacy) {
    return [JSON.parse(legacy)];
  }
  return [];
}

export function saveStoredUsers(users) {
  localStorage.setItem("connectpro_users", JSON.stringify(users));
}

export function saveStoredProviders(providers) {
  localStorage.setItem("connectpro_providers", JSON.stringify(providers));
}

export function getCurrentProfile() {
  const auth = getAuth();
  if (!auth || !auth.email) return null;
  if (auth.role === "provider") {
    return getStoredProviders().find((user) => user.email.toLowerCase() === auth.email.toLowerCase()) || null;
  }
  return getStoredUsers().find((user) => user.email.toLowerCase() === auth.email.toLowerCase()) || null;
}

export function updateCurrentProfile(profile) {
  const auth = getAuth();
  if (!auth || !auth.email) return;
  if (auth.role === "provider") {
    const providers = getStoredProviders().map((user) =>
      user.email.toLowerCase() === auth.email.toLowerCase() ? profile : user
    );
    saveStoredProviders(providers);
    return;
  }
  const users = getStoredUsers().map((user) =>
    user.email.toLowerCase() === auth.email.toLowerCase() ? profile : user
  );
  saveStoredUsers(users);
}

export function getProviderAvailability(email) {
  if (!email) return [];
  const stored = localStorage.getItem("connectpro_provider_availability");
  if (!stored) return [];
  const all = JSON.parse(stored);
  return all[email.toLowerCase()] || [];
}

export function saveProviderAvailability(email, availability) {
  if (!email) return;
  const stored = localStorage.getItem("connectpro_provider_availability");
  const all = stored ? JSON.parse(stored) : {};
  all[email.toLowerCase()] = availability;
  localStorage.setItem("connectpro_provider_availability", JSON.stringify(all));
}

export function deleteCurrentProfile() {
  const auth = getAuth();
  if (!auth || !auth.email) return;
  if (auth.role === "provider") {
    const providers = getStoredProviders().filter(
      (user) => user.email.toLowerCase() !== auth.email.toLowerCase()
    );
    saveStoredProviders(providers);
    return;
  }
  const users = getStoredUsers().filter(
    (user) => user.email.toLowerCase() !== auth.email.toLowerCase()
  );
  saveStoredUsers(users);
}
