import { Document, model, Model, Schema, Types } from 'mongoose';

// Define an interface describing the structure of the document.
export interface IGroupMember {
  groupId: Types.ObjectId;
  userId: Types.ObjectId;
  role: 'member' | 'admin';
  joinedAt?: Date;
}

// Extend the Document interface with our custom properties.
export interface IGroupMemberDocument extends IGroupMember, Document {}

// Define any custom instance methods here (if needed)
export interface IGroupMemberMethods {}

// Create a custom model type that includes custom properties and methods.
export type GroupMemberModelType = Model<IGroupMemberDocument, {}, IGroupMemberMethods>;

// Define the schema for the model.
const GroupMemberSchema = new Schema<IGroupMemberDocument, GroupMemberModelType, IGroupMemberMethods>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { 
      type: String, 
      enum: ['member', 'admin'], 
      default: 'member' 
    },
    joinedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false, // We only want joinedAt, not updatedAt
  }
);

// Unique compound index to prevent duplicate memberships
GroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

// Indexes for efficient queries
GroupMemberSchema.index({ groupId: 1 }); // Supports finding all members of a group
GroupMemberSchema.index({ userId: 1 }); // Supports finding all groups a user belongs to
GroupMemberSchema.index({ role: 1 }); // Supports filtering by role

// Create and export the model.
export const GroupMemberModel = model<IGroupMemberDocument, GroupMemberModelType>('GroupMember', GroupMemberSchema);

