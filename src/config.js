const stripTrailingSlash = (value = '') => value.replace(/\/$/, '');

const resolveApiUrl = () => {
  const fromEnv = process.env.REACT_APP_API_URL;
  if (fromEnv && fromEnv.trim()) {
    return stripTrailingSlash(fromEnv.trim());
  }
  return 'https://localhost:7055/api';
};

export const API_URL = resolveApiUrl();

export const BACKEND_URL = API_URL.replace(/\/api$/, '');

const resolveSignalRUrl = () => {
  const fromEnv = process.env.REACT_APP_SIGNALR_URL;
  if (fromEnv && fromEnv.trim()) {
    return stripTrailingSlash(fromEnv.trim());
  }
  return `${BACKEND_URL}/hubs/chat`;
};

export const SIGNALR_URL = resolveSignalRUrl();
console.log("API_URL =>", API_URL);

