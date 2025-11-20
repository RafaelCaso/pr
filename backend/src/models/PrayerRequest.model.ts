import { Document, model, Model, Schema, Types } from 'mongoose';

// Define an interface describing the structure of the document.
export interface IPrayerRequest {
  text: string;
  userId: Types.ObjectId;
  isAnonymous: boolean;
  prayerCount: number;
  groupId?: Types.ObjectId | null;
  isGroupOnly: boolean;
  reportCount: number;
  status: 'active' | 'under_review' | 'reviewed';
  reviewedBy?: Types.ObjectId | null;
  reviewedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Extend the Document interface with our custom properties.
export interface IPrayerRequestDocument extends IPrayerRequest, Document {}

// Define any custom instance methods here (if needed)
export interface IPrayerRequestMethods {}

// Create a custom model type that includes custom properties and methods.
export type PrayerRequestModelType = Model<IPrayerRequestDocument, {}, IPrayerRequestMethods>;

// Define the schema for the model.
const PrayerRequestSchema = new Schema<IPrayerRequestDocument, PrayerRequestModelType, IPrayerRequestMethods>(
  {
    text: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isAnonymous: { type: Boolean, default: false },
    prayerCount: { type: Number, default: 0 },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: false, default: null },
    isGroupOnly: { type: Boolean, default: false },
    reportCount: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['active', 'under_review', 'reviewed'], 
      default: 'active' 
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    reviewedAt: { type: Date, required: false, default: null },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for efficient queries
PrayerRequestSchema.index({ groupId: 1 }); // Supports filtering by single group
PrayerRequestSchema.index({ createdAt: -1 }); // Supports sorting by date
PrayerRequestSchema.index({ status: 1 }); // Supports filtering by status
// Note: For multi-group queries (groupId: { $in: [...] }), the groupId index will be used efficiently

// Create and export the model.
export const PrayerRequestModel = model<IPrayerRequestDocument, PrayerRequestModelType>('PrayerRequest', PrayerRequestSchema);

