import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

export const loginUser = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const registerUser = (username, email, password) =>
  api.post('/api/auth/register', { username, email, password });
