import { Types } from 'mongoose'
import { BaseRepository } from './base.repository'
import User, { IUser } from '@/lib/db/models/User'
import { ExtendedModel } from '@/lib/db/types/model.types'
import { AuthProvider, AuthProviderType } from '@/lib/constants'

export interface CreateUserData {
  email: string
  firstName: string
  lastName: string
  phone?: string
  phoneCountryCode?: string
  password?: string
  googleId?: string
  provider?: AuthProviderType
}

class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User as ExtendedModel<IUser>)
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({
      email: email.toLowerCase(),
      deletedAt: null,
    })
  }

  /**
   * Find user by UID
   */
  async findByUid(uid: string): Promise<IUser | null> {
    return this.findOne({ uid, deletedAt: null })
  }

  /**
   * Find user by Google ID
   */
  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return this.findOne({ googleId, deletedAt: null })
  }

  /**
   * Check if email already exists
   */
  async emailExists(email: string, excludeId?: string | Types.ObjectId): Promise<boolean> {
    const query: Record<string, unknown> = {
      email: email.toLowerCase(),
      deletedAt: null,
    }
    if (excludeId) {
      query._id = { $ne: excludeId }
    }
    return this.exists(query)
  }

  /**
   * Create user with normalized email
   */
  async createUser(data: CreateUserData): Promise<IUser> {
    return this.create({
      ...data,
      email: data.email.toLowerCase(),
      provider: data.provider || AuthProvider.LOCAL,
    })
  }

  /**
   * Add account to user
   */
  async addAccount(
    userId: string | Types.ObjectId,
    accountId: string | Types.ObjectId
  ): Promise<IUser | null> {
    await this.ensureConnection()
    return this.model.findByIdAndUpdate(
      userId,
      {
        $addToSet: { accounts: accountId },
        updatedAt: new Date(),
      },
      { new: true }
    ).exec()
  }

  /**
   * Remove account from user
   */
  async removeAccount(
    userId: string | Types.ObjectId,
    accountId: string | Types.ObjectId
  ): Promise<IUser | null> {
    await this.ensureConnection()
    return this.model.findByIdAndUpdate(
      userId,
      {
        $pull: { accounts: accountId },
        updatedAt: new Date(),
      },
      { new: true }
    ).exec()
  }

  /**
   * Update email verification
   */
  async verifyEmail(userId: string | Types.ObjectId): Promise<IUser | null> {
    return this.update(userId, {
      emailVerifiedAt: new Date(),
      updatedAt: new Date(),
    })
  }

  /**
   * Update phone verification
   */
  async verifyPhone(userId: string | Types.ObjectId): Promise<IUser | null> {
    return this.update(userId, {
      phoneVerifiedAt: new Date(),
      updatedAt: new Date(),
    })
  }

  /**
   * Find user with accounts populated
   */
  async findWithAccounts(userId: string | Types.ObjectId): Promise<IUser | null> {
    return this.findById(userId, {
      populate: {
        path: 'accounts',
        select: 'uid name status billing.name',
      },
    })
  }
}

export const userRepository = new UserRepository()
