import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Account from '@/lib/db/models/Account'
import User from '@/lib/db/models/User'
import Receipt from '@/lib/db/models/Receipt'
import mongoose from 'mongoose'
import { validateAdminRequest } from '@/lib/auth'
import { RequestStatus } from '@/lib/constants'

export const dynamic = 'force-dynamic';

interface RevenueByCurrency {
  currency: string
  total: number
  count: number
}

interface RevenueByProvider {
  provider: string
  total: number
  count: number
}

export async function GET(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    await dbConnect()

    // Parse date range from query params
    const searchParams = request.nextUrl.searchParams
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')

    // Calculate date range
    const endDate = endDateStr ? new Date(endDateStr) : new Date()
    const startDate = startDateStr
      ? new Date(startDateStr)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Set time boundaries
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    // Build date filter for queries
    const dateFilter = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }

    // Get accounts and users stats - filtered by date range
    const [
      totalAccounts,
      activeAccounts,
      totalUsers,
      totalRequests,
      revenueByCurrencyAgg,
      revenueByProviderAgg,
      pendingReceipts,
      completedReceipts,
    ] = await Promise.all([
      // Accounts created in the period
      Account.countDocuments({ ...dateFilter, deletedAt: null }),
      // Active accounts created in the period
      Account.countDocuments({ ...dateFilter, status: 'ACTIVE', deletedAt: null }),
      // Users created in the period
      User.countDocuments({ ...dateFilter, deletedAt: null }),
      // Total requests in the period
      mongoose.connection.db
        ? mongoose.connection.db.collection('requests').countDocuments({
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: [RequestStatus.COMPLETED, RequestStatus.PARTIAL] },
            $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
          })
        : Promise.resolve(0),
      // Revenue by currency
      Receipt.aggregate<{ _id: string; total: number; count: number }>([
        {
          $match: {
            ...dateFilter,
            status: 'COMPLETED',
            deletedAt: null,
          },
        },
        {
          $group: {
            _id: '$currency',
            total: { $sum: '$total' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
      // Revenue by payment provider
      Receipt.aggregate<{ _id: string | null; total: number; count: number }>([
        {
          $match: {
            ...dateFilter,
            status: 'COMPLETED',
            deletedAt: null,
          },
        },
        {
          $group: {
            _id: '$paymentProvider',
            total: { $sum: '$total' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
      // Pending receipts count
      Receipt.countDocuments({
        ...dateFilter,
        status: { $in: ['PENDING', 'PROCESSING'] },
        deletedAt: null,
      }),
      // Completed receipts count
      Receipt.countDocuments({
        ...dateFilter,
        status: 'COMPLETED',
        deletedAt: null,
      }),
    ])

    // Transform aggregations
    const revenueByCurrency: RevenueByCurrency[] = revenueByCurrencyAgg.map((item) => ({
      currency: item._id || 'USD',
      total: Math.round(item.total * 100) / 100,
      count: item.count,
    }))

    const revenueByProvider: RevenueByProvider[] = revenueByProviderAgg
      .filter((item) => item._id)
      .map((item) => ({
        provider: item._id || 'UNKNOWN',
        total: Math.round(item.total * 100) / 100,
        count: item.count,
      }))

    // Calculate total revenue (sum of all currencies - note: this is simplified)
    const totalRevenue = revenueByCurrency.reduce((sum, r) => sum + r.total, 0)

    return NextResponse.json({
      totalAccounts,
      activeAccounts,
      totalUsers,
      totalRequests,
      // Revenue details
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        byCurrency: revenueByCurrency,
        byProvider: revenueByProvider,
        receipts: {
          completed: completedReceipts,
          pending: pendingReceipts,
        },
      },
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
