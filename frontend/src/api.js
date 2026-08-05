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
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TMAyEYZpYPApGL';

export const apiFetch = (endpoint, options) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${cleanEndpoint}`;
  return fetch(url, options);
};

export const parseResponseSafely = async (res) => {
  try {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    const text = await res.text();
    return {
      success: false,
      isHtmlError: true,
      status: res.status,
      message: text || `Backend API returned HTTP status ${res.status}`
    };
  } catch (e) {
    return {
      success: false,
      isHtmlError: true,
      message: e.message || 'Failed to parse response payload'
    };
  }
};

export default API_URL;
