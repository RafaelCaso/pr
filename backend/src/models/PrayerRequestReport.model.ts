import { Document, model, Model, Schema, Types } from 'mongoose';

// Define an interface describing the structure of the document.
export interface IPrayerRequestReport {
  prayerRequestId: Types.ObjectId;
  reportedBy: Types.ObjectId;
  reason?: string;
  createdAt?: Date;
}

// Extend the Document interface with our custom properties.
export interface IPrayerRequestReportDocument extends IPrayerRequestReport, Document {}

// Define any custom instance methods here (if needed)
export interface IPrayerRequestReportMethods {}

// Create a custom model type that includes custom properties and methods.
export type PrayerRequestReportModelType = Model<IPrayerRequestReportDocument, {}, IPrayerRequestReportMethods>;

// Define the schema for the model.
const PrayerRequestReportSchema = new Schema<IPrayerRequestReportDocument, PrayerRequestReportModelType, IPrayerRequestReportMethods>(
  {
    prayerRequestId: { type: Schema.Types.ObjectId, ref: 'PrayerRequest', required: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: false },
  },
  {
    timestamps: false, // We only want createdAt, not updatedAt
  }
);

// Unique compound index to prevent duplicate reports from same user
PrayerRequestReportSchema.index({ prayerRequestId: 1, reportedBy: 1 }, { unique: true });

// Create and export the model.
export const PrayerRequestReportModel = model<IPrayerRequestReportDocument, PrayerRequestReportModelType>('PrayerRequestReport', PrayerRequestReportSchema);

