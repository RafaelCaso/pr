import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from './config';

// Types matching backend response structure
export interface PrayerRequest {
  _id: string;
  text: string;
  userId: string | { _id: string; firstName?: string; lastName?: string } | null; // string for anonymous, object for populated, null if not set
  isAnonymous: boolean;
  prayerCount: number;
  groupId?: string | { _id: string; name?: string } | null; // string/ObjectId for unpopulated, object for populated Group, null for public
  reportCount: number;
  status: 'active' | 'under_review' | 'reviewed';
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T | null;
  error?: string;
}

export interface CreatePrayerRequestData {
  text: string;
  isAnonymous?: boolean;
}

export interface PrayerCommitmentStatus {
  hasCommitted: boolean;
}

export interface ToggleCommitmentResult {
  committed: boolean;
}

// API Functions
export const createPrayerRequest = async (data: CreatePrayerRequestData): Promise<PrayerRequest> => {
  const response = await fetchAPI('/prayer-request/create', {
    method: 'POST',
    body: JSON.stringify(data),
  }) as ApiResponse<PrayerRequest>;
  
  if (!response.data) {
    throw new Error(response.message || 'Failed to create prayer request');
  }
  return response.data;
};

export const getAllPrayerRequests = async (): Promise<PrayerRequest[]> => {
  const response = await fetchAPI('/prayer-request/get-all', { requireAuth: false }) as ApiResponse<PrayerRequest[]>;
  
  if (!response.data) {
    throw new Error(response.message || 'Failed to get prayer requests');
  }
  return response.data;
};

export const getPrayerRequestById = async (id: string): Promise<PrayerRequest> => {
  const response = await fetchAPI(`/prayer-request/get/${encodeURIComponent(id)}`, { requireAuth: false }) as ApiResponse<PrayerRequest>;
  
  if (!response.data) {
    throw new Error(response.message || 'Prayer request not found');
  }
  return response.data;
};

export const deletePrayerRequest = async (id: string): Promise<void> => {
  const response = await fetchAPI(`/prayer-request/delete/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }) as ApiResponse<null>;
  
  if (response.error) {
    throw new Error(response.message || 'Failed to delete prayer request');
  }
};

export const togglePrayerCommitment = async (id: string): Promise<ToggleCommitmentResult> => {
  const response = await fetchAPI(`/prayer-request/toggle-commit/${encodeURIComponent(id)}`, {
    method: 'POST',
  }) as ApiResponse<ToggleCommitmentResult>;
  
  if (!response.data) {
    throw new Error(response.message || 'Failed to toggle prayer commitment');
  }
  return response.data;
};

export const checkPrayerCommitment = async (id: string): Promise<PrayerCommitmentStatus> => {
  const response = await fetchAPI(`/prayer-request/check-commit/${encodeURIComponent(id)}`) as ApiResponse<PrayerCommitmentStatus>;
  
  if (!response.data) {
    throw new Error(response.message || 'Failed to check prayer commitment');
  }
  return response.data;
};

export const getUserPrayerList = async (): Promise<PrayerRequest[]> => {
  const response = await fetchAPI(`/prayer-request/my-prayer-list`) as ApiResponse<PrayerRequest[]>;
  
  if (!response.data) {
    throw new Error(response.message || 'Failed to get user prayer list');
  }
  return response.data;
};

// React Query Hooks
export const useCreatePrayerRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPrayerRequest,
    onSuccess: () => {
      // Invalidate and refetch prayer requests
      queryClient.invalidateQueries({ queryKey: ['prayerRequests'] });
    },
  });
};

export const useGetAllPrayerRequests = () => {
  return useQuery({
    queryKey: ['prayerRequests'],
    queryFn: getAllPrayerRequests,
  });
};

export const useGetPrayerRequestById = (id: string) => {
  return useQuery({
    queryKey: ['prayerRequest', id],
    queryFn: () => getPrayerRequestById(id),
    enabled: !!id,
  });
};

export const useDeletePrayerRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deletePrayerRequest(id),
    onSuccess: () => {
      // Invalidate and refetch prayer requests
      queryClient.invalidateQueries({ queryKey: ['prayerRequests'] });
      queryClient.invalidateQueries({ queryKey: ['userPrayerList'] });
    },
  });
};

export const useTogglePrayerCommitment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => togglePrayerCommitment(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch prayer requests and commitment status
      queryClient.invalidateQueries({ queryKey: ['prayerRequests'] });
      queryClient.invalidateQueries({ queryKey: ['prayerRequest', id] });
      queryClient.invalidateQueries({ queryKey: ['prayerCommitment', id] });
      queryClient.invalidateQueries({ queryKey: ['userPrayerList'] });
    },
  });
};

export const useCheckPrayerCommitment = (id: string) => {
  return useQuery({
    queryKey: ['prayerCommitment', id],
    queryFn: () => checkPrayerCommitment(id),
    enabled: !!id,
  });
};

export const useGetUserPrayerList = () => {
  return useQuery({
    queryKey: ['userPrayerList'],
    queryFn: getUserPrayerList,
  });
};

