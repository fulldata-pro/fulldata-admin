import { BaseRepository, PaginationResult, PaginateOptions } from './base.repository'
import PaymentMethod, { IPaymentMethod } from '@/lib/db/models/PaymentMethod'
import { ExtendedModel } from '@/lib/db/types/model.types'

export interface PaymentMethodSearchFilters {
  currency?: string
  type?: string
  isEnabled?: boolean
}

export interface PaymentMethodListOptions extends PaginateOptions {
  filters?: PaymentMethodSearchFilters
}

class PaymentMethodRepository extends BaseRepository<IPaymentMethod> {
  constructor() {
    super(PaymentMethod as ExtendedModel<IPaymentMethod>)
  }

  /**
   * Build search query from filters
   */
  private buildSearchQuery(filters: PaymentMethodSearchFilters): Record<string, unknown> {
    const query: Record<string, unknown> = {
      deletedAt: null,
    }

    if (filters.currency) {
      query.currency = filters.currency.toUpperCase()
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
   * List payment methods with pagination and filters
   */
  async list(options: PaymentMethodListOptions = {}): Promise<PaginationResult<IPaymentMethod>> {
    const { filters = {}, ...paginateOptions } = options

    const query = this.buildSearchQuery(filters)

    return this.paginate(query, {
      ...paginateOptions,
      select: paginateOptions.select || '-__v',
      sort: paginateOptions.sort || { currency: 1, name: 1 },
    })
  }

  /**
   * Get all active payment methods
   */
  async getAllActive(): Promise<IPaymentMethod[]> {
    return this.find(
      { isEnabled: true, deletedAt: null },
      { sort: { currency: 1, name: 1 }, select: '-__v' }
    )
  }

  /**
   * Find payment method by UID
   */
  async findByUid(uid: string): Promise<IPaymentMethod | null> {
    return this.findOne({ uid, deletedAt: null })
  }

  /**
   * Find payment methods by currency
   */
  async findByCurrency(currency: string): Promise<IPaymentMethod[]> {
    return this.find(
      { currency: currency.toUpperCase(), deletedAt: null },
      { sort: { name: 1 } }
    )
  }

  /**
   * Find active payment methods by currency
   */
  async findActiveByCurrency(currency: string): Promise<IPaymentMethod[]> {
    return this.find(
      { currency: currency.toUpperCase(), isEnabled: true, deletedAt: null },
      { sort: { name: 1 } }
    )
  }

  /**
   * Create new payment method
   */
  async createPaymentMethod(data: {
    type: string
    name: string
    currency: string
    icon?: string
    color?: string
    acceptedMethods?: string[]
  }): Promise<IPaymentMethod> {
    await this.ensureConnection()

    const nextId = await this.getNextId()

    const paymentMethod = new PaymentMethod({
      id: nextId,
      type: data.type,
      name: data.name,
      currency: data.currency.toUpperCase(),
      icon: data.icon,
      color: data.color,
      acceptedMethods: data.acceptedMethods || [],
      isEnabled: true,
      createdAt: new Date(),
    })

    return paymentMethod.save()
  }

  /**
   * Toggle enabled status
   */
  async toggleEnabled(
    paymentMethodId: string,
    isEnabled: boolean
  ): Promise<IPaymentMethod | null> {
    return this.update(paymentMethodId, {
      isEnabled,
      updatedAt: new Date(),
    })
  }

  /**
   * Get currencies that have payment methods configured
   */
  async getCurrenciesWithPaymentMethods(): Promise<string[]> {
    await this.ensureConnection()

    const result = await PaymentMethod.distinct('currency', {
      isEnabled: true,
      deletedAt: null,
    })

    return result.sort()
  }
}

export const paymentMethodRepository = new PaymentMethodRepository()
