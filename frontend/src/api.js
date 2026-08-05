const getSanitizedApiUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'https://dipto-fashion-backend.onrender.com';
  url = url.trim();

  // Fix protocol typo with missing slash (e.g., https:/ vs https://)
  if (url.startsWith('https:/') && !url.startsWith('https://')) {
    url = url.replace('https:/', 'https://');
  } else if (url.startsWith('http:/') && !url.startsWith('http://')) {
    url = url.replace('http:/', 'http://');
  }

  // Ensure protocol presence
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Strip trailing slashes
  return url.replace(/\/+$/, '');
};

export const API_URL = getSanitizedApiUrl();

export const apiFetch = (endpoint, options) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${cleanEndpoint}`;
  return fetch(url, options);
};

export default API_URL;
