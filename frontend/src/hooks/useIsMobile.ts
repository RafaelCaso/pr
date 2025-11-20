import { useState, useEffect } from 'react';

/**
 * Hook that detects if the user is on a mobile device
 * Performs a one-time check on mount based on viewport width
 * Mobile breakpoint: <= 640px
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // One-time check on mount
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 640);
    };

    checkMobile();
  }, []); // Empty dependency array ensures this runs only once on mount

  return {
    isMobile,
  };
};

