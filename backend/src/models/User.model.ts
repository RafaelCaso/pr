import { Document, model, Model, Schema } from 'mongoose';

// Define an interface describing the structure of the document.
export interface IUser {
  stytchId: string;
  firstName?: string;
  lastName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Extend the Document interface with our custom properties.
export interface IUserDocument extends IUser, Document {}

// Define any custom instance methods here (if needed)
export interface IUserMethods {}

// Create a custom model type that includes custom properties and methods.
export type UserModelType = Model<IUserDocument, {}, IUserMethods>;

// Define the schema for the model.
const UserSchema = new Schema<IUserDocument, UserModelType, IUserMethods>(
  {
    stytchId: { type: String, required: true, unique: true },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create and export the model.
export const UserModel = model<IUserDocument, UserModelType>('User', UserSchema);

