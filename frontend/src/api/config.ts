const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiConfig = {
  baseURL: API_BASE_URL,
};

export const fetchAPI = async (endpoint: string, options?: RequestInit) => {
  const url = `${apiConfig.baseURL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error: any = {
      status: response.status,
      message: responseData.message || response.statusText,
      data: responseData.data || null,
      // Mark 404s as expected for silent handling
      isExpected: response.status === 404,
    };
    throw error;
  }

  return responseData;
};

