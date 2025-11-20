import { createPrayerRequest, createPrayerRequestPayload } from '@/controllers/PrayerRequest.controller';
import { getAllPrayerRequests, getAllPrayerRequestsPayload } from '@/controllers/PrayerRequest.controller';
import { getPrayerRequestById, getPrayerRequestByIdPayload } from '@/controllers/PrayerRequest.controller';
import { deletePrayerRequest, deletePrayerRequestPayload } from '@/controllers/PrayerRequest.controller';
import { togglePrayerCommitment, togglePrayerCommitmentPayload } from '@/controllers/PrayerRequest.controller';
import { checkPrayerCommitment, checkPrayerCommitmentPayload } from '@/controllers/PrayerRequest.controller';
import { getUserPrayerList, getUserPrayerListPayload } from '@/controllers/PrayerRequest.controller';
import { getMyPrayerRequests, getMyPrayerRequestsPayload } from '@/controllers/PrayerRequest.controller';
import { authGuard, authResolve, authBeforeHandle } from '@/middleware/auth.middleware';
import Elysia from 'elysia';

export const prayerRequestRoutes = new Elysia()
  // Public endpoints (no authentication required)
  // GET endpoint: Get all public prayer requests
  // Usage: GET /prayer-request/get-all
  .get('/get-all', getAllPrayerRequests, getAllPrayerRequestsPayload)
  
  // GET endpoint with URL params
  // Usage: GET /prayer-request/get/:id
  .get('/get/:id', getPrayerRequestById, getPrayerRequestByIdPayload)
  
  // Protected endpoints (authentication required)
  // Apply auth guard to all routes inside this guard block
  .guard(authGuard, (app) =>
    app
      // Resolve adds user to context (runs first)
      .resolve(authResolve)
      // BeforeHandle checks authentication (runs after resolve)
      .onBeforeHandle(authBeforeHandle)
      // POST endpoint with body
      // Usage: POST /prayer-request/create with body { text: "Prayer text", isAnonymous: false }
      // Requires: Authorization header with Bearer token
      .post('/create', createPrayerRequest, createPrayerRequestPayload)
      
      // DELETE endpoint with URL params
      // Usage: DELETE /prayer-request/delete/:id
      // Requires: Authorization header with Bearer token
      .delete('/delete/:id', deletePrayerRequest, deletePrayerRequestPayload)
      
      // POST endpoint: Toggle prayer commitment
      // Usage: POST /prayer-request/toggle-commit/:id
      // Requires: Authorization header with Bearer token
      .post('/toggle-commit/:id', togglePrayerCommitment, togglePrayerCommitmentPayload)
      
      // GET endpoint: Check prayer commitment
      // Usage: GET /prayer-request/check-commit/:id
      // Requires: Authorization header with Bearer token
      .get('/check-commit/:id', checkPrayerCommitment, checkPrayerCommitmentPayload)
      
      // GET endpoint: Get user's prayer list
      // Usage: GET /prayer-request/my-prayer-list
      // Requires: Authorization header with Bearer token
      .get('/my-prayer-list', getUserPrayerList, getUserPrayerListPayload)
      
      // GET endpoint: Get user's own prayer requests
      // Usage: GET /prayer-request/my-requests
      // Requires: Authorization header with Bearer token
      .get('/my-requests', getMyPrayerRequests, getMyPrayerRequestsPayload)
  );

