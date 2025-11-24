import { FeedbackModel, IFeedback } from '../models/Feedback.model';

export const feedbackOperations = {
  /**
   * Create a new feedback entry
   */
  createFeedback: async (feedbackData: IFeedback) => {
    const feedback = new FeedbackModel(feedbackData);
    return await feedback.save();
  },

  /**
   * Get all feedback entries sorted by createdAt descending (newest first)
   */
  getAllFeedback: async () => {
    return await FeedbackModel.find()
      .sort({ createdAt: -1 })
      .exec();
  },
};

