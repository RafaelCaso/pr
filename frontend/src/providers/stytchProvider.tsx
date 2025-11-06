import { StytchProvider } from '@stytch/react';
import { StytchUIClient } from '@stytch/vanilla-js';
import type { ReactNode } from 'react';

const stytchClient = new StytchUIClient(
  "public-token-test-f3b26737-44a7-4d2d-ab2e-92535f9d41d7",
);

interface StytchProviderWrapperProps {
  children: ReactNode;
}

export const StytchProviderWrapper = ({ children }: StytchProviderWrapperProps) => {
  return (
    <StytchProvider stytch={stytchClient}>
      {children}
    </StytchProvider>
  );
};