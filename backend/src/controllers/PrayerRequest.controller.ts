import { Context, Static, t } from 'elysia';
import { prayerRequestOperations } from '../dbOperations/prayerRequest.dbOps';
import { groupOperations } from '../dbOperations/group.dbOps';
import { Types } from 'mongoose';

// Helper function to sanitize anonymous requests in responses
// Keep userId for ownership checks, but remove user name/object for display
const sanitizePrayerRequest = (prayerRequest: any) => {
  if (!prayerRequest) return prayerRequest;
  
  const sanitized = prayerRequest.toObject ? prayerRequest.toObject() : { ...prayerRequest };
  
  if (sanitized.isAnonymous) {
    // Keep userId as string for ownership checks, but remove populated user object
    if (sanitized.userId && typeof sanitized.userId === 'object') {
      // Keep the _id but remove the user object
      sanitized.userId = sanitized.userId._id || sanitized.userId;
    }
  }
  
  return sanitized;
};

// ============================================================================
// POST endpoint: Create new prayer request
// ============================================================================

export const createPrayerRequestPayload = {
  body: t.Object({
    text: t.String(),
    isAnonymous: t.Optional(t.Boolean()),
    groupId: t.Optional(t.String()),
    isGroupOnly: t.Optional(t.Boolean()),
  }),
};

const createPrayerRequestType = t.Object(createPrayerRequestPayload);
type SetStatus = { status?: number | string | undefined };
export type CreatePrayerRequestContext = Omit<Context, 'body'> & Static<typeof createPrayerRequestType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const createPrayerRequest = async ({ set, body, user }: CreatePrayerRequestContext) => {
  if (!user || !user.userId) {
    set.status = 401;
    return {
      message: 'Unauthorized - user not found',
      data: null,
    };
  }

  const { text, isAnonymous, groupId, isGroupOnly } = body;

  try {
    // Validate group membership if groupId is provided
    let groupObjectId: Types.ObjectId | null = null;
    if (groupId) {
      groupObjectId = new Types.ObjectId(groupId);
      
      // Verify user is a member of the group
      const isMember = await groupOperations.isUserMember(groupId, user.userId);
      if (!isMember) {
        set.status = 403;
        return {
          message: 'You must be a member of this group to create prayer requests in it',
          data: null,
        };
      }
    }

    // If groupId is provided, isGroupOnly defaults to true unless explicitly set to false
    // If groupId is not provided, isGroupOnly must be false
    const finalIsGroupOnly = groupId ? (isGroupOnly !== false) : false;

    const prayerRequest = await prayerRequestOperations.createPrayerRequest({
      text,
      userId: user.userId,
      isAnonymous: isAnonymous || false,
      prayerCount: 0,
      groupId: groupObjectId,
      isGroupOnly: finalIsGroupOnly,
      reportCount: 0,
      status: 'active',
      reviewedBy: null,
      reviewedAt: null,
    });

    set.status = 201;
    return {
      message: 'Prayer request created successfully',
      data: sanitizePrayerRequest(prayerRequest),
    };
  } catch (error) {
    console.error('Error creating prayer request:', error);
    set.status = 500;
    return {
      message: 'Error creating prayer request',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// GET endpoint: Get all public prayer requests
// ============================================================================

export const getAllPrayerRequestsPayload = {};

const getAllPrayerRequestsType = t.Object(getAllPrayerRequestsPayload);
export type GetAllPrayerRequestsContext = Omit<Context, 'query'> & Static<typeof getAllPrayerRequestsType> & { set: SetStatus };

export const getAllPrayerRequests = async ({ set }: GetAllPrayerRequestsContext) => {
  try {
    const prayerRequests = await prayerRequestOperations.getAllPrayerRequests();
    
    // Sanitize anonymous requests
    const sanitized = prayerRequests.map(sanitizePrayerRequest);

    set.status = 200;
    return {
      message: 'Prayer requests retrieved successfully',
      data: sanitized,
    };
  } catch (error) {
    console.error('Error getting prayer requests:', error);
    set.status = 500;
    return {
      message: 'Error retrieving prayer requests',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// GET endpoint: Get prayer request by ID
// ============================================================================

export const getPrayerRequestByIdPayload = {
  params: t.Object({
    id: t.String(),
  }),
};

const getPrayerRequestByIdType = t.Object(getPrayerRequestByIdPayload);
export type GetPrayerRequestByIdContext = Omit<Context, 'params'> & Static<typeof getPrayerRequestByIdType> & { set: SetStatus };

export const getPrayerRequestById = async ({ set, params }: GetPrayerRequestByIdContext) => {
  const { id } = params;

  try {
    const prayerRequest = await prayerRequestOperations.getPrayerRequestById(id);
    
    if (!prayerRequest) {
      set.status = 404;
      return {
        message: 'Prayer request not found',
        data: null,
      };
    }

    set.status = 200;
    return {
      message: 'Prayer request retrieved successfully',
      data: sanitizePrayerRequest(prayerRequest),
    };
  } catch (error) {
    console.error('Error getting prayer request:', error);
    set.status = 500;
    return {
      message: 'Error retrieving prayer request',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// DELETE endpoint: Delete prayer request (only owner can delete)
// ============================================================================

export const deletePrayerRequestPayload = {
  params: t.Object({
    id: t.String(),
  }),
};

const deletePrayerRequestType = t.Object(deletePrayerRequestPayload);
export type DeletePrayerRequestContext = Omit<Context, 'params'> & Static<typeof deletePrayerRequestType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const deletePrayerRequest = async ({ set, params, user }: DeletePrayerRequestContext) => {
  if (!user || !user.userId) {
    set.status = 401;
    return {
      message: 'Unauthorized - user not found',
      data: null,
    };
  }

  const { id } = params;

  try {
    const deleted = await prayerRequestOperations.deletePrayerRequest(id, user.userId);

    if (!deleted) {
      set.status = 404;
      return {
        message: 'Prayer request not found or you do not have permission to delete it',
        data: null,
      };
    }

    set.status = 200;
    return {
      message: 'Prayer request deleted successfully',
      data: null,
    };
  } catch (error) {
    console.error('Error deleting prayer request:', error);
    set.status = 500;
    return {
      message: 'Error deleting prayer request',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// POST endpoint: Toggle prayer commitment
// ============================================================================

export const togglePrayerCommitmentPayload = {
  params: t.Object({
    id: t.String(),
  }),
};

const togglePrayerCommitmentType = t.Object(togglePrayerCommitmentPayload);
export type TogglePrayerCommitmentContext = Omit<Context, 'params'> & Static<typeof togglePrayerCommitmentType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const togglePrayerCommitment = async ({ set, params, user }: TogglePrayerCommitmentContext) => {
  if (!user || !user.userId) {
    set.status = 401;
    return {
      message: 'Unauthorized - user not found',
      data: null,
    };
  }

  const { id } = params;

  try {
    const result = await prayerRequestOperations.togglePrayerCommitment(id, user.userId);

    set.status = 200;
    return {
      message: result.committed ? 'Prayer commitment added' : 'Prayer commitment removed',
      data: result,
    };
  } catch (error) {
    console.error('Error toggling prayer commitment:', error);
    set.status = 500;
    return {
      message: 'Error toggling prayer commitment',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// GET endpoint: Check if user has committed to pray
// ============================================================================

export const checkPrayerCommitmentPayload = {
  params: t.Object({
    id: t.String(),
  }),
};

const checkPrayerCommitmentType = t.Object(checkPrayerCommitmentPayload);
export type CheckPrayerCommitmentContext = Omit<Context, 'params'> & Static<typeof checkPrayerCommitmentType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const checkPrayerCommitment = async ({ set, params, user }: CheckPrayerCommitmentContext) => {
  if (!user || !user.userId) {
    set.status = 401;
    return {
      message: 'Unauthorized - user not found',
      data: null,
    };
  }

  const { id } = params;

  try {
    const hasCommitted = await prayerRequestOperations.hasUserCommitted(id, user.userId);

    set.status = 200;
    return {
      message: 'Prayer commitment status retrieved',
      data: { hasCommitted },
    };
  } catch (error) {
    console.error('Error checking prayer commitment:', error);
    set.status = 500;
    return {
      message: 'Error checking prayer commitment',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// GET endpoint: Get user's prayer list (all requests they committed to)
// ============================================================================

export const getUserPrayerListPayload = {};

const getUserPrayerListType = t.Object(getUserPrayerListPayload);
export type GetUserPrayerListContext = Omit<Context, 'query'> & Static<typeof getUserPrayerListType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const getUserPrayerList = async ({ set, user }: GetUserPrayerListContext) => {
  if (!user || !user.userId) {
    set.status = 401;
    return {
      message: 'Unauthorized - user not found',
      data: null,
    };
  }

  try {
    const prayerRequests = await prayerRequestOperations.getUserPrayerList(user.userId);
    
    // Sanitize anonymous requests
    const sanitized = prayerRequests.map(sanitizePrayerRequest);

    set.status = 200;
    return {
      message: 'User prayer list retrieved successfully',
      data: sanitized,
    };
  } catch (error) {
    console.error('Error getting user prayer list:', error);
    set.status = 500;
    return {
      message: 'Error retrieving user prayer list',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

