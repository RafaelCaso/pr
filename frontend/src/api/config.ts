import { stytchClient } from '../providers/stytchProvider';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiConfig = {
  baseURL: API_BASE_URL,
};

export const fetchAPI = async (endpoint: string, options?: RequestInit & { requireAuth?: boolean }) => {
  const url = `${apiConfig.baseURL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  // Add authentication header if required (default: true)
  if (options?.requireAuth !== false) {
    try {
      const session = stytchClient.session.getSync();
      // Stytch session.getSync() returns an object with session_token as a property
      // TypeScript types may not include this, so we use type assertion
      const sessionToken = (session as any)?.session_token;
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }
    } catch (error) {
      // Session might not be available (user not logged in)
      // This is okay for public endpoints that don't require auth
    }
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
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

