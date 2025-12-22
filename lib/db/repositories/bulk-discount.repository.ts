import { Types } from 'mongoose'
import { BaseRepository, PaginationResult, PaginateOptions } from './base.repository'
import BulkDiscount, { IBulkDiscount, IDiscountTier } from '@/lib/db/models/BulkDiscount'
import { ExtendedModel } from '@/lib/db/types/model.types'

export interface BulkDiscountSearchFilters {
  search?: string
  isEnabled?: boolean
  isDefault?: boolean
}

export interface BulkDiscountListOptions extends PaginateOptions {
  filters?: BulkDiscountSearchFilters
}

class BulkDiscountRepository extends BaseRepository<IBulkDiscount> {
  constructor() {
    super(BulkDiscount as ExtendedModel<IBulkDiscount>)
  }

  /**
   * Build search query from filters
   */
  private buildSearchQuery(filters: BulkDiscountSearchFilters): Record<string, unknown> {
    const query: Record<string, unknown> = {
      deletedAt: null,
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ]
    }

    if (filters.isEnabled !== undefined) {
      query.isEnabled = filters.isEnabled
    }

    if (filters.isDefault !== undefined) {
      query.isDefault = filters.isDefault
    }

    return query
  }

  /**
   * List bulk discounts with pagination and filters
   */
  async list(options: BulkDiscountListOptions = {}): Promise<PaginationResult<IBulkDiscount>> {
    const { filters = {}, ...paginateOptions } = options

    const query = this.buildSearchQuery(filters)

    return this.paginate(query, {
      ...paginateOptions,
      select: paginateOptions.select || '-__v',
      sort: paginateOptions.sort || { priority: -1, createdAt: -1 },
    })
  }

  /**
   * Find bulk discount by UID
   */
  async findByUid(uid: string): Promise<IBulkDiscount | null> {
    return this.findOne({ uid, deletedAt: null })
  }

  /**
   * Find bulk discount by name
   */
  async findByName(name: string): Promise<IBulkDiscount | null> {
    return this.findOne({ name, deletedAt: null })
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
   * Create a new bulk discount with auto-generated ID
   */
  async createBulkDiscount(
    data: {
      name: string
      description?: string
      isDefault?: boolean
      tiers: IDiscountTier[]
      applicableCurrencies?: string[]
      applicableCountries?: string[]
      requiresVerification?: boolean
      minAccountAge?: number
      validFrom?: Date
      validUntil?: Date
      isEnabled?: boolean
      priority?: number
    },
    adminId?: Types.ObjectId
  ): Promise<IBulkDiscount> {
    await this.ensureConnection()

    const nextId = await this.getNextId()

    const bulkDiscount = new BulkDiscount({
      ...data,
      id: nextId,
      stats: {
        totalUses: 0,
        totalTokensSold: 0,
        totalDiscountGiven: 0,
      },
      createdBy: adminId,
      createdAt: new Date(),
    })

    return bulkDiscount.save()
  }

  /**
   * Update bulk discount
   */
  async updateBulkDiscount(
    id: string | Types.ObjectId,
    data: Partial<IBulkDiscount>,
    adminId?: Types.ObjectId
  ): Promise<IBulkDiscount | null> {
    return this.update(id, {
      ...data,
      updatedBy: adminId,
      updatedAt: new Date(),
    })
  }

  /**
   * Toggle enabled status
   */
  async toggleEnabled(
    id: string | Types.ObjectId,
    isEnabled: boolean,
    adminId?: Types.ObjectId
  ): Promise<IBulkDiscount | null> {
    return this.update(id, {
      isEnabled,
      updatedBy: adminId,
      updatedAt: new Date(),
    })
  }

  /**
   * Set as default discount
   */
  async setAsDefault(
    id: string | Types.ObjectId,
    adminId?: Types.ObjectId
  ): Promise<IBulkDiscount | null> {
    await this.ensureConnection()

    // Remove default from all other discounts
    await BulkDiscount.updateMany(
      { deletedAt: null },
      { isDefault: false, updatedAt: new Date() }
    )

    // Set this one as default
    return this.update(id, {
      isDefault: true,
      updatedBy: adminId,
      updatedAt: new Date(),
    })
  }

  /**
   * Get the default bulk discount
   */
  async getDefault(): Promise<IBulkDiscount | null> {
    return this.findOne({ isDefault: true, deletedAt: null })
  }

  /**
   * Get active bulk discounts sorted by priority
   */
  async getActiveBulkDiscounts(): Promise<IBulkDiscount[]> {
    const now = new Date()
    return this.find(
      {
        deletedAt: null,
        isEnabled: true,
        $or: [
          { validFrom: { $exists: false } },
          { validFrom: { $lte: now } },
        ],
        $and: [
          {
            $or: [
              { validUntil: { $exists: false } },
              { validUntil: { $gte: now } },
            ],
          },
        ],
      },
      { sort: { priority: -1 } }
    )
  }

  /**
   * Update tiers for a bulk discount
   */
  async updateTiers(
    id: string | Types.ObjectId,
    tiers: IDiscountTier[],
    adminId?: Types.ObjectId
  ): Promise<IBulkDiscount | null> {
    // Sort tiers by minTokens
    const sortedTiers = [...tiers].sort((a, b) => a.minTokens - b.minTokens)

    return this.update(id, {
      tiers: sortedTiers,
      updatedBy: adminId,
      updatedAt: new Date(),
    })
  }

  /**
   * Update priority
   */
  async updatePriority(
    id: string | Types.ObjectId,
    priority: number,
    adminId?: Types.ObjectId
  ): Promise<IBulkDiscount | null> {
    return this.update(id, {
      priority,
      updatedBy: adminId,
      updatedAt: new Date(),
    })
  }

  /**
   * Get bulk discounts by currency
   */
  async findByCurrency(currency: string): Promise<IBulkDiscount[]> {
    return this.find(
      {
        deletedAt: null,
        isEnabled: true,
        $or: [
          { applicableCurrencies: { $size: 0 } },
          { applicableCurrencies: { $exists: false } },
          { applicableCurrencies: currency.toUpperCase() },
        ],
      },
      { sort: { priority: -1 } }
    )
  }
}

export const bulkDiscountRepository = new BulkDiscountRepository()
