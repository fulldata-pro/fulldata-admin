import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import { receiptRepository, PeriodType } from '@/lib/db/repositories'

const VALID_PERIODS: PeriodType[] = ['today', 'week', 'month', 'year']

export async function GET(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const periodParam = searchParams.get('period') || 'month'
    const period = VALID_PERIODS.includes(periodParam as PeriodType)
      ? (periodParam as PeriodType)
      : 'month'

    const report = await receiptRepository.getFinancialReport(period)

    return NextResponse.json({
      ...report,
      period: {
        type: period,
        start: report.periodRange.start.toISOString(),
        end: report.periodRange.end.toISOString(),
      },
    })
  } catch (error) {
    console.error('Financial report error:', error)
    return NextResponse.json(
      { error: 'Error al obtener reporte financiero' },
      { status: 500 }
    )
  }
}
