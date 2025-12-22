import { Types, PopulateOptions } from 'mongoose'
import { BaseRepository, PaginationResult, PaginateOptions } from './base.repository'
import Account, { IAccount } from '@/lib/db/models/Account'
import { ExtendedModel } from '@/lib/db/types/model.types'
import { AccountStatusType } from '@/lib/constants'

export interface AccountSearchFilters {
  search?: string
  status?: AccountStatusType
}

export interface AccountListOptions extends PaginateOptions {
  filters?: AccountSearchFilters
}

class AccountRepository extends BaseRepository<IAccount> {
  constructor() {
    super(Account as ExtendedModel<IAccount>)
  }

  /**
   * Build search query from filters
   */
  private buildSearchQuery(filters: AccountSearchFilters): Record<string, unknown> {
    const query: Record<string, unknown> = {
      deletedAt: null,
    }

    if (filters.search) {
      query.$or = [
        { uid: { $regex: filters.search, $options: 'i' } },
        { name: { $regex: filters.search, $options: 'i' } },
        { 'billing.name': { $regex: filters.search, $options: 'i' } },
        { 'billing.taxId': { $regex: filters.search, $options: 'i' } },
      ]
    }

    if (filters.status) {
      query.status = filters.status
    }

    return query
  }

  /**
   * List accounts with pagination, search and filters
   */
  async list(options: AccountListOptions = {}): Promise<PaginationResult<IAccount>> {
    const { filters = {}, ...paginateOptions } = options

    const query = this.buildSearchQuery(filters)

    const defaultPopulate: PopulateOptions = {
      path: 'users.user',
      select: 'firstName lastName phone phoneCountryCode email -_id',
    }

    return this.paginate(query, {
      ...paginateOptions,
      populate: paginateOptions.populate || defaultPopulate,
      select: paginateOptions.select || '-__v',
      sort: paginateOptions.sort || { createdAt: -1 },
    })
  }

  /**
   * Find account by UID
   */
  async findByUid(uid: string): Promise<IAccount | null> {
    return this.findOne({ uid, deletedAt: null })
  }

  /**
   * Find account with all users populated
   */
  async findWithUsers(accountId: string | Types.ObjectId): Promise<IAccount | null> {
    return this.findById(accountId, {
      populate: {
        path: 'users.user',
        select: 'uid firstName lastName email phone phoneCountryCode avatar emailVerifiedAt phoneVerifiedAt',
      },
    })
  }

  /**
   * Find account with benefits populated
   */
  async findWithBenefits(accountId: string | Types.ObjectId): Promise<IAccount | null> {
    return this.findById(accountId, {
      populate: [
        {
          path: 'users.user',
          select: 'uid firstName lastName email phone phoneCountryCode avatar emailVerifiedAt phoneVerifiedAt',
        },
        {
          path: 'benefits.benefit',
          select: 'name code advantage isEnabled',
        },
      ],
    })
  }

  /**
   * Check if name already exists
   */
  async nameExists(name: string, excludeId?: string | Types.ObjectId): Promise<boolean> {
    const query: Record<string, unknown> = {
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      deletedAt: null,
    }
    if (excludeId) {
      query._id = { $ne: excludeId }
    }
    return this.exists(query)
  }

  /**
   * Find accounts by status
   */
  async findByStatus(status: AccountStatusType): Promise<IAccount[]> {
    return this.find({ status, deletedAt: null })
  }

  /**
   * Update account status
   */
  async updateStatus(
    accountId: string | Types.ObjectId,
    status: AccountStatusType
  ): Promise<IAccount | null> {
    return this.update(accountId, {
      status,
      updatedAt: new Date(),
    })
  }

  /**
   * Add user to account
   */
  async addUser(
    accountId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    role: string
  ): Promise<IAccount | null> {
    await this.ensureConnection()
    return this.model.findByIdAndUpdate(
      accountId,
      {
        $push: {
          users: {
            user: userId,
            role,
            addedAt: new Date(),
          },
        },
        updatedAt: new Date(),
      },
      { new: true }
    ).exec()
  }

  /**
   * Remove user from account
   */
  async removeUser(
    accountId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<IAccount | null> {
    await this.ensureConnection()
    return this.model.findByIdAndUpdate(
      accountId,
      {
        $pull: {
          users: { user: userId },
        },
        updatedAt: new Date(),
      },
      { new: true }
    ).exec()
  }

  /**
   * Check if user exists in account
   */
  async userExistsInAccount(
    accountId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<boolean> {
    const account = await this.findById(accountId)
    if (!account) return false
    return account.users.some((u) => u.user.toString() === userId.toString())
  }

  /**
   * Update service config
   */
  async updateServiceConfig(
    accountId: string | Types.ObjectId,
    serviceConfig: Partial<IAccount['serviceConfig']>
  ): Promise<IAccount | null> {
    return this.update(accountId, {
      $set: {
        serviceConfig,
        updatedAt: new Date(),
      },
    })
  }

  /**
   * Update billing info
   */
  async updateBilling(
    accountId: string | Types.ObjectId,
    billing: Partial<IAccount['billing']>
  ): Promise<IAccount | null> {
    return this.update(accountId, {
      $set: {
        billing,
        updatedAt: new Date(),
      },
    })
  }

  /**
   * Add benefit to account
   */
  async addBenefit(
    accountId: string | Types.ObjectId,
    benefitId: string | Types.ObjectId,
    expiresAt?: Date
  ): Promise<IAccount | null> {
    await this.ensureConnection()
    return this.model.findByIdAndUpdate(
      accountId,
      {
        $push: {
          benefits: {
            benefit: benefitId,
            appliedAt: new Date(),
            expiresAt,
          },
        },
        updatedAt: new Date(),
      },
      { new: true }
    ).exec()
  }

  /**
   * Remove benefit from account
   */
  async removeBenefit(
    accountId: string | Types.ObjectId,
    benefitId: string | Types.ObjectId
  ): Promise<IAccount | null> {
    await this.ensureConnection()
    return this.model.findByIdAndUpdate(
      accountId,
      {
        $pull: {
          benefits: { benefit: benefitId },
        },
        updatedAt: new Date(),
      },
      { new: true }
    ).exec()
  }
}

export const accountRepository = new AccountRepository()
