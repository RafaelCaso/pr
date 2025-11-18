import { Context, Static, t } from 'elysia';
import { userOperations } from '../dbOperations/user.dbOps';
import { Types } from 'mongoose';

type SetStatus = { status?: number | string | undefined };

// ============================================================================
// GET endpoint: Get current authenticated user
// ============================================================================

export const getUserPayload = {};

const getUserType = t.Object(getUserPayload);
export type GetUserContext = Omit<Context, 'query'> & Static<typeof getUserType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const getUser = async ({ set, user }: GetUserContext) => {
  if (!user) {
    set.status = 401;
    return {
      message: 'Unauthorized',
      data: null,
    };
  }

  try {
    const userDoc = await userOperations.findUserByStytchId(user.stytchId);
    
    if (!userDoc) {
      set.status = 404;
      return {
        message: 'User not found',
        data: null,
      };
    }

    set.status = 200;
    return {
      message: 'User retrieved successfully',
      data: userDoc,
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
export type CreateUserContext = Omit<Context, 'body'> & Static<typeof createUserType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const createUser = async ({ set, body, user: contextUser }: CreateUserContext) => {
  const { stytchId, firstName, lastName } = body;

  // Validate that the stytchId in body matches the authenticated user's stytchId
  if (!contextUser) {
    console.log('createUser: contextUser is undefined');
    set.status = 401;
    return {
      message: 'Unauthorized',
      data: null,
    };
  }

  console.log('createUser: contextUser.stytchId:', contextUser.stytchId, 'body.stytchId:', stytchId);

  if (contextUser.stytchId !== stytchId) {
    set.status = 403;
    return {
      message: 'Stytch ID in request body must match authenticated user',
      data: null,
    };
  }

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
// PUT endpoint: Update current authenticated user
// ============================================================================

export const updateUserPayload = {
  body: t.Object({
    firstName: t.Optional(t.String()),
    lastName: t.Optional(t.String()),
  }),
};

const updateUserType = t.Object(updateUserPayload);
export type UpdateUserContext = Omit<Context, 'body'> & Static<typeof updateUserType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const updateUser = async ({ set, body, user }: UpdateUserContext) => {
  if (!user || !user.userId) {
    set.status = 401;
    return {
      message: 'Unauthorized - user not found',
      data: null,
    };
  }

  const { firstName, lastName } = body;

  try {
    const userDoc = await userOperations.updateUserByStytchId(user.stytchId, {
      firstName,
      lastName,
    });

    if (!userDoc) {
      set.status = 404;
      return {
        message: 'User not found',
        data: null,
      };
    }

    set.status = 200;
    return {
      message: 'User updated successfully',
      data: userDoc,
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

