import { Elysia } from 'elysia';
import { Client, envs } from 'stytch';
import { userOperations } from '../dbOperations/user.dbOps';
import { Types } from 'mongoose';

// Initialize Stytch client
const stytchClient = new Client({
  project_id: process.env.STYTCH_PROJECT_ID || '',
  secret: process.env.STYTCH_SECRET || '',
  env: process.env.STYTCH_ENV === 'production' ? envs.live : envs.test,
});

// Extend Elysia context to include authenticated user
declare module 'elysia' {
  interface Context {
    user?: {
      stytchId: string;
      userId: Types.ObjectId | null; // null for first-time users who don't exist in DB yet
    };
  }
}

/**
 * Authentication middleware that validates Stytch session tokens
 * Extracts user ID from token and attaches to context
 * Returns 401 for invalid/missing tokens
 */
export const authMiddleware = new Elysia()
  .derive(async ({ headers, set }) => {
    // Extract session token from Authorization header
    const authHeader = headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      set.status = 401;
      return {
        error: 'Missing or invalid authorization header',
      };
    }

    const sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Validate session token with Stytch
      const session = await stytchClient.sessions.authenticate({
        session_token: sessionToken,
      });

      // Get MongoDB user ID from Stytch ID
      const user = await userOperations.findUserByStytchId(session.session.user_id);
      
      if (!user) {
        // User doesn't exist yet - this is allowed for first-time user creation
        // Attach only stytchId, without userId (null)
        return {
          user: {
            stytchId: session.session.user_id,
            userId: null as Types.ObjectId | null,
          },
        };
      }

      // Attach user info to context
      return {
        user: {
          stytchId: session.session.user_id,
          userId: user._id,
        },
      };
    } catch (error) {
      console.error('Authentication error:', error);
      set.status = 401;
      return {
        error: 'Invalid or expired session token',
      };
    }
  });

/**
 * Optional authentication middleware (for endpoints that work with or without auth)
 * Silently fails if no token is provided or token is invalid
 */
export const optionalAuthMiddleware = new Elysia()
  .derive(async ({ headers }) => {
    const authHeader = headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: undefined };
    }

    const sessionToken = authHeader.substring(7);

    try {
      const session = await stytchClient.sessions.authenticate({
        session_token: sessionToken,
      });

      const user = await userOperations.findUserByStytchId(session.session.user_id);
      
      if (!user) {
        return { user: undefined };
      }

      return {
        user: {
          stytchId: session.session.user_id,
          userId: user._id,
        },
      };
    } catch (error) {
      // Silently fail for optional auth
      return { user: undefined };
    }
  });

/**
 * TODO: Future Implementation - Admin-only middleware
 * 
 * This middleware should be used after authMiddleware to check for admin role.
 * 
 * Steps to implement:
 * 1. Add 'role' field to User model (default: 'user', can be 'admin')
 * 2. Create adminMiddleware that checks user.role === 'admin'
 * 3. Apply authMiddleware + adminMiddleware chain to admin routes
 * 
 * Example usage:
 * export const adminRoutes = new Elysia()
 *   .use(authMiddleware)
 *   .use(adminMiddleware)
 *   .delete('/admin/delete/:id', adminDeletePrayerRequest, adminDeletePayload)
 */

