import { Document, model, Model, Schema, Types } from 'mongoose';

// Define an interface describing the structure of the document.
export interface IPrayerCommitment {
  prayerRequestId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt?: Date;
}

// Extend the Document interface with our custom properties.
export interface IPrayerCommitmentDocument extends IPrayerCommitment, Document {}

// Define any custom instance methods here (if needed)
export interface IPrayerCommitmentMethods {}

// Create a custom model type that includes custom properties and methods.
export type PrayerCommitmentModelType = Model<IPrayerCommitmentDocument, {}, IPrayerCommitmentMethods>;

// Define the schema for the model.
const PrayerCommitmentSchema = new Schema<IPrayerCommitmentDocument, PrayerCommitmentModelType, IPrayerCommitmentMethods>(
  {
    prayerRequestId: { type: Schema.Types.ObjectId, ref: 'PrayerRequest', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: false, // We only want createdAt, not updatedAt
  }
);

// Unique compound index to prevent duplicate commitments
PrayerCommitmentSchema.index({ prayerRequestId: 1, userId: 1 }, { unique: true });

// Create and export the model.
export const PrayerCommitmentModel = model<IPrayerCommitmentDocument, PrayerCommitmentModelType>('PrayerCommitment', PrayerCommitmentSchema);

