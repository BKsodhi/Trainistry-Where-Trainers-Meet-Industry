/**
 * Trainistry Centralized HTTP API Client Module
 */
let BASE_URL = import.meta.env.VITE_API_URL || 'https://trainistry-where-trainers-meet-industry-w2tj.onrender.com/api/v1';
if (BASE_URL && !BASE_URL.endsWith('/api/v1')) {
  // Automatically append /api/v1 if the user forgot it in their Vercel environment variables
  BASE_URL = `${BASE_URL.replace(/\/$/, '')}/api/v1`;
}

interface RequestOptions extends RequestInit {
  bodyData?: any;
}

export const apiClient = async (endpoint: string, options: RequestOptions = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  // Set up standard headers for JSON data handling
  const headers = new Headers(options.headers || {});
  if (options.bodyData && !(options.bodyData instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem('trainistry_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
    // CRITICAL: Tells the browser to send signed cookies across localhost port boundaries
    credentials: 'include', 
    method: options.method || 'GET',
  };

  if (options.bodyData) {
    config.body = options.bodyData instanceof FormData 
      ? options.bodyData 
      : JSON.stringify(options.bodyData);
  }

  try {
    const response = await fetch(url, config);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || `HTTP Execution Error Status: ${response.status}`);
    }

    return result;
  } catch (error: any) {
    console.error(`[API_CLIENT_EXCEPTION] Endpoint ${endpoint} failed:`, error.message);
    throw error;
  }
};
