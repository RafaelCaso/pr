import { StytchLogin } from '@stytch/react';
import { Products, OTPMethods } from '@stytch/vanilla-js';

export const LoginOrSignup = () => {
   const config = {
      products: [Products.otp],
      otpOptions: {
        methods: [OTPMethods.Email],
        expirationMinutes: 10,
      },
    };

   return <StytchLogin config={config} />;
};