import { UserModel, IUser } from '../models/User.model';

export const userOperations = {
  /**
   * Find a user by their Stytch ID
   */
  findUserByStytchId: async (stytchId: string) => {
    return await UserModel.findOne({ stytchId });
  },

  /**
   * Create a new user
   */
  createUser: async (userData: IUser) => {
    const user = new UserModel(userData);
    return await user.save();
  },

  /**
   * Update a user by their Stytch ID
   */
  updateUserByStytchId: async (stytchId: string, updates: Partial<IUser>) => {
    return await UserModel.findOneAndUpdate(
      { stytchId },
      { $set: updates },
      { new: true, runValidators: true }
    );
  },
};

