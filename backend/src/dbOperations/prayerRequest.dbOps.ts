import { PrayerRequestModel, IPrayerRequest } from '../models/PrayerRequest.model';
import { PrayerCommitmentModel } from '../models/PrayerCommitment.model';
import { Types } from 'mongoose';
import { userOperations } from './user.dbOps';

export const prayerRequestOperations = {
  /**
   * Create a new prayer request
   */
  createPrayerRequest: async (prayerRequestData: IPrayerRequest) => {
    const prayerRequest = new PrayerRequestModel(prayerRequestData);
    return await prayerRequest.save();
  },

  /**
   * Get all public prayer requests (where groupId is null), sorted by createdAt descending (newest first)
   * 
   * Future: To support groups, change signature to:
   * getAllPrayerRequests: async (groupIds?: Types.ObjectId[]) => {
   *   const query: any = {};
   *   if (groupIds && groupIds.length > 0) {
   *     query.groupId = { $in: groupIds };
   *   } else {
   *     query.groupId = null; // Public only
   *   }
   *   return await PrayerRequestModel.find(query)...
   * }
   */
  getAllPrayerRequests: async () => {
    return await PrayerRequestModel.find({ groupId: null })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName')
      .exec();
  },

  /**
   * Get a single prayer request by ID
   */
  getPrayerRequestById: async (id: string) => {
    return await PrayerRequestModel.findById(id)
      .populate('userId', 'firstName lastName')
      .exec();
  },

  /**
   * Delete a prayer request (verify ownership)
   */
  deletePrayerRequest: async (id: string, userId: Types.ObjectId) => {
    const prayerRequest = await PrayerRequestModel.findOne({ _id: id, userId });
    if (!prayerRequest) {
      return null;
    }
    
    // Delete all commitments for this request
    await PrayerCommitmentModel.deleteMany({ prayerRequestId: id });
    
    // Delete the request
    return await PrayerRequestModel.findByIdAndDelete(id);
  },

  /**
   * Toggle prayer commitment - add if not exists, remove if exists (atomic operation)
   */
  togglePrayerCommitment: async (prayerRequestId: string, userId: Types.ObjectId) => {
    const existingCommitment = await PrayerCommitmentModel.findOne({
      prayerRequestId,
      userId,
    });

    if (existingCommitment) {
      // Remove commitment
      await PrayerCommitmentModel.deleteOne({ _id: existingCommitment._id });
      // Decrement prayer count
      await PrayerRequestModel.findByIdAndUpdate(
        prayerRequestId,
        { $inc: { prayerCount: -1 } },
        { new: true }
      );
      return { committed: false };
    } else {
      // Add commitment
      await PrayerCommitmentModel.create({
        prayerRequestId,
        userId,
      });
      // Increment prayer count
      await PrayerRequestModel.findByIdAndUpdate(
        prayerRequestId,
        { $inc: { prayerCount: 1 } },
        { new: true }
      );
      return { committed: true };
    }
  },

  /**
   * Check if user has committed to pray for a request
   */
  hasUserCommitted: async (prayerRequestId: string, userId: Types.ObjectId) => {
    const commitment = await PrayerCommitmentModel.findOne({
      prayerRequestId,
      userId,
    });
    return !!commitment;
  },

  /**
   * Get all prayer requests a user has committed to pray for
   * 
   * Note: This already works across ALL groups - it returns all requests the user
   * has committed to, regardless of which group(s) they belong to. This is the
   * desired behavior for the "My Prayer List" feature.
   * 
   * Future: If you want to filter by specific groups, you can add:
   * .populate({
   *   path: 'prayerRequestId',
   *   match: { groupId: { $in: userGroupIds } }, // Filter by user's groups
   *   ...
   * })
   * But the current implementation (all groups) is likely what you want.
   */
  getUserPrayerList: async (userId: Types.ObjectId) => {
    const commitments = await PrayerCommitmentModel.find({ userId })
      .populate({
        path: 'prayerRequestId',
        populate: [
          {
            path: 'userId',
            select: 'firstName lastName',
          },
          {
            path: 'groupId',
            select: 'name', // Populate group with name field (future: when Group model exists)
            // Note: This will work once Group model is created. For now, it will just return the ObjectId.
          },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();

    // Extract prayer requests from commitments
    return commitments
      .map((commitment) => commitment.prayerRequestId)
      .filter((pr) => pr !== null);
  },

  /**
   * Get user MongoDB _id from Stytch ID
   */
  getUserIdFromStytchId: async (stytchId: string): Promise<Types.ObjectId | null> => {
    const user = await userOperations.findUserByStytchId(stytchId);
    return user ? (user._id as Types.ObjectId) : null;
  },
};

