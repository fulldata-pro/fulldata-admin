import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import { receiptRepository, PeriodType } from '@/lib/db/repositories'
import { BillingStatsDTO } from '@/lib/dto/billing-stats.dto'

export const dynamic = 'force-dynamic';

const VALID_PERIODS: PeriodType[] = ['today', 'week', 'month', 'year']

export async function GET(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    // Get period from query params
    const searchParams = request.nextUrl.searchParams
    const periodParam = searchParams.get('period') || 'month'
    const period = VALID_PERIODS.includes(periodParam as PeriodType)
      ? (periodParam as PeriodType)
      : 'month'

    const stats = await receiptRepository.getBillingStats(period)

    const response: BillingStatsDTO = {
      totalReceipts: stats.totalReceipts,
      completedReceipts: stats.completedReceipts,
      pendingReceipts: stats.pendingReceipts,
      failedReceipts: stats.failedReceipts,
      revenueByCurrency: stats.revenueByCurrency,
      revenuePreviousByCurrency: stats.revenuePreviousByCurrency,
      recentReceipts: stats.recentReceipts,
      period: {
        type: period,
        start: stats.periodRange.start.toISOString(),
        end: stats.periodRange.end.toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Billing stats error:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de facturación' },
      { status: 500 }
    )
  }
}
