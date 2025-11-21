import { Document, model, Model, Schema, Types } from 'mongoose';

// Define an interface describing the structure of the document.
export interface IGroupMessage {
  groupId: Types.ObjectId;
  userId: Types.ObjectId; // Who posted the message
  message: string;
  isPinned: boolean; // For future pinning feature
  createdAt?: Date;
  updatedAt?: Date;
}

// Extend the Document interface with our custom properties.
export interface IGroupMessageDocument extends IGroupMessage, Document {}

// Define any custom instance methods here (if needed)
export interface IGroupMessageMethods {}

// Create a custom model type that includes custom properties and methods.
export type GroupMessageModelType = Model<IGroupMessageDocument, {}, IGroupMessageMethods>;

// Define the schema for the model.
const GroupMessageSchema = new Schema<IGroupMessageDocument, GroupMessageModelType, IGroupMessageMethods>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isPinned: { type: Boolean, default: false },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for efficient queries
GroupMessageSchema.index({ groupId: 1 }); // Supports finding all messages for a group
GroupMessageSchema.index({ groupId: 1, isPinned: 1 }); // Supports finding pinned messages
GroupMessageSchema.index({ groupId: 1, createdAt: -1 }); // Supports sorting by creation date

// Create and export the model.
export const GroupMessageModel = model<IGroupMessageDocument, GroupMessageModelType>('GroupMessage', GroupMessageSchema);

