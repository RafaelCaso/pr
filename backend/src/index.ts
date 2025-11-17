import { userRoutes } from './routes/User.route';
import { setupGlobalErrorHandlers } from './util';
import { Elysia } from 'elysia';
import { connectMongoose } from './db/connect';

// Connect to MongoDB
await connectMongoose();

// Set up global error handlers
setupGlobalErrorHandlers();

// Create the Elysia app instance
const app = new Elysia() 
  // Root route
  .get('/', () => 'Welcome to Your API')
  
  // Register routes using .group() pattern for consistency
  .group('/user', app => app.use(userRoutes))

// Start the server
app.listen({ port: Bun.env.PORT || 3000 });

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
