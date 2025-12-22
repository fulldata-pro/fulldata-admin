import { Types } from 'mongoose'
import { BaseRepository, PaginationResult, PaginateOptions } from './base.repository'
import TokenPricing, { ITokenPricing, ITokenPackage } from '@/lib/db/models/TokenPricing'
import { ExtendedModel } from '@/lib/db/types/model.types'

export interface TokenPricingSearchFilters {
  countryCode?: string
  currency?: string
  isEnabled?: boolean
}

export interface TokenPricingListOptions extends PaginateOptions {
  filters?: TokenPricingSearchFilters
}

class TokenPricingRepository extends BaseRepository<ITokenPricing> {
  constructor() {
    super(TokenPricing as ExtendedModel<ITokenPricing>)
  }

  /**
   * Build search query from filters
   */
  private buildSearchQuery(filters: TokenPricingSearchFilters): Record<string, unknown> {
    const query: Record<string, unknown> = {
      deletedAt: null,
    }

    if (filters.countryCode) {
      query.countryCode = filters.countryCode.toUpperCase()
    }

    if (filters.currency) {
      query.currency = filters.currency.toUpperCase()
    }

    if (filters.isEnabled !== undefined) {
      query.isEnabled = filters.isEnabled
    }

    return query
  }

  /**
   * List token pricing with pagination and filters
   */
  async list(options: TokenPricingListOptions = {}): Promise<PaginationResult<ITokenPricing>> {
    const { filters = {}, ...paginateOptions } = options

    const query = this.buildSearchQuery(filters)

    return this.paginate(query, {
      ...paginateOptions,
      select: paginateOptions.select || '-__v -priceHistory',
      sort: paginateOptions.sort || { countryCode: 1 },
    })
  }

  /**
   * Get all active pricing configurations
   */
  async getAllActive(): Promise<ITokenPricing[]> {
    return this.find(
      { isEnabled: true, deletedAt: null },
      { sort: { countryCode: 1 }, select: '-__v -priceHistory' }
    )
  }

  /**
   * Find pricing by UID
   */
  async findByUid(uid: string): Promise<ITokenPricing | null> {
    return this.findOne({ uid, deletedAt: null })
  }

  /**
   * Find pricing by country code
   */
  async findByCountry(countryCode: string): Promise<ITokenPricing | null> {
    return this.findOne({
      countryCode: countryCode.toUpperCase(),
      isEnabled: true,
      deletedAt: null,
    })
  }

  /**
   * Find pricing by currency
   */
  async findByCurrency(currency: string): Promise<ITokenPricing[]> {
    return this.find({
      currency: currency.toUpperCase(),
      isEnabled: true,
      deletedAt: null,
    })
  }

  /**
   * Get pricing for country or fallback to GLOBAL/USD
   */
  async getOrDefault(countryCode: string): Promise<ITokenPricing | null> {
    // Try country-specific pricing first
    let pricing = await this.findByCountry(countryCode)

    // Fallback to GLOBAL
    if (!pricing) {
      pricing = await this.findByCountry('GLOBAL')
    }

    // Fallback to USD
    if (!pricing) {
      pricing = await this.findOne({
        currency: 'USD',
        isEnabled: true,
        deletedAt: null,
      })
    }

    return pricing
  }

  /**
   * Create new pricing configuration
   */
  async createPricing(data: {
    countryCode: string
    currency: string
    price: number
    minPurchase?: number
    maxPurchase?: number
    packages?: ITokenPackage[]
    createdBy?: Types.ObjectId
  }): Promise<ITokenPricing> {
    await this.ensureConnection()

    const nextId = await this.getNextId()

    const pricing = new TokenPricing({
      id: nextId,
      countryCode: data.countryCode.toUpperCase(),
      currency: data.currency.toUpperCase(),
      price: data.price,
      minPurchase: data.minPurchase ?? 100,
      maxPurchase: data.maxPurchase,
      packages: data.packages || [],
      isEnabled: true,
      createdBy: data.createdBy,
      createdAt: new Date(),
    })

    return pricing.save()
  }

  /**
   * Update token price with history tracking
   */
  async updatePrice(
    pricingId: string | Types.ObjectId,
    newPrice: number,
    adminId: Types.ObjectId,
    reason?: string
  ): Promise<ITokenPricing | null> {
    await this.ensureConnection()

    const pricing = await this.findById(pricingId)
    if (!pricing) return null

    // Add current price to history
    const historyEntry = {
      price: pricing.price,
      packagePrices: pricing.packages,
      validFrom: pricing.updatedAt || pricing.createdAt || new Date(),
      validUntil: new Date(),
      changedBy: adminId,
      changeReason: reason,
    }

    return TokenPricing.findByIdAndUpdate(
      pricingId,
      {
        $set: {
          price: newPrice,
          updatedBy: adminId,
          updatedAt: new Date(),
        },
        $push: {
          priceHistory: {
            $each: [historyEntry],
            $slice: -100, // Keep only last 100 changes
          },
        },
      },
      { new: true }
    )
  }

  /**
   * Toggle enabled status
   */
  async toggleEnabled(
    pricingId: string | Types.ObjectId,
    isEnabled: boolean,
    adminId?: Types.ObjectId
  ): Promise<ITokenPricing | null> {
    return this.update(pricingId, {
      isEnabled,
      updatedStatusAt: new Date(),
      updatedBy: adminId,
      updatedAt: new Date(),
    })
  }

  /**
   * Add package to pricing
   */
  async addPackage(
    pricingId: string | Types.ObjectId,
    packageData: ITokenPackage
  ): Promise<ITokenPricing | null> {
    await this.ensureConnection()

    return TokenPricing.findByIdAndUpdate(
      pricingId,
      {
        $push: { packages: packageData },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    )
  }

  /**
   * Remove package from pricing
   */
  async removePackage(
    pricingId: string | Types.ObjectId,
    packageId: string
  ): Promise<ITokenPricing | null> {
    await this.ensureConnection()

    return TokenPricing.findByIdAndUpdate(
      pricingId,
      {
        $pull: { packages: { id: packageId } },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    )
  }
}

export const tokenPricingRepository = new TokenPricingRepository()
