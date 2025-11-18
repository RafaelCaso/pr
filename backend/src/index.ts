import { userRoutes } from './routes/User.route';
import { prayerRequestRoutes } from './routes/PrayerRequest.route';
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
  
  // Global request logger - this should fire for EVERY request
  .onRequest(({ request }) => {
    console.log('========================================');
    console.log('[GLOBAL] Request received!');
    console.log('[GLOBAL] Method:', request.method);
    console.log('[GLOBAL] URL:', request.url);
    const headerKeys = Array.from(request.headers.keys());
    console.log('[GLOBAL] Request headers keys:', headerKeys);
    if (headerKeys.length > 0) {
      headerKeys.forEach(key => {
        console.log(`[GLOBAL] Header ${key}:`, request.headers.get(key));
      });
    }
    console.log('[GLOBAL] Authorization header:', request.headers.get('authorization') || request.headers.get('Authorization') || 'NOT FOUND');
    console.log('========================================');
  })
  
  // Root route
  .get('/', () => 'Welcome to Your API')
  
  // Test route to verify requests are reaching the backend
  .get('/test', ({ headers }) => {
    console.log('[TEST ROUTE] Request received!');
    console.log('[TEST ROUTE] Headers:', Object.keys(headers));
    console.log('[TEST ROUTE] Authorization:', headers.authorization || 'NOT PRESENT');
    return { message: 'Backend is working', headers: Object.keys(headers) };
  })
  
  // Register routes using .group() pattern for consistency
  .group('/user', app => app.use(userRoutes))
  .group('/prayer-request', app => app.use(prayerRequestRoutes))

// Start the server
app.listen({ port: process.env.PORT || 3000 });

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
