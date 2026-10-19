import axios from 'axios';

const API_BASE = 'http://localhost:5500/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject client device token
api.interceptors.request.use((config) => {
  const deviceId = localStorage.getItem('jamboard_device_id');
  if (deviceId) {
    config.headers['X-Client-Device-Id'] = deviceId;
  }
  return config;
});

export const boardAPI = {
  getBoard: (identifier) => api.get(`/boards/${identifier}`),
  getFeed: (boardId, sort = 'hot', page = 1) => 
    api.get(`/boards/${boardId}/posts`, { params: { sort, page } }),
  submitTrack: (boardId, payload) => api.post(`/boards/${boardId}/posts`, payload),
};

export const voteAPI = {
  castVote: (postId, voteType) => api.post(`/posts/${postId}/vote`, { voteType }),
};

export const spotifyAPI = {
  search: (query) => api.get('/spotify/search', { params: { q: query } }),
};

export default api;