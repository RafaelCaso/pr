import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const response = await fetchAPI(`/user/get?stytchId=${encodeURIComponent(stytchId)}`) as ApiResponse<User>;
  if (!response.data) {
    throw new Error(response.message || 'User not found');
  }
  return response.data;
};

export const createUser = async (userData: CreateUserData): Promise<User> => {
  const response = await fetchAPI('/user/create', {
    method: 'POST',
    body: JSON.stringify(userData),
  }) as ApiResponse<User>;
  
  // Handle 409 - user already exists (backend returns existing user)
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
export const useUser = (stytchId: string | null) => {
  return useQuery({
    queryKey: ['user', stytchId],
    queryFn: () => getUserByStytchId(stytchId!),
    enabled: !!stytchId,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ['user', data.stytchId] });
    },
  });
};

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
// Uses Option B: POST always, handle 409 and extract user (more efficient)
// Uses createOrGetUser which handles 409 gracefully without throwing
export const useGetOrCreateUser = (stytchId: string | null) => {
  const queryClient = useQueryClient();
  
  // Custom mutation that uses createOrGetUser (handles 409 gracefully)
  const getOrCreateMutation = useMutation({
    mutationFn: createOrGetUser,
    onSuccess: (data, stytchId) => {
      // Update cache with user data
      queryClient.setQueryData(['user', stytchId], data);
    },
  });
  
  const getOrCreate = async () => {
    if (!stytchId) return null;
    return await getOrCreateMutation.mutateAsync(stytchId);
  };
  
  return {
    user: queryClient.getQueryData<User>(['user', stytchId]),
    isLoading: getOrCreateMutation.isPending,
    error: getOrCreateMutation.error,
    getOrCreate,
  };
};

