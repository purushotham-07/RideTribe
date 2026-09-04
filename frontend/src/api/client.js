const API_BASE = import.meta.env.VITE_API_URL || '';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('ridetribe_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `API Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errJson.error || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  // If 204 No Content
  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

export const api = {
  // Auth
  login: (credentials) => apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  googleLogin: (data) => apiRequest('/api/auth/google', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => apiRequest('/api/auth/me'),
  updateProfile: (data) => apiRequest('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Community Trips & Join Requests
  getTrips: () => apiRequest('/api/trips'),
  getTrip: (id) => apiRequest(`/api/trips/${id}`),
  createTrip: (data) => apiRequest('/api/trips', { method: 'POST', body: JSON.stringify(data) }),
  sendJoinRequest: (tripId, data) => apiRequest(`/api/trips/${tripId}/join-requests`, { method: 'POST', body: JSON.stringify(data || {}) }),
  getTripJoinRequests: (tripId) => apiRequest(`/api/trips/${tripId}/join-requests`),
  respondJoinRequest: (tripId, requestId, data) => apiRequest(`/api/trips/${tripId}/join-requests/${requestId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getTripChat: (tripId) => apiRequest(`/api/trips/${tripId}/chat`),
  sendTripChat: (tripId, content) => apiRequest(`/api/trips/${tripId}/chat`, { method: 'POST', body: JSON.stringify({ content }) }),
  deleteTrip: (tripId) => apiRequest(`/api/trips/${tripId}`, { method: 'DELETE' }),

  // Ride Intents
  createIntent: (data) => apiRequest('/api/ride-intents', { method: 'POST', body: JSON.stringify(data) }),
  getMyIntents: () => apiRequest('/api/ride-intents/me'),
  getPendingIntents: () => apiRequest('/api/ride-intents/pending'),
  cancelIntent: (id) => apiRequest(`/api/ride-intents/${id}`, { method: 'DELETE' }),

  // Matching Engine
  runMatching: (params) => apiRequest('/api/matching/run', { method: 'POST', body: JSON.stringify(params || {}) }),

  // Ride Groups
  getGroup: (id) => apiRequest(`/api/ride-groups/${id}`),
  getMyGroups: () => apiRequest('/api/ride-groups/me'),
  getAllGroups: () => apiRequest('/api/ride-groups'),
  startRide: (id) => apiRequest(`/api/ride-groups/${id}/start`, { method: 'POST' }),
  completeRide: (id) => apiRequest(`/api/ride-groups/${id}/complete`, { method: 'POST' }),
  updateMemberStatus: (groupId, data) => apiRequest(`/api/ride-groups/${groupId}/members/status`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Telemetry & SOS
  postLocation: (groupId, data) => apiRequest(`/api/live/ride-groups/${groupId}/location`, { method: 'POST', body: JSON.stringify(data) }),
  getGroupLocations: (groupId) => apiRequest(`/api/live/ride-groups/${groupId}/locations`),
  triggerSos: (data) => apiRequest('/api/sos', { method: 'POST', body: JSON.stringify(data) }),
  resolveSos: (id) => apiRequest(`/api/sos/${id}/resolve`, { method: 'POST' }),
  getActiveSos: (groupId) => apiRequest(`/api/sos/group/${groupId}/active`),

  // Uploads to Cloudinary (with local reader fallback)
  uploadImage: async (file, folder = 'ridetribe') => {
    const token = localStorage.getItem('ridetribe_token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const headers = {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const url = `${API_BASE}/api/upload`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn("Server upload attempt failed, using device image reader fallback:", err);
    }

    // Client-side fallback to base64 Data URI so user can ALWAYS upload photos even if backend/Cloudinary is unreachable
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result, status: 'SUCCESS' });
      reader.onerror = () => reject(new Error("Failed to read image file from device"));
      reader.readAsDataURL(file);
    });
  },

  // Ratings
  submitRating: (data) => apiRequest('/api/ratings', { method: 'POST', body: JSON.stringify(data) }),
  getUserRatings: (userId) => apiRequest(`/api/ratings/user/${userId}`),
  getGroupRatings: (groupId) => apiRequest(`/api/ratings/group/${groupId}`),

  // Health
  checkHealth: () => apiRequest('/api/health'),
};
