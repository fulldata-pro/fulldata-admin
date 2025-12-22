import { Types, PopulateOptions } from 'mongoose'
import { BaseRepository, PaginationResult, PaginateOptions } from './base.repository'
import Receipt, { IReceipt } from '@/lib/db/models/Receipt'
import '@/lib/db/models/register-models' // Register all models for populate
import { ExtendedModel } from '@/lib/db/types/model.types'
import { ReceiptStatusType } from '@/lib/constants'
import { RevenueByMonedaDTO, RecentReceiptDTO, toRecentReceiptDTO } from '@/lib/dto/billing-stats.dto'

export type PeriodType = 'today' | 'week' | 'month' | 'year'

export interface PeriodRange {
  start: Date
  end: Date
  previousStart: Date
  previousEnd: Date
}

/**
 * Calculate period ranges based on period type
 */
export function calculatePeriodRange(period: PeriodType): PeriodRange {
  const now = new Date()
  const end = now

  let start: Date
  let previousStart: Date
  let previousEnd: Date

  switch (period) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      previousEnd = new Date(start.getTime() - 1)
      previousStart = new Date(previousEnd.getFullYear(), previousEnd.getMonth(), previousEnd.getDate())
      break
    case 'week':
      const dayOfWeek = now.getDay()
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday)
      previousEnd = new Date(start.getTime() - 1)
      previousStart = new Date(previousEnd.getFullYear(), previousEnd.getMonth(), previousEnd.getDate() - 6)
      break
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      previousEnd = new Date(start.getTime() - 1)
      previousStart = new Date(previousEnd.getFullYear(), previousEnd.getMonth(), 1)
      break
    case 'year':
      start = new Date(now.getFullYear(), 0, 1)
      previousEnd = new Date(start.getTime() - 1)
      previousStart = new Date(previousEnd.getFullYear(), 0, 1)
      break
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      previousEnd = new Date(start.getTime() - 1)
      previousStart = new Date(previousEnd.getFullYear(), previousEnd.getMonth(), 1)
  }

  return { start, end, previousStart, previousEnd }
}

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

  /**
   * Get billing stats for dashboard
   */
  async getBillingStats(period: PeriodType = 'month'): Promise<{
    totalReceipts: number
    completedReceipts: number
    pendingReceipts: number
    failedReceipts: number
    revenueByCurrency: RevenueByMonedaDTO[]
    revenuePreviousByCurrency: RevenueByMonedaDTO[]
    recentReceipts: RecentReceiptDTO[]
    periodRange: PeriodRange
  }> {
    await this.ensureConnection()

    const periodRange = calculatePeriodRange(period)

    const [
      totalReceipts,
      completedReceipts,
      pendingReceipts,
      failedReceipts,
      revenueCurrentPeriod,
      revenuePreviousPeriod,
      recentReceiptsDocs,
    ] = await Promise.all([
      // Counts (all time)
      this.count({ deletedAt: null }),
      this.count({ status: 'COMPLETED', deletedAt: null }),
      this.count({ status: { $in: ['PENDING', 'PROCESSING'] }, deletedAt: null }),
      this.count({ status: 'FAILED', deletedAt: null }),

      // Revenue current period by currency
      Receipt.aggregate<{ _id: string; total: number; count: number }>([
        {
          $match: {
            status: 'COMPLETED',
            deletedAt: null,
            createdAt: { $gte: periodRange.start, $lte: periodRange.end },
          },
        },
        {
          $group: {
            _id: '$currency',
            total: { $sum: '$total' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Revenue previous period by currency
      Receipt.aggregate<{ _id: string; total: number; count: number }>([
        {
          $match: {
            status: 'COMPLETED',
            deletedAt: null,
            createdAt: { $gte: periodRange.previousStart, $lte: periodRange.previousEnd },
          },
        },
        {
          $group: {
            _id: '$currency',
            total: { $sum: '$total' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Recent receipts
      Receipt.find({ deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
          path: 'accountId',
          select: 'uid email billing',
        })
        .select('uid status total currency createdAt accountId')
        .lean(),
    ])

    // Transform revenue data
    const revenueByCurrency: RevenueByMonedaDTO[] = revenueCurrentPeriod.map((r) => ({
      currency: r._id || 'USD',
      total: Math.round(r.total * 100) / 100,
      count: r.count,
    }))

    const revenuePreviousByCurrency: RevenueByMonedaDTO[] = revenuePreviousPeriod.map((r) => ({
      currency: r._id || 'USD',
      total: Math.round(r.total * 100) / 100,
      count: r.count,
    }))

    // Transform recent receipts using DTO
    const recentReceipts: RecentReceiptDTO[] = recentReceiptsDocs.map((receipt) => {
      const accountId = receipt.accountId as unknown as {
        uid: string
        email: string
        billing?: { name?: string }
      } | undefined

      return {
        uid: receipt.uid,
        status: receipt.status,
        total: receipt.total,
        currency: receipt.currency,
        accountUid: accountId?.uid || '',
        accountEmail: accountId?.email || '',
        accountName: accountId?.billing?.name,
        createdAt: new Date(receipt.createdAt).toISOString(),
      }
    })

    return {
      totalReceipts,
      completedReceipts,
      pendingReceipts,
      failedReceipts,
      revenueByCurrency,
      revenuePreviousByCurrency,
      recentReceipts,
      periodRange,
    }
  }
}

export const receiptRepository = new ReceiptRepository()
