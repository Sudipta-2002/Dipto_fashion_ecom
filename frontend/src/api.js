export const API_URL = (import.meta.env.VITE_API_URL || 'https://dipto-fashion-backend.onrender.com').replace(/\/$/, '');

export const apiFetch = (endpoint, options) => {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  return fetch(url, options);
};

export default API_URL;
