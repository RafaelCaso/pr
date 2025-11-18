import { createUser, createUserPayload } from '@/controllers/User.controller';
import { getUser, getUserPayload } from '@/controllers/User.controller';
import { updateUser, updateUserPayload } from '@/controllers/User.controller';
import { authGuard, authResolve, authBeforeHandle } from '@/middleware/auth.middleware';
import Elysia from 'elysia';

export const userRoutes = new Elysia()
  // Protected endpoints (authentication required)
  // Apply auth guard to all routes - all user routes require authentication
  .guard(authGuard, (app) =>
    app
      // Resolve adds user to context (runs first)
      .resolve(authResolve)
      // BeforeHandle checks authentication (runs after resolve)
      .onBeforeHandle(authBeforeHandle)
      // GET endpoint: Get current authenticated user
      // Usage: GET /user/get
      // Requires: Authorization header with Bearer token
      .get('/get', getUser, getUserPayload)
      
      // POST endpoint with body (for first-time user creation)
      // Usage: POST /user/create with body { stytchId: "xxx", firstName: "John", lastName: "Doe" }
      // Requires: Authorization header with Bearer token
      // Note: stytchId in body is still required for first-time user creation
      .post('/create', createUser, createUserPayload)
      
      // PUT endpoint with body
      // Usage: PUT /user/update with body { firstName: "Jane", lastName: "Smith" }
      // Requires: Authorization header with Bearer token
      .put('/update', updateUser, updateUserPayload)
  );

