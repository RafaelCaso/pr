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
export const getUser = async (): Promise<User> => {
  try {
    const response = await fetchAPI(`/user/get`) as ApiResponse<User>;
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
// Note: For first-time user creation, we still need stytchId in the body
export const createOrGetUser = async (stytchId: string): Promise<User> => {
  // First, try to get the user (using authenticated endpoint)
  try {
    const user = await getUser();
    return user;
  } catch (error: any) {
    // If user doesn't exist (404), create them
    // For first-time creation, we need to pass stytchId in body
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

export const updateUser = async (updates: UpdateUserData): Promise<User> => {
  const response = await fetchAPI(`/user/update`, {
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
    mutationFn: (updates: UpdateUserData) => updateUser(updates),
    onSuccess: () => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

// Get or Create User Hook (handles create-if-not-exists pattern)
// Uses GET first, then POST if user doesn't exist (avoids 409 errors)
export const useGetOrCreateUser = (stytchId: string | null) => {
  const queryClient = useQueryClient();
  
  // Check cache first
  const cachedUser = queryClient.getQueryData<User>(['user']);
  
  // Custom mutation that uses createOrGetUser (GET first, then POST if needed)
  const getOrCreateMutation = useMutation({
    mutationFn: createOrGetUser,
    onSuccess: (data) => {
      // Update cache with user data
      queryClient.setQueryData(['user'], data);
    },
  });
  
  const getOrCreate = async () => {
    if (!stytchId) return null;
    
    // If user is already in cache, return it
    const cached = queryClient.getQueryData<User>(['user']);
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

