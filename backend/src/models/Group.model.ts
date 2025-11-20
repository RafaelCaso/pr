import { Document, model, Model, Schema, Types } from 'mongoose';

// Define an interface describing the structure of the document.
export interface IGroup {
  name: string;
  description: string;
  code: string; // 6-8 character alphanumeric code, stored normalized (uppercase)
  isPublic: boolean;
  ownerId: Types.ObjectId;
  imageUrl?: string; // Placeholder for future S3 bucket integration
  createdAt?: Date;
  updatedAt?: Date;
}

// Extend the Document interface with our custom properties.
export interface IGroupDocument extends IGroup, Document {}

// Define any custom instance methods here (if needed)
export interface IGroupMethods {}

// Create a custom model type that includes custom properties and methods.
export type GroupModelType = Model<IGroupDocument, {}, IGroupMethods>;

// Define the schema for the model.
const GroupSchema = new Schema<IGroupDocument, GroupModelType, IGroupMethods>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    code: { type: String, required: true }, // 6-8 alphanumeric, normalized to uppercase
    isPublic: { type: Boolean, default: false },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String, required: false }, // Future: S3 bucket integration
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for efficient queries
GroupSchema.index({ code: 1 }); // Supports code lookups
GroupSchema.index({ isPublic: 1 }); // Supports filtering public groups
GroupSchema.index({ ownerId: 1 }); // Supports finding groups by owner

// Create and export the model.
export const GroupModel = model<IGroupDocument, GroupModelType>('Group', GroupSchema);

