/**
 * This is NOT a real controller. This is a template for how all controllers should be constructed to meet Elysia standards.
 * 
 * Controllers should:
 * 1. Define payload schemas using Elysia's type system (t.Object)
 * 2. Export both the payload and the controller function
 * 3. Use proper TypeScript types for context
 * 4. Handle errors appropriately with try/catch
 * 5. Set appropriate HTTP status codes
 * 6. Return consistent response formats
 */

import { Context, Static, t } from 'elysia';
// Import dbOperations from individual files (not from a single dbOperations.ts file)
// Each model should have its own dbOps file: dbOperations/user.dbOps.ts, dbOperations/design.dbOps.ts, etc.
// Example: import { exampleOperations } from '../../dbOperations/example.dbOps';
// Or import from the index: import { exampleOperations } from '../../dbOperations';

// ============================================================================
// Example 1: GET endpoint with query parameters
// ============================================================================

export const getExamplePayload = {
  query: t.Object({
    name: t.String(),
    age: t.Optional(t.Number()),
  }),
};

const getExampleType = t.Object(getExamplePayload);
export type GetExampleContext = Omit<Context, 'query'> & Static<typeof getExampleType>;

export const getExample = async ({ set, query }: GetExampleContext) => {
  const { name, age } = query;

  try {
    // Example: const example = await exampleOperations.findExampleByName(name);
    
    // Simulated response
    set.status = 200;
    return {
      message: 'Example retrieved successfully',
      data: { name, age },
    };
  } catch (error) {
    console.error('Error getting example:', error);
    set.status = 500;
    return {
      message: 'Error retrieving example',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// Example 2: POST endpoint with body parameters
// ============================================================================

export const createExamplePayload = {
  body: t.Object({
    name: t.String(),
    age: t.Number(),
  }),
};

const createExampleType = t.Object(createExamplePayload);
export type CreateExampleContext = Omit<Context, 'body'> & Static<typeof createExampleType>;

export const createExample = async ({ set, body }: CreateExampleContext) => {
  const { name, age } = body;

  try {
    // Example: const example = await exampleOperations.createExample({ name, age });
    
    set.status = 201;
    return {
      message: 'Example created successfully',
      data: { name, age },
    };
  } catch (error) {
    console.error('Error creating example:', error);
    set.status = 500;
    return {
      message: 'Error creating example',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// Example 3: PUT endpoint with URL params and body
// ============================================================================

export const updateExamplePayload = {
  params: t.Object({
    id: t.String(),
  }),
  body: t.Object({
    name: t.Optional(t.String()),
    age: t.Optional(t.Number()),
  }),
};

const updateExampleType = t.Object(updateExamplePayload);
export type UpdateExampleContext = Omit<Context, 'params' | 'body'> & Static<typeof updateExampleType>;

export const updateExample = async ({ set, params, body }: UpdateExampleContext) => {
  const { id } = params;
  const { name, age } = body;

  try {
    // Example: const example = await exampleOperations.updateExample(id, { name, age });
    
    set.status = 200;
    return {
      message: 'Example updated successfully',
      data: { id, name, age },
    };
  } catch (error) {
    console.error('Error updating example:', error);
    set.status = 500;
    return {
      message: 'Error updating example',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// Example 4: DELETE endpoint with URL params
// ============================================================================

export const deleteExamplePayload = {
  params: t.Object({
    id: t.String(),
  }),
};

const deleteExampleType = t.Object(deleteExamplePayload);
export type DeleteExampleContext = Omit<Context, 'params'> & Static<typeof deleteExampleType>;

export const deleteExample = async ({ set, params }: DeleteExampleContext) => {
  const { id } = params;

  try {
    // Example: await exampleOperations.deleteExample(id);
    
    set.status = 200;
    return {
      message: 'Example deleted successfully',
      data: { id },
    };
  } catch (error) {
    console.error('Error deleting example:', error);
    set.status = 500;
    return {
      message: 'Error deleting example',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

