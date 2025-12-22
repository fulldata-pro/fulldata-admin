/**
 * DTO for Billing Stats API response
 * Returns minimal data needed by the frontend
 */

export interface RevenueByMonedaDTO {
  currency: string
  total: number
  count: number
}

export interface RecentReceiptDTO {
  uid: string
  status: string
  total: number
  currency: string
  accountUid: string
  accountEmail: string
  accountName?: string
  createdAt: string
}

export interface BillingStatsDTO {
  // Counts
  totalReceipts: number
  completedReceipts: number
  pendingReceipts: number
  failedReceipts: number

  // Revenue current period
  revenueByCurrency: RevenueByMonedaDTO[]

  // Revenue previous period (for comparison)
  revenuePreviousByCurrency: RevenueByMonedaDTO[]

  // Recent receipts
  recentReceipts: RecentReceiptDTO[]

  // Period info
  period: {
    type: 'today' | 'week' | 'month' | 'year'
    start: string
    end: string
  }
}

/**
 * Transform raw receipt data to RecentReceiptDTO
 */
export function toRecentReceiptDTO(receipt: {
  uid: string
  status: string
  total: number
  currency: string
  createdAt: Date
  accountId?: {
    uid: string
    email: string
    billing?: { name?: string }
  }
}): RecentReceiptDTO {
  return {
    uid: receipt.uid,
    status: receipt.status,
    total: receipt.total,
    currency: receipt.currency,
    accountUid: receipt.accountId?.uid || '',
    accountEmail: receipt.accountId?.email || '',
    accountName: receipt.accountId?.billing?.name,
    createdAt: receipt.createdAt.toISOString(),
  }
}
