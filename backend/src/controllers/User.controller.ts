import { Context, Static, t } from 'elysia';
import { userOperations } from '../dbOperations/user.dbOps';

// ============================================================================
// GET endpoint: Get user by Stytch ID
// ============================================================================

export const getUserByStytchIdPayload = {
  query: t.Object({
    stytchId: t.String(),
  }),
};

const getUserByStytchIdType = t.Object(getUserByStytchIdPayload);
export type GetUserByStytchIdContext = Omit<Context, 'query'> & Static<typeof getUserByStytchIdType>;

export const getUserByStytchId = async ({ set, query }: GetUserByStytchIdContext) => {
  const { stytchId } = query;

  try {
    const user = await userOperations.findUserByStytchId(stytchId);
    
    if (!user) {
      set.status = 404;
      return {
        message: 'User not found',
        data: null,
      };
    }

    set.status = 200;
    return {
      message: 'User retrieved successfully',
      data: user,
    };
  } catch (error) {
    console.error('Error getting user:', error);
    set.status = 500;
    return {
      message: 'Error retrieving user',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// POST endpoint: Create new user
// ============================================================================

export const createUserPayload = {
  body: t.Object({
    stytchId: t.String(),
    firstName: t.Optional(t.String()),
    lastName: t.Optional(t.String()),
  }),
};

const createUserType = t.Object(createUserPayload);
export type CreateUserContext = Omit<Context, 'body'> & Static<typeof createUserType>;

export const createUser = async ({ set, body }: CreateUserContext) => {
  const { stytchId, firstName, lastName } = body;

  try {
    // Check if user already exists
    const existingUser = await userOperations.findUserByStytchId(stytchId);
    if (existingUser) {
      set.status = 409;
      return {
        message: 'User with this Stytch ID already exists',
        data: existingUser,
      };
    }

    const user = await userOperations.createUser({
      stytchId,
      firstName,
      lastName,
    });
    
    set.status = 201;
    return {
      message: 'User created successfully',
      data: user,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    set.status = 500;
    return {
      message: 'Error creating user',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// PUT endpoint: Update user by Stytch ID
// ============================================================================

export const updateUserPayload = {
  params: t.Object({
    stytchId: t.String(),
  }),
  body: t.Object({
    firstName: t.Optional(t.String()),
    lastName: t.Optional(t.String()),
  }),
};

const updateUserType = t.Object(updateUserPayload);
export type UpdateUserContext = Omit<Context, 'params' | 'body'> & Static<typeof updateUserType>;

export const updateUser = async ({ set, params, body }: UpdateUserContext) => {
  const { stytchId } = params;
  const { firstName, lastName } = body;

  try {
    const user = await userOperations.updateUserByStytchId(stytchId, {
      firstName,
      lastName,
    });

    if (!user) {
      set.status = 404;
      return {
        message: 'User not found',
        data: null,
      };
    }

    set.status = 200;
    return {
      message: 'User updated successfully',
      data: user,
    };
  } catch (error) {
    console.error('Error updating user:', error);
    set.status = 500;
    return {
      message: 'Error updating user',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

