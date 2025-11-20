import { createContext, useContext, type ReactNode } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

interface DeviceContextType {
  isMobile: boolean;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

interface DeviceProviderWrapperProps {
  children: ReactNode;
}

export const DeviceProviderWrapper = ({ children }: DeviceProviderWrapperProps) => {
  const { isMobile } = useIsMobile();
  
  return (
    <DeviceContext.Provider value={{ isMobile }}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProviderWrapper');
  }
  return context;
};

