import { createFeedback, createFeedbackPayload } from '@/controllers/Feedback.controller';
import { getAllFeedback, getAllFeedbackPayload } from '@/controllers/Feedback.controller';
import Elysia from 'elysia';

export const feedbackRoutes = new Elysia()
  // Public endpoints (no authentication required)
  // POST endpoint: Create feedback
  // Usage: POST /feedback/create with body { text: "Feedback text" }
  .post('/create', createFeedback, createFeedbackPayload)
  
  // GET endpoint: Get all feedback
  // Usage: GET /feedback/get-all
  .get('/get-all', getAllFeedback, getAllFeedbackPayload);

