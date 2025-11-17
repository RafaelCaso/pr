import { Context, Static, t } from 'elysia';
import { prayerRequestOperations } from '../dbOperations/prayerRequest.dbOps';
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
    stytchId: t.String(),
    text: t.String(),
    isAnonymous: t.Optional(t.Boolean()),
  }),
};

const createPrayerRequestType = t.Object(createPrayerRequestPayload);
export type CreatePrayerRequestContext = Omit<Context, 'body'> & Static<typeof createPrayerRequestType>;

export const createPrayerRequest = async ({ set, body }: CreatePrayerRequestContext) => {
  const { stytchId, text, isAnonymous } = body;

  try {
    // Get user MongoDB _id from Stytch ID
    const userId = await prayerRequestOperations.getUserIdFromStytchId(stytchId);
    if (!userId) {
      set.status = 404;
      return {
        message: 'User not found',
        data: null,
      };
    }

    const prayerRequest = await prayerRequestOperations.createPrayerRequest({
      text,
      userId,
      isAnonymous: isAnonymous || false,
      prayerCount: 0,
      groupId: null,
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
export type GetAllPrayerRequestsContext = Omit<Context, 'query'> & Static<typeof getAllPrayerRequestsType>;

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
export type GetPrayerRequestByIdContext = Omit<Context, 'params'> & Static<typeof getPrayerRequestByIdType>;

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
  body: t.Object({
    stytchId: t.String(),
  }),
};

const deletePrayerRequestType = t.Object(deletePrayerRequestPayload);
export type DeletePrayerRequestContext = Omit<Context, 'params' | 'body'> & Static<typeof deletePrayerRequestType>;

export const deletePrayerRequest = async ({ set, params, body }: DeletePrayerRequestContext) => {
  const { id } = params;
  const { stytchId } = body;

  try {
    // Get user MongoDB _id from Stytch ID
    const userId = await prayerRequestOperations.getUserIdFromStytchId(stytchId);
    if (!userId) {
      set.status = 404;
      return {
        message: 'User not found',
        data: null,
      };
    }

    const deleted = await prayerRequestOperations.deletePrayerRequest(id, userId);

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
  body: t.Object({
    stytchId: t.String(),
  }),
};

const togglePrayerCommitmentType = t.Object(togglePrayerCommitmentPayload);
export type TogglePrayerCommitmentContext = Omit<Context, 'params' | 'body'> & Static<typeof togglePrayerCommitmentType>;

export const togglePrayerCommitment = async ({ set, params, body }: TogglePrayerCommitmentContext) => {
  const { id } = params;
  const { stytchId } = body;

  try {
    // Get user MongoDB _id from Stytch ID
    const userId = await prayerRequestOperations.getUserIdFromStytchId(stytchId);
    if (!userId) {
      set.status = 404;
      return {
        message: 'User not found',
        data: null,
      };
    }

    const result = await prayerRequestOperations.togglePrayerCommitment(id, userId);

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
  query: t.Object({
    stytchId: t.String(),
  }),
};

const checkPrayerCommitmentType = t.Object(checkPrayerCommitmentPayload);
export type CheckPrayerCommitmentContext = Omit<Context, 'params' | 'query'> & Static<typeof checkPrayerCommitmentType>;

export const checkPrayerCommitment = async ({ set, params, query }: CheckPrayerCommitmentContext) => {
  const { id } = params;
  const { stytchId } = query;

  try {
    // Get user MongoDB _id from Stytch ID
    const userId = await prayerRequestOperations.getUserIdFromStytchId(stytchId);
    if (!userId) {
      set.status = 404;
      return {
        message: 'User not found',
        data: null,
      };
    }

    const hasCommitted = await prayerRequestOperations.hasUserCommitted(id, userId);

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

export const getUserPrayerListPayload = {
  query: t.Object({
    stytchId: t.String(),
  }),
};

const getUserPrayerListType = t.Object(getUserPrayerListPayload);
export type GetUserPrayerListContext = Omit<Context, 'query'> & Static<typeof getUserPrayerListType>;

export const getUserPrayerList = async ({ set, query }: GetUserPrayerListContext) => {
  const { stytchId } = query;

  try {
    // Get user MongoDB _id from Stytch ID
    const userId = await prayerRequestOperations.getUserIdFromStytchId(stytchId);
    if (!userId) {
      set.status = 404;
      return {
        message: 'User not found',
        data: null,
      };
    }

    const prayerRequests = await prayerRequestOperations.getUserPrayerList(userId);
    
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

