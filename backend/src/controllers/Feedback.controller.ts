import { Context, Static, t } from 'elysia';
import { feedbackOperations } from '../dbOperations/feedback.dbOps';

// Helper type to ensure 'set' property is available in context types
type SetStatus = { status?: number | string | undefined };

// ============================================================================
// POST endpoint: Create feedback
// ============================================================================

export const createFeedbackPayload = {
  body: t.Object({
    text: t.String(),
  }),
};

const createFeedbackType = t.Object(createFeedbackPayload);
export type CreateFeedbackContext = Omit<Context, 'body'> & Static<typeof createFeedbackType> & { set: SetStatus };

export const createFeedback = async ({ set, body }: CreateFeedbackContext) => {
  const { text } = body;

  try {
    const feedback = await feedbackOperations.createFeedback({ text });
    
    set.status = 201;
    return {
      message: 'Feedback created successfully',
      data: feedback,
    };
  } catch (error) {
    console.error('Error creating feedback:', error);
    set.status = 500;
    return {
      message: 'Error creating feedback',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// GET endpoint: Get all feedback
// ============================================================================

export const getAllFeedbackPayload = {};

const getAllFeedbackType = t.Object(getAllFeedbackPayload);
export type GetAllFeedbackContext = Omit<Context, 'query'> & Static<typeof getAllFeedbackType> & { set: SetStatus };

export const getAllFeedback = async ({ set }: GetAllFeedbackContext) => {
  try {
    const feedback = await feedbackOperations.getAllFeedback();
    
    set.status = 200;
    return {
      message: 'Feedback retrieved successfully',
      data: feedback,
    };
  } catch (error) {
    console.error('Error getting feedback:', error);
    set.status = 500;
    return {
      message: 'Error retrieving feedback',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

