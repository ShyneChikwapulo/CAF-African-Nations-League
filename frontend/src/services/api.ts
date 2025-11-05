import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Teams API
export const teamsAPI = {
  getAll: () => api.get('/teams'),
  getById: (id: string) => api.get(`/teams/${id}`),
  register: (data: any) => api.post('/teams/register', data),
};

// Tournament API
export const tournamentAPI = {
  getCurrent: () => api.get('/tournament/current'),
  create: (data: any) => api.post('/tournament/create', data),
  reset: () => api.post('/tournament/reset'),
  playMatch: (matchId: string, matchType: 'played' | 'simulated' = 'simulated') => 
    api.post(`/tournament/matches/${matchId}/play`, { matchType }),
};

// Matches API
export const matchesAPI = {
  getAll: () => api.get('/matches'),
  getById: (id: string) => api.get(`/matches/${id}`),
  getGoalScorers: (tournamentId: string) => 
    api.get(`/matches/stats/goal-scorers?tournamentId=${tournamentId}`),
};


export const leaderboardAPI = {
  getGoalLeaders: () => axios.get('/api/tournament/goal-leaders')
};

export const seedAPI = {
  seedData: () => api.post('/seed/seed-data'),
};