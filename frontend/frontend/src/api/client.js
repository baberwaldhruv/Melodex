import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5500/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const deviceId = localStorage.getItem('jamboard_device_id');
  if (deviceId) {
    config.headers['X-Client-Device-Id'] = deviceId;
  }
  return config;
});

export const authAPI = {
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

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
  createPlaylist: (payload) => api.post('/spotify/custom-playlist', payload),
};

export default api;