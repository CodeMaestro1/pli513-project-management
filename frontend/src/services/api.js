import axios from 'axios';

const userBase = import.meta.env.VITE_USER_API || '/api/v1';
const teamBase = import.meta.env.VITE_TEAM_API || '/api/v1';
const taskBase = import.meta.env.VITE_TASK_API || '/api/v1';

export const createClient = (baseURL, getToken) => {
  const client = axios.create({ baseURL });
  client.interceptors.request.use((config) => {
    const token = getToken?.();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return client;
};

// Simple getters provided here; AuthContext holds the token
let tokenGetter = () => localStorage.getItem('token');
export const setTokenGetter = (fn) => { tokenGetter = fn; };

export const userApi = createClient(userBase, () => tokenGetter());
export const teamApi = createClient(teamBase, () => tokenGetter());
export const taskApi = createClient(taskBase, () => tokenGetter());
