import { Document, model, Model, Schema } from 'mongoose';

// Define an interface describing the structure of the document.
export interface IExample {
  name: string;
  age: number;
  createdAt?: Date;
}

// Extend the Document interface with our custom properties.
export interface IExampleDocument extends IExample, Document {}

// Define any custom instance methods here (if needed)
export interface IExampleMethods {}

// Create a custom model type that includes custom properties and methods.
export type ExampleModelType = Model<IExampleDocument, {}, IExampleMethods>;

// Define the schema for the model.
const ExampleSchema = new Schema<IExampleDocument, ExampleModelType, IExampleMethods>({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Composite index for optimizing queries filtering/sorting by name and age.
ExampleSchema.index({ name: 1, age: 1 });

// Composite index for optimizing queries filtering/sorting by name and createdAt.
// Note the -1 for descending order on createdAt.
ExampleSchema.index({ name: 1, createdAt: -1 });

// Create and export the model.
export const ExampleModel = model<IExampleDocument, ExampleModelType>('Example', ExampleSchema);
