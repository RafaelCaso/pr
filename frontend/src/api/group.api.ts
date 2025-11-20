import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from './config';

// Types matching backend response structure
export interface Group {
  _id: string;
  name: string;
  description: string;
  code: string;
  isPublic: boolean;
  ownerId: string | { _id: string; firstName?: string; lastName?: string };
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupMember {
  _id: string;
  groupId: string | Group;
  userId: string | { _id: string; firstName?: string; lastName?: string };
  role: 'member' | 'admin';
  joinedAt?: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T | null;
  error?: string;
}

export interface CreateGroupData {
  name: string;
  description: string;
  isPublic?: boolean;
}

export interface JoinGroupData {
  code?: string;
}

// API Functions
export const createGroup = async (data: CreateGroupData): Promise<Group> => {
  const response = await fetchAPI('/group/create', {
    method: 'POST',
    body: JSON.stringify(data),
  }) as ApiResponse<Group>;
  
  if (!response.data) {
    throw new Error(response.message || 'Failed to create group');
  }
  return response.data;
};

export const searchGroups = async (query: string): Promise<Group[]> => {
  const response = await fetchAPI(`/group/search?q=${encodeURIComponent(query)}`, { requireAuth: false }) as ApiResponse<Group[]>;
  
  if (!response.data) {
    throw new Error(response.message || 'Failed to search groups');
  }
  return response.data;
};

export const getPublicGroups = async (): Promise<Group[]> => {
  const response = await fetchAPI('/group/public', { requireAuth: false }) as ApiResponse<Group[]>;
  
  if (!response.data) {
    throw new Error(response.message || 'Failed to get public groups');
  }
  return response.data;
};

export const getMyGroups = async (): Promise<Group[]> => {
  const response = await fetchAPI('/group/my-groups') as ApiResponse<Group[]>;
  
  if (!response.data) {
    throw new Error(response.message || 'Failed to get my groups');
  }
  return response.data;
};

export const getGroupById = async (id: string): Promise<Group> => {
  const response = await fetchAPI(`/group/get/${encodeURIComponent(id)}`, { requireAuth: false }) as ApiResponse<Group>;
  
  if (!response.data) {
    throw new Error(response.message || 'Group not found');
  }
  return response.data;
};

export const getGroupFeed = async (id: string): Promise<any[]> => {
  const response = await fetchAPI(`/group/feed/${encodeURIComponent(id)}`) as ApiResponse<any[]>;
  
  if (!response.data) {
    throw new Error(response.message || 'Failed to get group feed');
  }
  return response.data;
};

export const joinGroup = async (id: string, data?: JoinGroupData): Promise<void> => {
  const response = await fetchAPI(`/group/join/${encodeURIComponent(id)}`, {
    method: 'POST',
    body: JSON.stringify(data || {}),
  }) as ApiResponse<null>;
  
  if (response.error) {
    throw new Error(response.message || 'Failed to join group');
  }
};

export const leaveGroup = async (id: string): Promise<void> => {
  const response = await fetchAPI(`/group/leave/${encodeURIComponent(id)}`, {
    method: 'POST',
  }) as ApiResponse<null>;
  
  if (response.error) {
    throw new Error(response.message || 'Failed to leave group');
  }
};

export const deleteGroup = async (id: string): Promise<void> => {
  const response = await fetchAPI(`/group/delete/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }) as ApiResponse<null>;
  
  if (response.error) {
    throw new Error(response.message || 'Failed to delete group');
  }
};

export const getGroupMembers = async (id: string): Promise<GroupMember[]> => {
  const response = await fetchAPI(`/group/members/${encodeURIComponent(id)}`) as ApiResponse<GroupMember[]>;
  
  if (!response.data) {
    throw new Error(response.message || 'Failed to get group members');
  }
  return response.data;
};

export const makeAdmin = async (groupId: string, userId: string): Promise<void> => {
  const response = await fetchAPI(`/group/make-admin/${encodeURIComponent(groupId)}`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }) as ApiResponse<null>;
  
  if (response.error) {
    throw new Error(response.message || 'Failed to make admin');
  }
};

export const removeMember = async (groupId: string, userId: string): Promise<void> => {
  const response = await fetchAPI(`/group/remove-member/${encodeURIComponent(groupId)}`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }) as ApiResponse<null>;
  
  if (response.error) {
    throw new Error(response.message || 'Failed to remove member');
  }
};

export const getGroupCode = async (id: string): Promise<string> => {
  const response = await fetchAPI(`/group/code/${encodeURIComponent(id)}`) as ApiResponse<{ code: string }>;
  
  if (!response.data) {
    throw new Error(response.message || 'Failed to get group code');
  }
  return response.data.code;
};

// React Query Hooks
export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['myGroups'] });
    },
  });
};

export const useSearchGroups = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['groups', 'search', query],
    queryFn: () => searchGroups(query),
    enabled: enabled && query.length > 0,
  });
};

export const useGetPublicGroups = () => {
  return useQuery({
    queryKey: ['groups', 'public'],
    queryFn: getPublicGroups,
  });
};

export const useGetMyGroups = () => {
  return useQuery({
    queryKey: ['myGroups'],
    queryFn: getMyGroups,
  });
};

export const useGetGroupById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['group', id],
    queryFn: () => getGroupById(id),
    enabled: !!id && enabled,
  });
};

export const useGetGroupFeed = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['groupFeed', id],
    queryFn: () => getGroupFeed(id),
    enabled: !!id && enabled,
  });
};

export const useJoinGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, code }: { id: string; code?: string }) => joinGroup(id, code ? { code } : undefined),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['myGroups'] });
      queryClient.invalidateQueries({ queryKey: ['group', variables.id] });
    },
  });
};

export const useLeaveGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => leaveGroup(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['myGroups'] });
      queryClient.invalidateQueries({ queryKey: ['group', id] });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['myGroups'] });
    },
  });
};

export const useGetGroupMembers = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['groupMembers', id],
    queryFn: () => getGroupMembers(id),
    enabled: !!id && enabled,
  });
};

export const useMakeAdmin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) => makeAdmin(groupId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', variables.groupId] });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) => removeMember(groupId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['myGroups'] });
    },
  });
};

export const useGetGroupCode = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['groupCode', id],
    queryFn: () => getGroupCode(id),
    enabled: !!id && enabled,
  });
};

