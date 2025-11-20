import { GroupModel, IGroup } from '../models/Group.model';
import { GroupMemberModel } from '../models/GroupMember.model';
import { PrayerRequestModel } from '../models/PrayerRequest.model';
import { Types } from 'mongoose';

/**
 * Generate a random alphanumeric code (6-8 characters)
 * Codes are normalized to uppercase for storage and validation
 */
const generateGroupCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = Math.floor(Math.random() * 3) + 6; // 6-8 characters
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code.toUpperCase(); // Normalize to uppercase
};

/**
 * Normalize code to uppercase for comparison
 */
const normalizeCode = (code: string): string => {
  return code.toUpperCase().trim();
};

export const groupOperations = {
  /**
   * Create a new group
   * Generates a code and enforces name uniqueness
   */
  createGroup: async (groupData: Omit<IGroup, 'code'>) => {
    // Check if name already exists
    const existingGroup = await GroupModel.findOne({ name: groupData.name });
    if (existingGroup) {
      throw new Error('Group name already exists');
    }

    // Generate unique code (not enforced to be unique, but try to avoid collisions)
    let code = generateGroupCode();
    let attempts = 0;
    while (attempts < 10) {
      const existingCode = await GroupModel.findOne({ code });
      if (!existingCode) break;
      code = generateGroupCode();
      attempts++;
    }

    const group = new GroupModel({
      ...groupData,
      code: normalizeCode(code),
    });
    const savedGroup = await group.save();
    
    // Automatically add owner as a member with admin role
    await GroupMemberModel.create({
      groupId: savedGroup._id,
      userId: groupData.ownerId,
      role: 'admin',
    });
    
    return savedGroup;
  },

  /**
   * Find a group by exact name
   */
  findGroupByName: async (name: string) => {
    return await GroupModel.findOne({ name }).populate('ownerId', 'firstName lastName').exec();
  },

  /**
   * Search groups by name (fuzzy/partial search)
   */
  searchGroups: async (searchTerm: string) => {
    const regex = new RegExp(searchTerm, 'i'); // Case-insensitive partial match
    return await GroupModel.find({ name: regex })
      .populate('ownerId', 'firstName lastName')
      .exec();
  },

  /**
   * Get all public groups
   */
  getPublicGroups: async () => {
    return await GroupModel.find({ isPublic: true })
      .populate('ownerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  },

  /**
   * Get a group by ID
   */
  getGroupById: async (groupId: string) => {
    return await GroupModel.findById(groupId)
      .populate('ownerId', 'firstName lastName')
      .exec();
  },

  /**
   * Join a group (validate code if private)
   */
  joinGroup: async (groupId: string, userId: Types.ObjectId, code?: string) => {
    const group = await GroupModel.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    // Check if already a member
    const existingMember = await GroupMemberModel.findOne({ groupId, userId });
    if (existingMember) {
      throw new Error('User is already a member of this group');
    }

    // Validate code if group is private
    if (!group.isPublic) {
      if (!code) {
        throw new Error('Code is required to join this group');
      }
      const normalizedCode = normalizeCode(code);
      if (normalizedCode !== group.code) {
        throw new Error('Invalid group code');
      }
    }

    // Add member
    const member = new GroupMemberModel({
      groupId,
      userId,
      role: 'member',
    });
    return await member.save();
  },

  /**
   * Leave a group
   */
  leaveGroup: async (groupId: string, userId: Types.ObjectId) => {
    const member = await GroupMemberModel.findOne({ groupId, userId });
    if (!member) {
      throw new Error('User is not a member of this group');
    }

    // Check if user is the owner
    const group = await GroupModel.findById(groupId);
    if (group && group.ownerId.toString() === userId.toString()) {
      throw new Error('Group owner cannot leave the group. Delete the group instead.');
    }

    return await GroupMemberModel.deleteOne({ _id: member._id });
  },

  /**
   * Get all groups a user belongs to
   */
  getUserGroups: async (userId: Types.ObjectId) => {
    const memberships = await GroupMemberModel.find({ userId })
      .populate({
        path: 'groupId',
        populate: {
          path: 'ownerId',
          select: 'firstName lastName',
        },
      })
      .sort({ joinedAt: -1 })
      .exec();

    return memberships
      .map((membership) => membership.groupId)
      .filter((group) => group !== null);
  },

  /**
   * Get all members of a group with their roles
   */
  getGroupMembers: async (groupId: string) => {
    return await GroupMemberModel.find({ groupId })
      .populate('userId', 'firstName lastName')
      .sort({ role: 1, joinedAt: 1 }) // Admins first, then by join date
      .exec();
  },

  /**
   * Check if user is a member of a group
   */
  isUserMember: async (groupId: string, userId: Types.ObjectId) => {
    const member = await GroupMemberModel.findOne({ groupId, userId });
    return !!member;
  },

  /**
   * Check if user is owner of a group
   */
  isUserOwner: async (groupId: string, userId: Types.ObjectId) => {
    const group = await GroupModel.findById(groupId);
    if (!group) return false;
    return group.ownerId.toString() === userId.toString();
  },

  /**
   * Check if user is admin of a group
   */
  isUserAdmin: async (groupId: string, userId: Types.ObjectId) => {
    const member = await GroupMemberModel.findOne({ groupId, userId });
    if (!member) return false;
    return member.role === 'admin';
  },

  /**
   * Check if user is owner or admin
   */
  isUserOwnerOrAdmin: async (groupId: string, userId: Types.ObjectId) => {
    const isOwner = await groupOperations.isUserOwner(groupId, userId);
    if (isOwner) return true;
    return await groupOperations.isUserAdmin(groupId, userId);
  },

  /**
   * Make a member an admin (owner only)
   */
  makeAdmin: async (groupId: string, targetUserId: Types.ObjectId, ownerId: Types.ObjectId) => {
    // Verify owner
    const isOwner = await groupOperations.isUserOwner(groupId, ownerId);
    if (!isOwner) {
      throw new Error('Only the group owner can make members admins');
    }

    // Verify target user is a member
    const member = await GroupMemberModel.findOne({ groupId, userId: targetUserId });
    if (!member) {
      throw new Error('User is not a member of this group');
    }

    // Update role
    member.role = 'admin';
    return await member.save();
  },

  /**
   * Remove a member from a group (owner/admin only)
   */
  removeMember: async (groupId: string, targetUserId: Types.ObjectId, requesterId: Types.ObjectId) => {
    // Verify requester is owner or admin
    const isAuthorized = await groupOperations.isUserOwnerOrAdmin(groupId, requesterId);
    if (!isAuthorized) {
      throw new Error('Only group owners and admins can remove members');
    }

    // Prevent removing the owner
    const isOwner = await groupOperations.isUserOwner(groupId, targetUserId);
    if (isOwner) {
      throw new Error('Cannot remove the group owner');
    }

    // Remove member
    const member = await GroupMemberModel.findOne({ groupId, userId: targetUserId });
    if (!member) {
      throw new Error('User is not a member of this group');
    }

    return await GroupMemberModel.deleteOne({ _id: member._id });
  },

  /**
   * Delete a group (owner only)
   * Also cleans up all memberships and prayer requests
   */
  deleteGroup: async (groupId: string, ownerId: Types.ObjectId) => {
    // Verify owner
    const isOwner = await groupOperations.isUserOwner(groupId, ownerId);
    if (!isOwner) {
      throw new Error('Only the group owner can delete the group');
    }

    // Delete all memberships
    await GroupMemberModel.deleteMany({ groupId });

    // Delete all prayer requests in this group
    await PrayerRequestModel.deleteMany({ groupId });

    // Delete the group
    return await GroupModel.findByIdAndDelete(groupId);
  },

  /**
   * Get group code (for display)
   */
  getGroupCode: async (groupId: string) => {
    const group = await GroupModel.findById(groupId).select('code').exec();
    return group?.code || null;
  },
};

