import { Types, PopulateOptions } from 'mongoose'
import { BaseRepository, PaginationResult, PaginateOptions } from './base.repository'
import Receipt, { IReceipt } from '@/lib/db/models/Receipt'
import '@/lib/db/models/register-models' // Register all models for populate
import { ExtendedModel } from '@/lib/db/types/model.types'
import { ReceiptStatusType } from '@/lib/constants'
import { RevenueByMonedaDTO, RecentReceiptDTO } from '@/lib/dto/billing-stats.dto'

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

/**
 * Revenue over time data point
 */
export interface RevenueDataPoint {
  date: string
  revenue: number
  count: number
  currency: string
}

/**
 * Payment method distribution
 */
export interface PaymentMethodStats {
  provider: string
  count: number
  total: number
  percentage: number
}

/**
 * Top account by revenue
 */
export interface TopAccountStats {
  accountId: string
  accountUid: string
  accountEmail: string
  accountName?: string
  totalRevenue: number
  receiptCount: number
  currency: string
}

/**
 * Discount usage stats
 */
export interface DiscountStats {
  totalDiscountAmount: number
  discountCodeUsage: number
  bulkDiscountUsage: number
  averageDiscountPercentage: number
  topDiscountCodes: Array<{
    code: string
    usageCount: number
    totalDiscounted: number
  }>
}

/**
 * Token sales stats
 */
export interface TokenSalesStats {
  totalTokensSold: number
  averageTokensPerPurchase: number
  averagePricePerToken: number
}

/**
 * Extended financial report
 */
export interface FinancialReport {
  // Basic stats
  totalReceipts: number
  completedReceipts: number
  pendingReceipts: number
  failedReceipts: number
  refundedReceipts: number

  // Revenue
  totalRevenue: Record<string, number> // by currency
  averageOrderValue: Record<string, number> // by currency

  // Revenue over time
  revenueOverTime: RevenueDataPoint[]

  // Payment methods
  paymentMethodDistribution: PaymentMethodStats[]

  // Top accounts
  topAccounts: TopAccountStats[]

  // Discounts
  discountStats: DiscountStats

  // Token sales
  tokenStats: TokenSalesStats

  // Period info
  periodRange: PeriodRange
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
        select: 'id uid email name billing avatar',
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
   * Find receipts with full details (account populated)
   */
  async findWithFullDetails(receiptId: string | Types.ObjectId): Promise<IReceipt | null> {
    return this.findById(receiptId, {
      populate: [
        {
          path: 'accountId',
          select: 'uid email billing name',
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

  /**
   * Get revenue over time for charts
   */
  async getRevenueOverTime(
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'month' = 'day',
    currency?: string
  ): Promise<RevenueDataPoint[]> {
    await this.ensureConnection()

    const matchStage: Record<string, unknown> = {
      status: 'COMPLETED',
      deletedAt: null,
      createdAt: { $gte: startDate, $lte: endDate },
    }

    if (currency) {
      matchStage.currency = currency
    }

    const groupFormat = groupBy === 'month'
      ? { $dateToString: { format: '%Y-%m', date: '$createdAt' } }
      : { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }

    const results = await Receipt.aggregate<{
      _id: { date: string; currency: string }
      revenue: number
      count: number
    }>([
      { $match: matchStage },
      {
        $group: {
          _id: {
            date: groupFormat,
            currency: '$currency',
          },
          revenue: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ])

    return results.map((r) => ({
      date: r._id.date,
      revenue: Math.round(r.revenue * 100) / 100,
      count: r.count,
      currency: r._id.currency,
    }))
  }

  /**
   * Get payment method distribution
   */
  async getPaymentMethodDistribution(
    startDate: Date,
    endDate: Date
  ): Promise<PaymentMethodStats[]> {
    await this.ensureConnection()

    const results = await Receipt.aggregate<{
      _id: string | null
      count: number
      total: number
    }>([
      {
        $match: {
          status: 'COMPLETED',
          deletedAt: null,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$paymentProvider',
          count: { $sum: 1 },
          total: { $sum: '$total' },
        },
      },
    ])

    const totalCount = results.reduce((sum, r) => sum + r.count, 0)

    return results.map((r) => ({
      provider: r._id || 'UNKNOWN',
      count: r.count,
      total: Math.round(r.total * 100) / 100,
      percentage: totalCount > 0 ? Math.round((r.count / totalCount) * 100 * 10) / 10 : 0,
    }))
  }

  /**
   * Get top accounts by revenue
   */
  async getTopAccounts(
    startDate: Date,
    endDate: Date,
    limit: number = 10
  ): Promise<TopAccountStats[]> {
    await this.ensureConnection()

    const results = await Receipt.aggregate<{
      _id: { accountId: Types.ObjectId; currency: string }
      totalRevenue: number
      receiptCount: number
      account: Array<{
        uid: string
        email: string
        billing?: { name?: string }
      }>
    }>([
      {
        $match: {
          status: 'COMPLETED',
          deletedAt: null,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { accountId: '$accountId', currency: '$currency' },
          totalRevenue: { $sum: '$total' },
          receiptCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'accounts',
          localField: '_id.accountId',
          foreignField: '_id',
          as: 'account',
        },
      },
    ])

    return results.map((r) => {
      const account = r.account[0]
      return {
        accountId: r._id.accountId.toString(),
        accountUid: account?.uid || '',
        accountEmail: account?.email || '',
        accountName: account?.billing?.name,
        totalRevenue: Math.round(r.totalRevenue * 100) / 100,
        receiptCount: r.receiptCount,
        currency: r._id.currency,
      }
    })
  }

  /**
   * Get discount usage statistics
   */
  async getDiscountStats(startDate: Date, endDate: Date): Promise<DiscountStats> {
    await this.ensureConnection()

    const [discountCodeStats, bulkDiscountStats, topCodes] = await Promise.all([
      // Discount code usage
      Receipt.aggregate<{
        count: number
        totalDiscounted: number
      }>([
        {
          $match: {
            status: 'COMPLETED',
            deletedAt: null,
            discountCodeId: { $ne: null },
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalDiscounted: { $sum: { $subtract: ['$subtotal', '$total'] } },
          },
        },
      ]),

      // Bulk discount usage
      Receipt.aggregate<{
        count: number
        totalDiscounted: number
      }>([
        {
          $match: {
            status: 'COMPLETED',
            deletedAt: null,
            bulkDiscountId: { $ne: null },
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalDiscounted: { $sum: { $subtract: ['$subtotal', '$total'] } },
          },
        },
      ]),

      // Top discount codes
      Receipt.aggregate<{
        _id: Types.ObjectId
        usageCount: number
        totalDiscounted: number
        code: Array<{ code: string }>
      }>([
        {
          $match: {
            status: 'COMPLETED',
            deletedAt: null,
            discountCodeId: { $ne: null },
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$discountCodeId',
            usageCount: { $sum: 1 },
            totalDiscounted: { $sum: { $subtract: ['$subtotal', '$total'] } },
          },
        },
        { $sort: { usageCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'discountcodes',
            localField: '_id',
            foreignField: '_id',
            as: 'code',
          },
        },
      ]),
    ])

    const discountCodeUsage = discountCodeStats[0]?.count || 0
    const bulkDiscountUsage = bulkDiscountStats[0]?.count || 0
    const totalDiscountAmount =
      (discountCodeStats[0]?.totalDiscounted || 0) +
      (bulkDiscountStats[0]?.totalDiscounted || 0)

    const totalUsage = discountCodeUsage + bulkDiscountUsage
    const averageDiscountPercentage = totalUsage > 0
      ? Math.round((totalDiscountAmount / totalUsage) * 10) / 10
      : 0

    return {
      totalDiscountAmount: Math.round(totalDiscountAmount * 100) / 100,
      discountCodeUsage,
      bulkDiscountUsage,
      averageDiscountPercentage,
      topDiscountCodes: topCodes.map((c) => ({
        code: c.code[0]?.code || 'Unknown',
        usageCount: c.usageCount,
        totalDiscounted: Math.round(c.totalDiscounted * 100) / 100,
      })),
    }
  }

  /**
   * Get token sales statistics
   */
  async getTokenSalesStats(startDate: Date, endDate: Date): Promise<TokenSalesStats> {
    await this.ensureConnection()

    const results = await Receipt.aggregate<{
      totalTokens: number
      totalReceipts: number
      totalRevenue: number
    }>([
      {
        $match: {
          status: 'COMPLETED',
          deletedAt: null,
          'tokens.quantity': { $gt: 0 },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$tokens.quantity' },
          totalReceipts: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
        },
      },
    ])

    const data = results[0] || { totalTokens: 0, totalReceipts: 0, totalRevenue: 0 }

    return {
      totalTokensSold: data.totalTokens,
      averageTokensPerPurchase: data.totalReceipts > 0
        ? Math.round(data.totalTokens / data.totalReceipts)
        : 0,
      averagePricePerToken: data.totalTokens > 0
        ? Math.round((data.totalRevenue / data.totalTokens) * 100) / 100
        : 0,
    }
  }

  /**
   * Get complete financial report
   */
  async getFinancialReport(period: PeriodType = 'month'): Promise<FinancialReport> {
    await this.ensureConnection()

    const periodRange = calculatePeriodRange(period)

    const [
      basicStats,
      refundedReceipts,
      revenueByCurrency,
      revenueOverTime,
      paymentMethodDistribution,
      topAccounts,
      discountStats,
      tokenStats,
    ] = await Promise.all([
      // Basic counts
      Promise.all([
        this.count({ deletedAt: null, createdAt: { $gte: periodRange.start, $lte: periodRange.end } }),
        this.count({ status: 'COMPLETED', deletedAt: null, createdAt: { $gte: periodRange.start, $lte: periodRange.end } }),
        this.count({ status: { $in: ['PENDING', 'PROCESSING'] }, deletedAt: null, createdAt: { $gte: periodRange.start, $lte: periodRange.end } }),
        this.count({ status: 'FAILED', deletedAt: null, createdAt: { $gte: periodRange.start, $lte: periodRange.end } }),
      ]),
      this.count({ status: 'REFUNDED', deletedAt: null, createdAt: { $gte: periodRange.start, $lte: periodRange.end } }),

      // Revenue by currency with average
      Receipt.aggregate<{
        _id: string
        total: number
        count: number
        average: number
      }>([
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
            average: { $avg: '$total' },
          },
        },
      ]),

      // Revenue over time
      this.getRevenueOverTime(
        periodRange.start,
        periodRange.end,
        period === 'year' || period === 'month' ? 'month' : 'day'
      ),

      // Payment methods
      this.getPaymentMethodDistribution(periodRange.start, periodRange.end),

      // Top accounts
      this.getTopAccounts(periodRange.start, periodRange.end, 10),

      // Discount stats
      this.getDiscountStats(periodRange.start, periodRange.end),

      // Token stats
      this.getTokenSalesStats(periodRange.start, periodRange.end),
    ])

    const [totalReceipts, completedReceipts, pendingReceipts, failedReceipts] = basicStats

    // Build revenue maps
    const totalRevenue: Record<string, number> = {}
    const averageOrderValue: Record<string, number> = {}

    revenueByCurrency.forEach((r) => {
      totalRevenue[r._id] = Math.round(r.total * 100) / 100
      averageOrderValue[r._id] = Math.round(r.average * 100) / 100
    })

    return {
      totalReceipts,
      completedReceipts,
      pendingReceipts,
      failedReceipts,
      refundedReceipts,
      totalRevenue,
      averageOrderValue,
      revenueOverTime,
      paymentMethodDistribution,
      topAccounts,
      discountStats,
      tokenStats,
      periodRange,
    }
  }

  /**
   * Get data for export (all completed receipts in period)
   */
  async getExportData(
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    uid: string
    status: string
    total: number
    subtotal: number
    currency: string
    tokens: number
    paymentProvider: string
    accountEmail: string
    accountName: string
    discountCode: string
    createdAt: string
  }>> {
    await this.ensureConnection()

    const receipts = await Receipt.find({
      deletedAt: null,
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate({
        path: 'accountId',
        select: 'email billing',
      })
      .populate({
        path: 'discountCodeId',
        select: 'code',
      })
      .sort({ createdAt: -1 })
      .lean()

    return receipts.map((r) => {
      const account = r.accountId as unknown as {
        email?: string
        billing?: { name?: string }
      } | undefined
      const discountCode = r.discountCodeId as unknown as { code?: string } | undefined

      return {
        uid: r.uid,
        status: r.status,
        total: r.total,
        subtotal: r.subtotal,
        currency: r.currency,
        tokens: r.tokens?.quantity || 0,
        paymentProvider: r.paymentProvider || '',
        accountEmail: account?.email || '',
        accountName: account?.billing?.name || '',
        discountCode: discountCode?.code || '',
        createdAt: new Date(r.createdAt).toISOString(),
      }
    })
  }
}

export const receiptRepository = new ReceiptRepository()
