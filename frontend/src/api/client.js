const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("smartissue_token");
}

async function request(path, { method = "GET", body, headers = {}, auth = true } = {}) {
  const finalHeaders = { "Content-Type": "application/json", ...headers };
  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch {
      // ignore parse failure
    }
    throw new Error(detail);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // --- Auth ---
  login: (somaiya_id, password) =>
    request("/auth/login", { method: "POST", body: { somaiya_id, password }, auth: false }),
  me: () => request("/auth/me"),

  // --- Rooms ---
  listRooms: () => request("/rooms"),

  // --- Components / inventory ---
  listComponents: (roomId) => request(`/components${roomId ? `?room_id=${roomId}` : ""}`),

  // --- Requests ---
  createRequest: (component_id, qty, purpose) =>
    request("/requests", { method: "POST", body: { component_id, qty, purpose } }),
  listRequests: (status) => request(`/requests${status ? `?status=${status}` : ""}`),
  approveRequest: (id, note) =>
    request(`/requests/${id}/approve`, { method: "POST", body: { note } }),
  rejectRequest: (id, note) =>
    request(`/requests/${id}/reject`, { method: "POST", body: { note } }),
  cancelRequest: (id) => request(`/requests/${id}/cancel`, { method: "POST" }),

  // --- Issuances ---
  listIssuances: () => request("/issuances"),
  returnIssuance: (id) => request(`/issuances/${id}/return`, { method: "POST" }),

  // --- Kiosk (device-authenticated, not user-authenticated) ---
  kioskVerify: (somaiya_id, room_code, detections, kioskKey) =>
    request("/kiosk/verify", {
      method: "POST",
      body: { somaiya_id, room_code, detections },
      headers: { "X-Kiosk-Key": kioskKey },
      auth: false,
    }),
  kioskEvents: () => request("/kiosk/events"),

  // --- Reports ---
  usageReport: () => request("/reports/usage"),
};

export function saveSession(token, user) {
  localStorage.setItem("smartissue_token", token);
  localStorage.setItem("smartissue_user", JSON.stringify(user));
}

export function loadSession() {
  const token = localStorage.getItem("smartissue_token");
  const userRaw = localStorage.getItem("smartissue_user");
  if (!token || !userRaw) return null;
  try {
    return { token, user: JSON.parse(userRaw) };
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("smartissue_token");
  localStorage.removeItem("smartissue_user");
}
