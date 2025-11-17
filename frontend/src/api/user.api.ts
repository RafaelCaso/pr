import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from './config';

// Types matching backend response structure
export interface User {
  _id: string;
  stytchId: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T | null;
  error?: string;
}

export interface CreateUserData {
  stytchId: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
}

// API Functions
export const getUserByStytchId = async (stytchId: string): Promise<User> => {
  try {
    const response = await fetchAPI(`/user/get?stytchId=${encodeURIComponent(stytchId)}`) as ApiResponse<User>;
    if (!response.data) {
      const error: any = new Error(response.message || 'User not found');
      error.status = 404;
      error.isExpected = true; // Mark as expected for silent handling
      throw error;
    }
    return response.data;
  } catch (error: any) {
    // Preserve status from fetchAPI errors
    if (error.status) {
      // Mark 404s as expected for silent handling
      if (error.status === 404) {
        error.isExpected = true;
      }
      throw error;
    }
    // If no status, assume 404
    const err: any = error instanceof Error ? error : new Error('User not found');
    err.status = 404;
    err.isExpected = true;
    throw err;
  }
};

export const createUser = async (userData: CreateUserData): Promise<User> => {
  const response = await fetchAPI('/user/create', {
    method: 'POST',
    body: JSON.stringify(userData),
  }) as ApiResponse<User>;
  
  if (!response.data) {
    throw new Error(response.message || 'Failed to create user');
  }
  return response.data;
};

// Create or get user - GET first to avoid 409 errors
export const createOrGetUser = async (stytchId: string): Promise<User> => {
  // First, try to get the user
  try {
    const user = await getUserByStytchId(stytchId);
    return user;
  } catch (error: any) {
    // If user doesn't exist (404), create them
    // Silently handle expected 404s - don't log to console
    if (error.status === 404 || error.message?.includes('not found')) {
      const response = await fetchAPI('/user/create', {
        method: 'POST',
        body: JSON.stringify({ stytchId }),
      }) as ApiResponse<User>;
      
      if (!response.data) {
        throw new Error(response.message || 'Failed to create user');
      }
      return response.data;
    }
    // For other errors, re-throw
    throw error;
  }
};

export const updateUser = async (stytchId: string, updates: UpdateUserData): Promise<User> => {
  const response = await fetchAPI(`/user/update/${encodeURIComponent(stytchId)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }) as ApiResponse<User>;
  
  if (!response.data) {
    throw new Error(response.message || 'User not found');
  }
  return response.data;
};

// React Query Hooks
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ stytchId, updates }: { stytchId: string; updates: UpdateUserData }) =>
      updateUser(stytchId, updates),
    onSuccess: (data) => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ['user', data.stytchId] });
    },
  });
};

// Get or Create User Hook (handles create-if-not-exists pattern)
// Uses GET first, then POST if user doesn't exist (avoids 409 errors)
export const useGetOrCreateUser = (stytchId: string | null) => {
  const queryClient = useQueryClient();
  
  // Check cache first
  const cachedUser = queryClient.getQueryData<User>(['user', stytchId]);
  
  // Custom mutation that uses createOrGetUser (GET first, then POST if needed)
  const getOrCreateMutation = useMutation({
    mutationFn: createOrGetUser,
    onSuccess: (data, stytchId) => {
      // Update cache with user data
      queryClient.setQueryData(['user', stytchId], data);
    },
  });
  
  const getOrCreate = async () => {
    if (!stytchId) return null;
    
    // If user is already in cache, return it
    const cached = queryClient.getQueryData<User>(['user', stytchId]);
    if (cached) {
      return cached;
    }
    
    // Otherwise, fetch or create
    return await getOrCreateMutation.mutateAsync(stytchId);
  };
  
  return {
    user: cachedUser,
    isLoading: getOrCreateMutation.isPending,
    error: getOrCreateMutation.error,
    getOrCreate,
  };
};

