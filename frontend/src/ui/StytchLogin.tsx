import { StytchLogin } from '@stytch/react';
import { Products, OTPMethods } from '@stytch/vanilla-js';

interface LoginOrSignupProps {
  onClose?: () => void;
}

export const LoginOrSignup = ({ onClose }: LoginOrSignupProps = {}) => {
   const config = {
      products: [Products.otp],
      otpOptions: {
        methods: [OTPMethods.Email],
        expirationMinutes: 10,
      },
      sessionOptions: {
        sessionDurationMinutes: 60 * 24 * 30, // 30 days - sessions persist across browser sessions
      },
    };

   const callbacks = {
     onEvent: (message: any) => {
       // Handle close events if Stytch provides them
       if (message.eventType === 'USER_CLOSED_MODAL' || message.eventType === 'MODAL_CLOSED') {
         onClose?.();
       }
     },
   };

   return <StytchLogin config={config} callbacks={callbacks} />;
};