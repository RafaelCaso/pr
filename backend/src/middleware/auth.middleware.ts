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
  namespace Elysia {
    interface Context {
      user?: {
        stytchId: string;
        userId: Types.ObjectId | null; // null for first-time users who don't exist in DB yet
      };
    }
  }
}

/**
 * Authentication guard for Elysia
 * Validates Stytch session tokens and attaches user to context
 * Returns 401 for invalid/missing tokens
 * 
 * Usage:
 * .guard(authGuard, (app) =>
 *   app
 *     .resolve(authResolve)
 *     .beforeHandle(authBeforeHandle)
 *     .get('/protected-route', handler)
 * )
 * 
 * Note: According to Elysia docs, both resolve and beforeHandle must be inside the guard scope.
 * The plain object should be empty (or contain only validation schema).
 */
export const authGuard = {};

/**
 * Resolve function to add user to context
 * Must be used inside the guard scope (runs before beforeHandle)
 */
export const authResolve = async ({ headers }: any): Promise<{ user: { stytchId: string; userId: Types.ObjectId | null } | undefined }> => {
  const authHeader = headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      user: undefined,
    };
  }

  const sessionToken = authHeader.substring(7);

  try {
    const session = await stytchClient.sessions.authenticate({
      session_token: sessionToken,
    });

    const user = await userOperations.findUserByStytchId(session.session.user_id);
    
    if (!user) {
      return {
        user: {
          stytchId: session.session.user_id,
          userId: null as Types.ObjectId | null,
        },
      };
    }

    return {
      user: {
        stytchId: session.session.user_id,
        userId: user._id as Types.ObjectId,
      },
    };
  } catch (error) {
    return {
      user: undefined,
    };
  }
};

/**
 * BeforeHandle function to check authentication
 * Must be used inside the guard scope (runs after resolve)
 */
export const authBeforeHandle = async ({ user, set }: any) => {
  if (!user) {
    set.status = 401;
    return {
      message: 'Unauthorized - authentication required',
      data: null,
    };
  }
};

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

