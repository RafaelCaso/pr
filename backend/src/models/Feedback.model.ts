import { Document, model, Model, Schema } from 'mongoose';

// Define an interface describing the structure of the document.
export interface IFeedback {
  text: string;
  createdAt?: Date;
}

// Extend the Document interface with our custom properties.
export interface IFeedbackDocument extends IFeedback, Document {}

// Define any custom instance methods here (if needed)
export interface IFeedbackMethods {}

// Create a custom model type that includes custom properties and methods.
export type FeedbackModelType = Model<IFeedbackDocument, {}, IFeedbackMethods>;

// Define the schema for the model.
const FeedbackSchema = new Schema<IFeedbackDocument, FeedbackModelType, IFeedbackMethods>({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Index for optimizing queries sorting by createdAt.
FeedbackSchema.index({ createdAt: -1 });

// Create and export the model.
export const FeedbackModel = model<IFeedbackDocument, FeedbackModelType>('Feedback', FeedbackSchema);

