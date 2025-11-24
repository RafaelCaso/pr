import { userRoutes } from './routes/User.route';
import { prayerRequestRoutes } from './routes/PrayerRequest.route';
import { groupRoutes } from './routes/Group.route';
import { feedbackRoutes } from './routes/Feedback.route';
import { setupGlobalErrorHandlers } from './util';
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { connectMongoose } from './db/connect';

// Connect to MongoDB
await connectMongoose();

// Set up global error handlers
setupGlobalErrorHandlers();

// Create the Elysia app instance
const app = new Elysia()
  // Enable CORS with Authorization header support
  .use(cors({
    origin: true, // Allow all origins (for development) - restrict in production
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Type'],
  }))
  
  
  // Root route
  .get('/', () => 'Welcome to Your API')
  
  
  // Register routes using .group() pattern for consistency
  .group('/user', app => app.use(userRoutes))
  .group('/prayer-request', app => app.use(prayerRequestRoutes))
  .group('/group', app => app.use(groupRoutes))
  .group('/feedback', app => app.use(feedbackRoutes))

// Start the server
app.listen({ port: process.env.PORT || 3000 });

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
