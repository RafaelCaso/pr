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
      // Get session token from Stytch cookie
      // According to Stytch docs, the session token is stored in the 'stytch_session' cookie
      // We read it directly from cookies since the vanilla JS SDK doesn't expose a direct getToken method
      let sessionToken: string | null = null;
      
      if (typeof document !== 'undefined') {
        // Parse cookies to find the Stytch session token
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = decodeURIComponent(value);
          return acc;
        }, {} as Record<string, string>);
        
        // Stytch stores the session token in 'stytch_session' cookie
        // The cookie value is the session token itself
        sessionToken = cookies['stytch_session'] || null;
      }
      
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
    credentials: 'include', // Include cookies and allow CORS with credentials
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

