import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Receipt from '@/lib/db/models/Receipt'
import '@/lib/db/models/register-models' // Register all models for populate
import { validateAdminRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    await dbConnect()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalReceipts,
      completedReceipts,
      pendingReceipts,
      allCompletedReceipts,
      thisMonthReceipts,
      recentReceipts,
    ] = await Promise.all([
      Receipt.countDocuments(),
      Receipt.countDocuments({ status: 'COMPLETED' }),
      Receipt.countDocuments({ status: { $in: ['PENDING', 'PROCESSING'] } }),
      Receipt.find({ status: 'COMPLETED' }).select('total currency'),
      Receipt.find({ status: 'COMPLETED', createdAt: { $gte: startOfMonth } }).select('total currency'),
      Receipt.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('accountId', 'uid email billing'),
    ])

    const totalRevenue = allCompletedReceipts.reduce((sum, r) => sum + (r.total || 0), 0)
    const revenueThisMonth = thisMonthReceipts.reduce((sum, r) => sum + (r.total || 0), 0)

    return NextResponse.json({
      totalReceipts,
      completedReceipts,
      pendingReceipts,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      revenueThisMonth: Math.round(revenueThisMonth * 100) / 100,
      recentReceipts,
    })
  } catch (error) {
    console.error('Billing stats error:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de facturación' },
      { status: 500 }
    )
  }
}
