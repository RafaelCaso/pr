import { Context, Static, t } from 'elysia';
import { groupOperations } from '../dbOperations/group.dbOps';
import { groupMessageOperations } from '../dbOperations/groupMessage.dbOps';
import { prayerRequestOperations } from '../dbOperations/prayerRequest.dbOps';
import { Types } from 'mongoose';

// Helper type to ensure 'set' property is available in context types
type SetStatus = { status?: number | string | undefined };

// ============================================================================
// POST endpoint: Create a new group
// ============================================================================

export const createGroupPayload = {
  body: t.Object({
    name: t.String(),
    description: t.String(),
    isPublic: t.Optional(t.Boolean()),
  }),
};

const createGroupType = t.Object(createGroupPayload);
export type CreateGroupContext = Omit<Context, 'body'> & Static<typeof createGroupType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const createGroup = async ({ set, body, user }: CreateGroupContext) => {
  if (!user || !user.userId) {
    set.status = 401;
    return {
      message: 'Unauthorized - user not found',
      data: null,
    };
  }

  const { name, description, isPublic } = body;

  try {
    const group = await groupOperations.createGroup({
      name: name.trim(),
      description: description.trim(),
      isPublic: isPublic || false,
      ownerId: user.userId,
    });

    // Automatically add owner as a member with admin role
    // Note: Owner is not in GroupMember table, but we can add them if needed
    // For now, ownership is tracked via ownerId in Group model

    set.status = 201;
    return {
      message: 'Group created successfully',
      data: group,
    };
  } catch (error) {
    console.error('Error creating group:', error);
    set.status = error instanceof Error && error.message === 'Group name already exists' ? 409 : 500;
    return {
      message: error instanceof Error ? error.message : 'Error creating group',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// GET endpoint: Search groups by name (fuzzy search)
// ============================================================================

export const searchGroupsPayload = {
  query: t.Object({
    q: t.String(), // Search query
  }),
};

const searchGroupsType = t.Object(searchGroupsPayload);
export type SearchGroupsContext = Omit<Context, 'query'> & Static<typeof searchGroupsType> & { set: SetStatus };

export const searchGroups = async ({ set, query }: SearchGroupsContext) => {
  const { q } = query;

  try {
    const groups = await groupOperations.searchGroups(q);

    set.status = 200;
    return {
      message: 'Groups retrieved successfully',
      data: groups,
    };
  } catch (error) {
    console.error('Error searching groups:', error);
    set.status = 500;
    return {
      message: 'Error searching groups',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// GET endpoint: Get all public groups
// ============================================================================

export const getPublicGroupsPayload = {};

const getPublicGroupsType = t.Object(getPublicGroupsPayload);
export type GetPublicGroupsContext = Omit<Context, 'query'> & Static<typeof getPublicGroupsType> & { set: SetStatus };

export const getPublicGroups = async ({ set }: GetPublicGroupsContext) => {
  try {
    const groups = await groupOperations.getPublicGroups();

    set.status = 200;
    return {
      message: 'Public groups retrieved successfully',
      data: groups,
    };
  } catch (error) {
    console.error('Error getting public groups:', error);
    set.status = 500;
    return {
      message: 'Error retrieving public groups',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// GET endpoint: Get user's groups
// ============================================================================

export const getMyGroupsPayload = {};

const getMyGroupsType = t.Object(getMyGroupsPayload);
export type GetMyGroupsContext = Omit<Context, 'query'> & Static<typeof getMyGroupsType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const getMyGroups = async ({ set, user }: GetMyGroupsContext) => {
  if (!user || !user.userId) {
    set.status = 401;
    return {
      message: 'Unauthorized - user not found',
      data: null,
    };
  }

  try {
    const groups = await groupOperations.getUserGroups(user.userId);

    set.status = 200;
    return {
      message: 'User groups retrieved successfully',
      data: groups,
    };
  } catch (error) {
    console.error('Error getting user groups:', error);
    set.status = 500;
    return {
      message: 'Error retrieving user groups',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// GET endpoint: Get group by ID
// ============================================================================

export const getGroupByIdPayload = {
  params: t.Object({
    id: t.String(),
  }),
};

const getGroupByIdType = t.Object(getGroupByIdPayload);
export type GetGroupByIdContext = Omit<Context, 'params'> & Static<typeof getGroupByIdType> & { set: SetStatus };

export const getGroupById = async ({ set, params }: GetGroupByIdContext) => {
  const { id } = params;

  try {
    const group = await groupOperations.getGroupById(id);

    if (!group) {
      set.status = 404;
      return {
        message: 'Group not found',
        data: null,
      };
    }

    set.status = 200;
    return {
      message: 'Group retrieved successfully',
      data: group,
    };
  } catch (error) {
    console.error('Error getting group:', error);
    set.status = 500;
    return {
      message: 'Error retrieving group',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// GET endpoint: Get group feed (prayer requests for a group)
// ============================================================================

export const getGroupFeedPayload = {
  params: t.Object({
    id: t.String(),
  }),
};

const getGroupFeedType = t.Object(getGroupFeedPayload);
export type GetGroupFeedContext = Omit<Context, 'params'> & Static<typeof getGroupFeedType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const getGroupFeed = async ({ set, params, user }: GetGroupFeedContext) => {
  const { id } = params;

  try {
    // Check if user is a member (optional - could make this public)
    if (user && user.userId) {
      const isMember = await groupOperations.isUserMember(id, user.userId);
      if (!isMember) {
        set.status = 403;
        return {
          message: 'You must be a member of this group to view its feed',
          data: null,
        };
      }
    }

    const prayerRequests = await prayerRequestOperations.getGroupPrayerRequests(id);

    set.status = 200;
    return {
      message: 'Group feed retrieved successfully',
      data: prayerRequests,
    };
  } catch (error) {
    console.error('Error getting group feed:', error);
    set.status = 500;
    return {
      message: 'Error retrieving group feed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// POST endpoint: Join a group
// ============================================================================

export const joinGroupPayload = {
  params: t.Object({
    id: t.String(),
  }),
  body: t.Object({
    code: t.Optional(t.String()), // Required if group is private
  }),
};

const joinGroupType = t.Object(joinGroupPayload);
export type JoinGroupContext = Omit<Context, 'params' | 'body'> & Static<typeof joinGroupType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const joinGroup = async ({ set, params, body, user }: JoinGroupContext) => {
  if (!user || !user.userId) {
    set.status = 401;
    return {
      message: 'Unauthorized - user not found',
      data: null,
    };
  }

  const { id } = params;
  const { code } = body;

  try {
    await groupOperations.joinGroup(id, user.userId, code);

    set.status = 200;
    return {
      message: 'Successfully joined group',
      data: null,
    };
  } catch (error) {
    console.error('Error joining group:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    set.status = errorMessage.includes('already a member') ? 409 : 
                 errorMessage.includes('Code is required') || errorMessage.includes('Invalid group code') ? 400 : 500;
    return {
      message: errorMessage,
      error: errorMessage,
    };
  }
};

// ============================================================================
// POST endpoint: Leave a group
// ============================================================================

export const leaveGroupPayload = {
  params: t.Object({
    id: t.String(),
  }),
};

const leaveGroupType = t.Object(leaveGroupPayload);
export type LeaveGroupContext = Omit<Context, 'params'> & Static<typeof leaveGroupType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const leaveGroup = async ({ set, params, user }: LeaveGroupContext) => {
  if (!user || !user.userId) {
    set.status = 401;
    return {
      message: 'Unauthorized - user not found',
      data: null,
    };
  }

  const { id } = params;

  try {
    await groupOperations.leaveGroup(id, user.userId);

    set.status = 200;
    return {
      message: 'Successfully left group',
      data: null,
    };
  } catch (error) {
    console.error('Error leaving group:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    set.status = errorMessage.includes('not a member') ? 404 : 
                 errorMessage.includes('cannot leave') ? 400 : 500;
    return {
      message: errorMessage,
      error: errorMessage,
    };
  }
};

// ============================================================================
// DELETE endpoint: Delete a group (owner only)
// ============================================================================

export const deleteGroupPayload = {
  params: t.Object({
    id: t.String(),
  }),
};

const deleteGroupType = t.Object(deleteGroupPayload);
export type DeleteGroupContext = Omit<Context, 'params'> & Static<typeof deleteGroupType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const deleteGroup = async ({ set, params, user }: DeleteGroupContext) => {
  if (!user || !user.userId) {
    set.status = 401;
    return {
      message: 'Unauthorized - user not found',
      data: null,
    };
  }

  const { id } = params;

  try {
    await groupOperations.deleteGroup(id, user.userId);

    set.status = 200;
    return {
      message: 'Group deleted successfully',
      data: null,
    };
  } catch (error) {
    console.error('Error deleting group:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    set.status = errorMessage.includes('Only the group owner') ? 403 : 500;
    return {
      message: errorMessage,
      error: errorMessage,
    };
  }
};

// ============================================================================
// GET endpoint: Get group members
// ============================================================================

export const getGroupMembersPayload = {
  params: t.Object({
    id: t.String(),
  }),
};

const getGroupMembersType = t.Object(getGroupMembersPayload);
export type GetGroupMembersContext = Omit<Context, 'params'> & Static<typeof getGroupMembersType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const getGroupMembers = async ({ set, params, user }: GetGroupMembersContext) => {
  const { id } = params;

  try {
    // Check if user is a member (optional - could make this public for public groups)
    if (user && user.userId) {
      const isMember = await groupOperations.isUserMember(id, user.userId);
      if (!isMember) {
        set.status = 403;
        return {
          message: 'You must be a member of this group to view its members',
          data: null,
        };
      }
    }

    const members = await groupOperations.getGroupMembers(id);

    set.status = 200;
    return {
      message: 'Group members retrieved successfully',
      data: members,
    };
  } catch (error) {
    console.error('Error getting group members:', error);
    set.status = 500;
    return {
      message: 'Error retrieving group members',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// POST endpoint: Make a member an admin (owner only)
// ============================================================================

export const makeAdminPayload = {
  params: t.Object({
    id: t.String(), // Group ID
  }),
  body: t.Object({
    userId: t.String(), // User ID to make admin
  }),
};

const makeAdminType = t.Object(makeAdminPayload);
export type MakeAdminContext = Omit<Context, 'params' | 'body'> & Static<typeof makeAdminType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const makeAdmin = async ({ set, params, body, user }: MakeAdminContext) => {
  if (!user || !user.userId) {
    set.status = 401;
    return {
      message: 'Unauthorized - user not found',
      data: null,
    };
  }

  const { id } = params;
  const { userId } = body;

  try {
    const targetUserId = new Types.ObjectId(userId);
    await groupOperations.makeAdmin(id, targetUserId, user.userId);

    set.status = 200;
    return {
      message: 'Member promoted to admin successfully',
      data: null,
    };
  } catch (error) {
    console.error('Error making admin:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    set.status = errorMessage.includes('Only the group owner') ? 403 : 
                 errorMessage.includes('not a member') ? 404 : 500;
    return {
      message: errorMessage,
      error: errorMessage,
    };
  }
};

// ============================================================================
// POST endpoint: Remove a member from a group (owner/admin only)
// ============================================================================

export const removeMemberPayload = {
  params: t.Object({
    id: t.String(), // Group ID
  }),
  body: t.Object({
    userId: t.String(), // User ID to remove
  }),
};

const removeMemberType = t.Object(removeMemberPayload);
export type RemoveMemberContext = Omit<Context, 'params' | 'body'> & Static<typeof removeMemberType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const removeMember = async ({ set, params, body, user }: RemoveMemberContext) => {
  if (!user || !user.userId) {
    set.status = 401;
    return {
      message: 'Unauthorized - user not found',
      data: null,
    };
  }

  const { id } = params;
  const { userId } = body;

  try {
    const targetUserId = new Types.ObjectId(userId);
    await groupOperations.removeMember(id, targetUserId, user.userId);

    set.status = 200;
    return {
      message: 'Member removed successfully',
      data: null,
    };
  } catch (error) {
    console.error('Error removing member:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    set.status = errorMessage.includes('Only group owners and admins') ? 403 : 
                 errorMessage.includes('Cannot remove the group owner') ? 400 : 
                 errorMessage.includes('not a member') ? 404 : 500;
    return {
      message: errorMessage,
      error: errorMessage,
    };
  }
};

// ============================================================================
// GET endpoint: Get group code (for display)
// ============================================================================

export const getGroupCodePayload = {
  params: t.Object({
    id: t.String(),
  }),
};

const getGroupCodeType = t.Object(getGroupCodePayload);
export type GetGroupCodeContext = Omit<Context, 'params'> & Static<typeof getGroupCodeType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const getGroupCode = async ({ set, params, user }: GetGroupCodeContext) => {
  if (!user || !user.userId) {
    set.status = 401;
    return {
      message: 'Unauthorized - user not found',
      data: null,
    };
  }

  const { id } = params;

  try {
    // Only owner can get the code
    const isOwner = await groupOperations.isUserOwner(id, user.userId);
    if (!isOwner) {
      set.status = 403;
      return {
        message: 'Only the group owner can view the group code',
        data: null,
      };
    }

    const code = await groupOperations.getGroupCode(id);

    set.status = 200;
    return {
      message: 'Group code retrieved successfully',
      data: { code },
    };
  } catch (error) {
    console.error('Error getting group code:', error);
    set.status = 500;
    return {
      message: 'Error retrieving group code',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// PUT endpoint: Update group display name (owner/admin only)
// ============================================================================

export const updateDisplayNamePayload = {
  params: t.Object({
    id: t.String(),
  }),
  body: t.Object({
    displayName: t.String(),
  }),
};

const updateDisplayNameType = t.Object(updateDisplayNamePayload);
export type UpdateDisplayNameContext = Omit<Context, 'params' | 'body'> & Static<typeof updateDisplayNameType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const updateDisplayName = async ({ set, params, body, user }: UpdateDisplayNameContext) => {
  if (!user || !user.userId) {
    set.status = 401;
    return {
      message: 'Unauthorized - user not found',
      data: null,
    };
  }

  const { id } = params;
  const { displayName } = body;

  try {
    const group = await groupOperations.updateDisplayName(id, user.userId, displayName);

    set.status = 200;
    return {
      message: 'Display name updated successfully',
      data: group,
    };
  } catch (error) {
    console.error('Error updating display name:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    set.status = errorMessage.includes('Only group owners and admins') ? 403 : 
                 errorMessage.includes('Group not found') ? 404 : 500;
    return {
      message: errorMessage,
      error: errorMessage,
    };
  }
};

// ============================================================================
// POST endpoint: Create a group message (owner/admin only)
// ============================================================================

export const createMessagePayload = {
  params: t.Object({
    id: t.String(), // Group ID
  }),
  body: t.Object({
    message: t.String(),
    isPinned: t.Optional(t.Boolean()),
  }),
};

const createMessageType = t.Object(createMessagePayload);
export type CreateMessageContext = Omit<Context, 'params' | 'body'> & Static<typeof createMessageType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const createMessage = async ({ set, params, body, user }: CreateMessageContext) => {
  if (!user || !user.userId) {
    set.status = 401;
    return {
      message: 'Unauthorized - user not found',
      data: null,
    };
  }

  const { id } = params;
  const { message, isPinned } = body;

  try {
    const groupMessage = await groupMessageOperations.createMessage(
      id,
      user.userId,
      message,
      isPinned || false
    );

    // Re-fetch with population
    const populatedMessage = await groupMessageOperations.getMessageById(String(groupMessage._id));

    set.status = 201;
    return {
      message: 'Message created successfully',
      data: populatedMessage || groupMessage,
    };
  } catch (error) {
    console.error('Error creating message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    set.status = errorMessage.includes('Only group owners and admins') ? 403 : 500;
    return {
      message: errorMessage,
      error: errorMessage,
    };
  }
};

// ============================================================================
// PUT endpoint: Update a group message (owner/admin only)
// ============================================================================

export const updateMessagePayload = {
  params: t.Object({
    id: t.String(), // Group ID
    messageId: t.String(), // Message ID
  }),
  body: t.Object({
    message: t.String(),
  }),
};

const updateMessageType = t.Object(updateMessagePayload);
export type UpdateMessageContext = Omit<Context, 'params' | 'body'> & Static<typeof updateMessageType> & { user?: { stytchId: string; userId: Types.ObjectId | null }; set: SetStatus };

export const updateMessage = async ({ set, params, body, user }: UpdateMessageContext) => {
  if (!user || !user.userId) {
    set.status = 401;
    return {
      message: 'Unauthorized - user not found',
      data: null,
    };
  }

  const { id, messageId } = params;
  const { message } = body;

  try {
    const groupMessage = await groupMessageOperations.updateMessage(
      messageId,
      user.userId,
      message
    );

    // Re-fetch with population
    const populatedMessage = await groupMessageOperations.getMessageById(messageId);

    set.status = 200;
    return {
      message: 'Message updated successfully',
      data: populatedMessage || groupMessage,
    };
  } catch (error) {
    console.error('Error updating message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    set.status = errorMessage.includes('Only group owners and admins') ? 403 : 
                 errorMessage.includes('Message not found') ? 404 : 500;
    return {
      message: errorMessage,
      error: errorMessage,
    };
  }
};

// ============================================================================
// GET endpoint: Get top message for a group
// ============================================================================

export const getTopMessagePayload = {
  params: t.Object({
    id: t.String(),
  }),
};

const getTopMessageType = t.Object(getTopMessagePayload);
export type GetTopMessageContext = Omit<Context, 'params'> & Static<typeof getTopMessageType> & { set: SetStatus };

export const getTopMessage = async ({ set, params }: GetTopMessageContext) => {
  const { id } = params;

  try {
    const message = await groupMessageOperations.getTopMessage(id);

    set.status = 200;
    return {
      message: 'Top message retrieved successfully',
      data: message,
    };
  } catch (error) {
    console.error('Error getting top message:', error);
    set.status = 500;
    return {
      message: 'Error retrieving top message',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// GET endpoint: Get all messages for a group (for future messages tab)
// ============================================================================

export const getAllMessagesPayload = {
  params: t.Object({
    id: t.String(),
  }),
};

const getAllMessagesType = t.Object(getAllMessagesPayload);
export type GetAllMessagesContext = Omit<Context, 'params'> & Static<typeof getAllMessagesType> & { set: SetStatus };

export const getAllMessages = async ({ set, params }: GetAllMessagesContext) => {
  const { id } = params;

  try {
    const messages = await groupMessageOperations.getAllMessages(id);

    set.status = 200;
    return {
      message: 'Messages retrieved successfully',
      data: messages,
    };
  } catch (error) {
    console.error('Error getting messages:', error);
    set.status = 500;
    return {
      message: 'Error retrieving messages',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

