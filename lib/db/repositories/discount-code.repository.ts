import { Types } from 'mongoose'
import { BaseRepository, PaginationResult, PaginateOptions } from './base.repository'
import DiscountCode, { IDiscountCode } from '@/lib/db/models/DiscountCode'
import { ExtendedModel } from '@/lib/db/types/model.types'
import { DiscountTypeType } from '@/lib/constants/discount.constants'

export interface DiscountCodeSearchFilters {
  search?: string
  type?: DiscountTypeType
  isEnabled?: boolean
}

export interface DiscountCodeListOptions extends PaginateOptions {
  filters?: DiscountCodeSearchFilters
}

class DiscountCodeRepository extends BaseRepository<IDiscountCode> {
  constructor() {
    super(DiscountCode as ExtendedModel<IDiscountCode>)
  }

  /**
   * Build search query from filters
   */
  private buildSearchQuery(filters: DiscountCodeSearchFilters): Record<string, unknown> {
    const query: Record<string, unknown> = {
      deletedAt: null,
    }

    if (filters.search) {
      query.$or = [
        { code: { $regex: filters.search, $options: 'i' } },
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ]
    }

    if (filters.type) {
      query.type = filters.type
    }

    if (filters.isEnabled !== undefined) {
      query.isEnabled = filters.isEnabled
    }

    return query
  }

  /**
   * List discount codes with pagination and filters
   */
  async list(options: DiscountCodeListOptions = {}): Promise<PaginationResult<IDiscountCode>> {
    const { filters = {}, ...paginateOptions } = options

    const query = this.buildSearchQuery(filters)

    return this.paginate(query, {
      ...paginateOptions,
      select: paginateOptions.select || '-__v -usageHistory',
      sort: paginateOptions.sort || { createdAt: -1 },
    })
  }

  /**
   * Find discount code by code string
   */
  async findByCode(code: string): Promise<IDiscountCode | null> {
    return this.findOne({ code: code.toUpperCase(), deletedAt: null })
  }

  /**
   * Find discount code by UID
   */
  async findByUid(uid: string): Promise<IDiscountCode | null> {
    return this.findOne({ uid, deletedAt: null })
  }

  /**
   * Check if code already exists
   */
  async codeExists(code: string, excludeId?: string | Types.ObjectId): Promise<boolean> {
    const query: Record<string, unknown> = {
      code: code.toUpperCase(),
      deletedAt: null,
    }
    if (excludeId) {
      query._id = { $ne: excludeId }
    }
    return this.exists(query)
  }

  /**
   * Create a new discount code with auto-generated ID
   */
  async createDiscountCode(
    data: {
      code: string
      name: string
      description?: string
      type: DiscountTypeType
      value: number
      applicableCurrencies?: string[]
      minimumPurchase?: number
      maximumDiscount?: number
      maxUses?: number
      maxUsesPerAccount?: number
      validFrom?: Date
      validUntil?: Date
      requiresVerification?: boolean
      firstPurchaseOnly?: boolean
      isEnabled?: boolean
      termsAndConditions?: string
    },
    adminId?: Types.ObjectId
  ): Promise<IDiscountCode> {
    await this.ensureConnection()

    const nextId = await this.getNextId()

    const discountCode = new DiscountCode({
      ...data,
      id: nextId,
      code: data.code.toUpperCase(),
      currentUses: 0,
      usageHistory: [],
      createdBy: adminId,
      createdAt: new Date(),
    })

    return discountCode.save()
  }

  /**
   * Update discount code
   */
  async updateDiscountCode(
    id: string | Types.ObjectId,
    data: Partial<IDiscountCode>,
    adminId?: Types.ObjectId
  ): Promise<IDiscountCode | null> {
    const updateData: Record<string, unknown> = {
      ...data,
      updatedBy: adminId,
      updatedAt: new Date(),
    }

    // Ensure code is uppercase if being updated
    if (data.code) {
      updateData.code = data.code.toUpperCase()
    }

    return this.update(id, updateData)
  }

  /**
   * Toggle enabled status
   */
  async toggleEnabled(
    id: string | Types.ObjectId,
    isEnabled: boolean,
    adminId?: Types.ObjectId
  ): Promise<IDiscountCode | null> {
    return this.update(id, {
      isEnabled,
      updatedBy: adminId,
      updatedAt: new Date(),
    })
  }

  /**
   * Get active discount codes
   */
  async getActiveDiscountCodes(): Promise<IDiscountCode[]> {
    const now = new Date()
    return this.find({
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
        {
          $or: [
            { maxUses: { $exists: false } },
            { $expr: { $lt: ['$currentUses', '$maxUses'] } },
          ],
        },
      ],
    })
  }

  /**
   * Get discount codes by type
   */
  async findByType(type: DiscountTypeType): Promise<IDiscountCode[]> {
    return this.find(
      { type, deletedAt: null },
      { sort: { createdAt: -1 } }
    )
  }

  /**
   * Get usage statistics for a discount code
   */
  async getUsageStats(id: string | Types.ObjectId): Promise<{
    totalUses: number
    totalDiscount: number
    totalTokens: number
  }> {
    await this.ensureConnection()

    const result = await DiscountCode.aggregate([
      { $match: { _id: new Types.ObjectId(id.toString()) } },
      { $unwind: '$usageHistory' },
      {
        $group: {
          _id: '$_id',
          totalUses: { $sum: 1 },
          totalDiscount: { $sum: '$usageHistory.discountApplied' },
          totalTokens: { $sum: '$usageHistory.tokensAmount' },
        },
      },
    ])

    return result[0] || { totalUses: 0, totalDiscount: 0, totalTokens: 0 }
  }
}

export const discountCodeRepository = new DiscountCodeRepository()
