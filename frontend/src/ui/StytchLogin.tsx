import { StytchLogin } from '@stytch/react';
import { Products, OTPMethods } from '@stytch/vanilla-js';

export const LoginOrSignup = () => {
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

   return <StytchLogin config={config} />;
};