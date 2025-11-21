import { createGroup, createGroupPayload } from '@/controllers/Group.controller';
import { searchGroups, searchGroupsPayload } from '@/controllers/Group.controller';
import { getPublicGroups, getPublicGroupsPayload } from '@/controllers/Group.controller';
import { getMyGroups, getMyGroupsPayload } from '@/controllers/Group.controller';
import { getGroupById, getGroupByIdPayload } from '@/controllers/Group.controller';
import { getGroupFeed, getGroupFeedPayload } from '@/controllers/Group.controller';
import { joinGroup, joinGroupPayload } from '@/controllers/Group.controller';
import { leaveGroup, leaveGroupPayload } from '@/controllers/Group.controller';
import { deleteGroup, deleteGroupPayload } from '@/controllers/Group.controller';
import { getGroupMembers, getGroupMembersPayload } from '@/controllers/Group.controller';
import { makeAdmin, makeAdminPayload } from '@/controllers/Group.controller';
import { removeMember, removeMemberPayload } from '@/controllers/Group.controller';
import { getGroupCode, getGroupCodePayload } from '@/controllers/Group.controller';
import { updateDisplayName, updateDisplayNamePayload } from '@/controllers/Group.controller';
import { createMessage, createMessagePayload } from '@/controllers/Group.controller';
import { updateMessage, updateMessagePayload } from '@/controllers/Group.controller';
import { getTopMessage, getTopMessagePayload } from '@/controllers/Group.controller';
import { getAllMessages, getAllMessagesPayload } from '@/controllers/Group.controller';
import { authGuard, authResolve, authBeforeHandle } from '@/middleware/auth.middleware';
import Elysia from 'elysia';

export const groupRoutes = new Elysia()
  // Public endpoints (no authentication required)
  // GET endpoint: Search groups by name
  // Usage: GET /group/search?q=church
  .get('/search', searchGroups, searchGroupsPayload)
  
  // GET endpoint: Get all public groups
  // Usage: GET /group/public
  .get('/public', getPublicGroups, getPublicGroupsPayload)
  
  // GET endpoint: Get group by ID
  // Usage: GET /group/get/:id
  .get('/get/:id', getGroupById, getGroupByIdPayload)
  
  // Protected endpoints (authentication required)
  // Apply auth guard to all routes inside this guard block
  .guard(authGuard, (app) =>
    app
      // Resolve adds user to context (runs first)
      .resolve(authResolve)
      // BeforeHandle checks authentication (runs after resolve)
      .onBeforeHandle(authBeforeHandle)
      // POST endpoint: Create a new group
      // Usage: POST /group/create with body { name: "Group Name", description: "Description", isPublic: false }
      // Requires: Authorization header with Bearer token
      .post('/create', createGroup, createGroupPayload)
      
      // GET endpoint: Get user's groups
      // Usage: GET /group/my-groups
      // Requires: Authorization header with Bearer token
      .get('/my-groups', getMyGroups, getMyGroupsPayload)
      
      // GET endpoint: Get group feed (prayer requests)
      // Usage: GET /group/feed/:id
      // Requires: Authorization header with Bearer token
      .get('/feed/:id', getGroupFeed, getGroupFeedPayload)
      
      // POST endpoint: Join a group
      // Usage: POST /group/join/:id with body { code: "ABC123" } (optional if public)
      // Requires: Authorization header with Bearer token
      .post('/join/:id', joinGroup, joinGroupPayload)
      
      // POST endpoint: Leave a group
      // Usage: POST /group/leave/:id
      // Requires: Authorization header with Bearer token
      .post('/leave/:id', leaveGroup, leaveGroupPayload)
      
      // DELETE endpoint: Delete a group (owner only)
      // Usage: DELETE /group/delete/:id
      // Requires: Authorization header with Bearer token
      .delete('/delete/:id', deleteGroup, deleteGroupPayload)
      
      // GET endpoint: Get group members
      // Usage: GET /group/members/:id
      // Requires: Authorization header with Bearer token
      .get('/members/:id', getGroupMembers, getGroupMembersPayload)
      
      // POST endpoint: Make a member an admin (owner only)
      // Usage: POST /group/make-admin/:id with body { userId: "user_id" }
      // Requires: Authorization header with Bearer token
      .post('/make-admin/:id', makeAdmin, makeAdminPayload)
      
      // POST endpoint: Remove a member (owner/admin only)
      // Usage: POST /group/remove-member/:id with body { userId: "user_id" }
      // Requires: Authorization header with Bearer token
      .post('/remove-member/:id', removeMember, removeMemberPayload)
      
      // GET endpoint: Get group code (owner only)
      // Usage: GET /group/code/:id
      // Requires: Authorization header with Bearer token
      .get('/code/:id', getGroupCode, getGroupCodePayload)
      
      // PUT endpoint: Update group display name (owner/admin only)
      // Usage: PUT /group/update-display-name/:id with body { displayName: "Display Name" }
      // Requires: Authorization header with Bearer token
      .put('/update-display-name/:id', updateDisplayName, updateDisplayNamePayload)
      
      // POST endpoint: Create a group message (owner/admin only)
      // Usage: POST /group/message/:id with body { message: "Message text", isPinned: false }
      // Requires: Authorization header with Bearer token
      .post('/message/:id', createMessage, createMessagePayload)
      
      // PUT endpoint: Update a group message (owner/admin only)
      // Usage: PUT /group/message/:id/:messageId with body { message: "Updated message text" }
      // Requires: Authorization header with Bearer token
      .put('/message/:id/:messageId', updateMessage, updateMessagePayload)
      
      // GET endpoint: Get top message for a group
      // Usage: GET /group/message/top/:id
      // Requires: Authorization header with Bearer token (optional - could be public)
      .get('/message/top/:id', getTopMessage, getTopMessagePayload)
      
      // GET endpoint: Get all messages for a group (for future messages tab)
      // Usage: GET /group/message/all/:id
      // Requires: Authorization header with Bearer token (optional - could be public)
      .get('/message/all/:id', getAllMessages, getAllMessagesPayload)
  );

