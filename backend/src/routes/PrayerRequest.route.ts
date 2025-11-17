import { createPrayerRequest, createPrayerRequestPayload } from '@/controllers/PrayerRequest.controller';
import { getAllPrayerRequests, getAllPrayerRequestsPayload } from '@/controllers/PrayerRequest.controller';
import { getPrayerRequestById, getPrayerRequestByIdPayload } from '@/controllers/PrayerRequest.controller';
import { deletePrayerRequest, deletePrayerRequestPayload } from '@/controllers/PrayerRequest.controller';
import { togglePrayerCommitment, togglePrayerCommitmentPayload } from '@/controllers/PrayerRequest.controller';
import { checkPrayerCommitment, checkPrayerCommitmentPayload } from '@/controllers/PrayerRequest.controller';
import { getUserPrayerList, getUserPrayerListPayload } from '@/controllers/PrayerRequest.controller';
import Elysia from 'elysia';

export const prayerRequestRoutes = new Elysia()
  // POST endpoint with body
  // Usage: POST /prayer-request/create with body { stytchId: "xxx", text: "Prayer text", isAnonymous: false }
  .post('/create', createPrayerRequest, createPrayerRequestPayload)
  
  // GET endpoint: Get all public prayer requests
  // Usage: GET /prayer-request/get-all
  .get('/get-all', getAllPrayerRequests, getAllPrayerRequestsPayload)
  
  // GET endpoint with URL params
  // Usage: GET /prayer-request/get/:id
  .get('/get/:id', getPrayerRequestById, getPrayerRequestByIdPayload)
  
  // DELETE endpoint with URL params and body
  // Usage: DELETE /prayer-request/delete/:id with body { stytchId: "xxx" }
  .delete('/delete/:id', deletePrayerRequest, deletePrayerRequestPayload)
  
  // POST endpoint: Toggle prayer commitment
  // Usage: POST /prayer-request/toggle-commit/:id with body { stytchId: "xxx" }
  .post('/toggle-commit/:id', togglePrayerCommitment, togglePrayerCommitmentPayload)
  
  // GET endpoint: Check prayer commitment
  // Usage: GET /prayer-request/check-commit/:id?stytchId=xxx
  .get('/check-commit/:id', checkPrayerCommitment, checkPrayerCommitmentPayload)
  
  // GET endpoint: Get user's prayer list
  // Usage: GET /prayer-request/my-prayer-list?stytchId=xxx
  .get('/my-prayer-list', getUserPrayerList, getUserPrayerListPayload);

