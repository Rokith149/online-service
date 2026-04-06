import axios from 'axios';

// Use environment variable for base URL, fallback to localhost for local dev if not provided
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export default api;
