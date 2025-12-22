import { Types, PopulateOptions } from 'mongoose'
import { BaseRepository, PaginationResult, PaginateOptions } from './base.repository'
import Receipt, { IReceipt } from '@/lib/db/models/Receipt'
import '@/lib/db/models/register-models' // Register all models for populate
import { ExtendedModel } from '@/lib/db/types/model.types'
import { ReceiptStatusType } from '@/lib/constants'

export interface ReceiptSearchFilters {
  status?: ReceiptStatusType
  accountId?: string | Types.ObjectId
}

export interface ReceiptListOptions extends PaginateOptions {
  filters?: ReceiptSearchFilters
}

class ReceiptRepository extends BaseRepository<IReceipt> {
  constructor() {
    super(Receipt as ExtendedModel<IReceipt>)
  }

  /**
   * Build search query from filters
   */
  private buildSearchQuery(filters: ReceiptSearchFilters): Record<string, unknown> {
    const query: Record<string, unknown> = {
      deletedAt: null,
    }

    if (filters.status) {
      query.status = filters.status
    }

    if (filters.accountId) {
      query.accountId = filters.accountId
    }

    return query
  }

  /**
   * List receipts with pagination and filters
   */
  async list(options: ReceiptListOptions = {}): Promise<PaginationResult<IReceipt>> {
    const { filters = {}, ...paginateOptions } = options

    const query = this.buildSearchQuery(filters)

    const defaultPopulate: PopulateOptions[] = [
      {
        path: 'accountId',
        select: 'id uid email billing avatar',
      },
      {
        path: 'paymentMethodId',
        select: 'name type provider',
      },
      {
        path: 'invoiceId',
        select: '_id uid number status',
      },
      {
        path: 'discountCodeId',
        select: 'code name value type',
      },
      {
        path: 'bulkDiscountId',
        select: 'name tiers',
      },
    ]

    return this.paginate(query, {
      ...paginateOptions,
      populate: paginateOptions.populate || defaultPopulate,
      select: paginateOptions.select || '-__v',
      sort: paginateOptions.sort || { createdAt: -1 },
    })
  }

  /**
   * Find receipt by UID
   */
  async findByUid(uid: string): Promise<IReceipt | null> {
    return this.findOne({ uid, deletedAt: null })
  }

  /**
   * Find receipt with account populated
   */
  async findWithAccount(receiptId: string | Types.ObjectId): Promise<IReceipt | null> {
    return this.findById(receiptId, {
      populate: {
        path: 'accountId',
        select: 'uid email billing name',
      },
    })
  }

  /**
   * Find receipts by account
   */
  async findByAccount(accountId: string | Types.ObjectId): Promise<IReceipt[]> {
    return this.find(
      { accountId, deletedAt: null },
      {
        sort: { createdAt: -1 },
      }
    )
  }

  /**
   * Find receipts by status
   */
  async findByStatus(status: ReceiptStatusType): Promise<IReceipt[]> {
    return this.find({ status, deletedAt: null })
  }

  /**
   * Update receipt status
   */
  async updateStatus(
    receiptId: string | Types.ObjectId,
    status: ReceiptStatusType,
    statusMessage?: string
  ): Promise<IReceipt | null> {
    const update: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    }
    if (statusMessage !== undefined) {
      update.statusMessage = statusMessage
    }
    return this.update(receiptId, update)
  }

  /**
   * Find receipts with full details (account and payment method populated)
   */
  async findWithFullDetails(receiptId: string | Types.ObjectId): Promise<IReceipt | null> {
    return this.findById(receiptId, {
      populate: [
        {
          path: 'accountId',
          select: 'uid email billing name',
        },
        {
          path: 'paymentMethodId',
          select: 'name type provider',
        },
        {
          path: 'invoiceId',
          select: 'uid number status',
        },
      ],
    })
  }

  /**
   * Get receipts summary by status for an account
   */
  async getAccountReceiptsSummary(accountId: string | Types.ObjectId): Promise<{
    total: number
    completed: number
    pending: number
    failed: number
  }> {
    await this.ensureConnection()

    const [total, completed, pending, failed] = await Promise.all([
      this.count({ accountId, deletedAt: null }),
      this.count({ accountId, status: 'COMPLETED', deletedAt: null }),
      this.count({ accountId, status: 'PENDING', deletedAt: null }),
      this.count({ accountId, status: 'FAILED', deletedAt: null }),
    ])

    return { total, completed, pending, failed }
  }
}

export const receiptRepository = new ReceiptRepository()
