import { useEffect } from 'react';
import { useStytchSession } from '@stytch/react';

/**
 * Hook that redirects away from protected pages when user logs out
 * Use this in any component that requires authentication
 */
export const useRequireAuth = (onRedirect: () => void) => {
  const { session } = useStytchSession();

  useEffect(() => {
    // If user logs out (session becomes null), redirect
    if (!session) {
      onRedirect();
    }
  }, [session, onRedirect]);
};

