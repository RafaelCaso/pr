import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from './config';

// Types matching backend response structure
export interface Feedback {
  _id: string;
  text: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T | null;
  error?: string;
}

export interface CreateFeedbackData {
  text: string;
}

// API Functions
export const createFeedback = async (data: CreateFeedbackData): Promise<Feedback> => {
  const response = await fetchAPI('/feedback/create', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: false,
  }) as ApiResponse<Feedback>;
  
  if (!response.data) {
    throw new Error(response.message || 'Failed to create feedback');
  }
  return response.data;
};

export const getAllFeedback = async (): Promise<Feedback[]> => {
  const response = await fetchAPI('/feedback/get-all', { requireAuth: false }) as ApiResponse<Feedback[]>;
  
  if (!response.data) {
    throw new Error(response.message || 'Failed to get feedback');
  }
  return response.data;
};

// React Query Hooks
export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createFeedback,
    onSuccess: () => {
      // Invalidate and refetch feedback
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
};

export const useGetAllFeedback = () => {
  return useQuery({
    queryKey: ['feedback'],
    queryFn: getAllFeedback,
  });
};

