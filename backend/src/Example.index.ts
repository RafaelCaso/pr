/**
 * This is NOT a real index file. This is a template for how the main application index.ts should be constructed.
 * 
 * The index.ts file should:
 * 1. Import all route modules
 * 2. Set up middleware (CORS, error handlers, etc.)
 * 3. Connect to the database
 * 4. Register all routes using the .group() pattern for consistency
 * 5. Start the server
 * 6. Initialize background workers if needed
 */

import { exampleRoutes } from './routes/Example.route';
// Import other routes...
// import { userRoutes } from './routes/user.routes';
// import { designRoutes } from './routes/design.routes';

import { setupGlobalErrorHandlers } from './util';
import { cors } from '@elysiajs/cors';
import { Elysia } from 'elysia';
import { connectMongoose } from './db/connect';

// Import background workers if needed
// import { startCleanupCartsWorker } from './workers/cleanupCarts';

// Connect to MongoDB
await connectMongoose();

// Set up global error handlers
setupGlobalErrorHandlers();

// Create the Elysia app instance
const app = new Elysia() 
  // Root route
  .get('/', () => 'Welcome to Your API')
  
  // Register routes using .group() pattern for consistency
  // This ensures all routes are prefixed with a clear path
  .group('/example', app => app.use(exampleRoutes))
  // .group('/user', app => app.use(userRoutes))
  // .group('/design', app => app.use(designRoutes))
  
  // For routes that don't need a prefix (like webhooks or special routes),
  // you can still use .use() directly, but consider if they should have a prefix
  // .use(webhookRoutes)

// Start the server
app.listen({ port: Bun.env.PORT || 3000 });

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

// Start background workers if needed
// startCleanupCartsWorker();

