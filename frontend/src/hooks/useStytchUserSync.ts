import { useEffect, useRef } from 'react';
import { useStytchSession } from '@stytch/react';
import { useGetOrCreateUser } from '../api/user.api';

/**
 * Hook that syncs Stytch authentication with backend user
 * Automatically creates or retrieves user when Stytch session is available
 */
export const useStytchUserSync = () => {
  const { session } = useStytchSession();
  const stytchId = session?.user_id || null;
  const { getOrCreate, user, isLoading, error } = useGetOrCreateUser(stytchId);
  
  // Track if we've already initiated sync for this stytchId
  const syncedStytchIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only sync if:
    // 1. We have a stytchId
    // 2. We haven't already synced for this stytchId
    // 3. We don't already have a user
    // 4. We're not currently loading
    if (stytchId && syncedStytchIdRef.current !== stytchId && !user && !isLoading) {
      syncedStytchIdRef.current = stytchId;
      getOrCreate();
    }
    
    // Reset ref if stytchId changes (user logged out)
    if (!stytchId) {
      syncedStytchIdRef.current = null;
    }
  }, [stytchId, user, isLoading, getOrCreate]);

  return {
    user,
    isLoading,
    error,
    stytchUserId: stytchId,
  };
};

