import { GroupMessageModel, IGroupMessage } from '../models/GroupMessage.model';
import { groupOperations } from './group.dbOps';
import { Types } from 'mongoose';

export const groupMessageOperations = {
  /**
   * Create a new group message
   * Verifies requester is owner or admin
   */
  createMessage: async (groupId: string, userId: Types.ObjectId, message: string, isPinned: boolean = false) => {
    // Verify requester is owner or admin
    const isAuthorized = await groupOperations.isUserOwnerOrAdmin(groupId, userId);
    if (!isAuthorized) {
      throw new Error('Only group owners and admins can create messages');
    }

    const groupMessage = new GroupMessageModel({
      groupId,
      userId,
      message: message.trim(),
      isPinned,
    });

    return await groupMessage.save();
  },

  /**
   * Update an existing group message
   * Verifies requester is owner or admin
   */
  updateMessage: async (messageId: string, userId: Types.ObjectId, message: string) => {
    const groupMessage = await GroupMessageModel.findById(messageId);
    if (!groupMessage) {
      throw new Error('Message not found');
    }

    // Verify requester is owner or admin
    const isAuthorized = await groupOperations.isUserOwnerOrAdmin(
      groupMessage.groupId.toString(),
      userId
    );
    if (!isAuthorized) {
      throw new Error('Only group owners and admins can update messages');
    }

    groupMessage.message = message.trim();
    return await groupMessage.save();
  },

  /**
   * Get the top message for a group
   * Returns the most recent pinned message, or most recent message if none pinned
   * Returns null if no messages exist
   */
  getTopMessage: async (groupId: string) => {
    // First try to find the most recent pinned message
    const pinnedMessage = await GroupMessageModel.findOne({ groupId, isPinned: true })
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();

    if (pinnedMessage) {
      return pinnedMessage;
    }

    // If no pinned message, return the most recent message
    const recentMessage = await GroupMessageModel.findOne({ groupId })
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();

    return recentMessage || null;
  },

  /**
   * Get a message by ID with population
   */
  getMessageById: async (messageId: string) => {
    return await GroupMessageModel.findById(messageId)
      .populate('userId', 'firstName lastName')
      .exec();
  },

  /**
   * Get all messages for a group (for future messages tab)
   * Sorted by pinned first, then by createdAt desc
   */
  getAllMessages: async (groupId: string) => {
    return await GroupMessageModel.find({ groupId })
      .populate('userId', 'firstName lastName')
      .sort({ isPinned: -1, createdAt: -1 }) // Pinned first, then by creation date desc
      .exec();
  },

  /**
   * Delete a group message (for future)
   * Verifies requester is owner or admin
   */
  deleteMessage: async (messageId: string, userId: Types.ObjectId) => {
    const groupMessage = await GroupMessageModel.findById(messageId);
    if (!groupMessage) {
      throw new Error('Message not found');
    }

    // Verify requester is owner or admin
    const isAuthorized = await groupOperations.isUserOwnerOrAdmin(
      groupMessage.groupId.toString(),
      userId
    );
    if (!isAuthorized) {
      throw new Error('Only group owners and admins can delete messages');
    }

    return await GroupMessageModel.findByIdAndDelete(messageId);
  },
};

