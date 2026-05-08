const API_BASE = import.meta.env.VITE_API_BASE;

export const fetchWithNgrok = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "ngrok-skip-browser-warning": "true"
    }
  });
};

export default API_BASE;