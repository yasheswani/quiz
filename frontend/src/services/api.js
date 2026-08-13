import axios from 'axios';

const API = axios.create({
  baseURL: `http://${window.location.hostname || 'localhost'}:8000/api/`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT or auth token to requests if it exists in local storage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;