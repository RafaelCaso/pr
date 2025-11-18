/**
 * This is NOT a real route file. This is a template for how all route files should be constructed to meet Elysia standards.
 * 
 * Routes should:
 * 1. Import all controllers and their payloads from the controllers directory
 * 2. Import middleware (e.g., authGuard, authResolve, authBeforeHandle) if routes need authentication
 * 3. Create a new Elysia instance
 * 4. Define public routes first (no authentication required)
 * 5. Use .guard() to apply middleware to protected routes
 * 6. Chain HTTP methods (.get, .post, .put, .delete) with route paths
 * 7. Pass the controller function and its payload to each route
 * 8. Export the routes instance
 * 
 * Route paths can include:
 * - Static paths: '/get', '/create', '/update'
 * - Dynamic params: '/:id', '/user/:userId'
 * - Nested paths: '/shipping-address/add', '/shipping-address/update'
 * 
 * Example with authentication:
 * import { authGuard, authResolve, authBeforeHandle } from '@/middleware/auth.middleware';
 * 
 * export const myRoutes = new Elysia()
 *   .get('/public', publicHandler, publicPayload)
 *   .guard(authGuard, (app) =>
 *     app
 *       .resolve(authResolve)
 *       .onBeforeHandle(authBeforeHandle)
 *       .get('/protected', protectedHandler, protectedPayload)
 *   );
 */


import { createExample, createExamplePayload } from '@/controllers/Example.controller';
import { deleteExample, deleteExamplePayload } from '@/controllers/Example.controller';
import { getExample, getExamplePayload } from '@/controllers/Example.controller';
import { updateExample, updateExamplePayload } from '@/controllers/Example.controller';
import Elysia from 'elysia';

export const exampleRoutes = new Elysia()
  // GET endpoint with query parameters
  // Usage: GET /example/get?name=John&age=30
  .get('/get', getExample, getExamplePayload)
  
  // POST endpoint with body
  // Usage: POST /example/create with body { name: "John", age: 30 }
  .post('/create', createExample, createExamplePayload)
  
  // PUT endpoint with URL params and body
  // Usage: PUT /example/update/123 with body { name: "Jane", age: 25 }
  .put('/update/:id', updateExample, updateExamplePayload)
  
  // DELETE endpoint with URL params
  // Usage: DELETE /example/delete/123
  .delete('/delete/:id', deleteExample, deleteExamplePayload);

