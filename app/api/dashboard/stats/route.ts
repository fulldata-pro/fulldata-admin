import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Account from '@/lib/db/models/Account'
import User from '@/lib/db/models/User'
import Receipt from '@/lib/db/models/Receipt'
import mongoose from 'mongoose'

export async function GET() {
  try {
    await dbConnect()

    // Get accounts stats
    const [totalAccounts, activeAccounts, totalUsers, receipts, recentAccounts] = await Promise.all([
      Account.countDocuments({ deletedAt: null }),
      Account.countDocuments({ status: 'ACTIVE', deletedAt: null }),
      User.countDocuments({ deletedAt: null }),
      Receipt.find({ status: 'COMPLETED' }).select('totalUSD'),
      Account.find({ deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('uid email status createdAt billing'),
    ])

    // Calculate total revenue
    const totalRevenue = receipts.reduce((sum, r) => sum + (r.totalUSD || 0), 0)

    // Get real service usage from requests collection
    let serviceUsage: { type: string; count: number }[] = []

    if (mongoose.connection.db) {
      const serviceUsageAgg = await mongoose.connection.db.collection('requests').aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray()

      serviceUsage = serviceUsageAgg.map(item => ({
        type: item._id?.toLowerCase() || 'unknown',
        count: item.count
      }))
    }

    return NextResponse.json({
      totalAccounts,
      activeAccounts,
      totalUsers,
      totalReceipts: receipts.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      recentAccounts,
      serviceUsage,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
