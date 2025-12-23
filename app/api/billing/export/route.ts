import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import { receiptRepository, calculatePeriodRange, PeriodType } from '@/lib/db/repositories'

export const dynamic = 'force-dynamic';

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

    const customStart = searchParams.get('startDate')
    const customEnd = searchParams.get('endDate')

    let startDate: Date
    let endDate: Date

    if (customStart && customEnd) {
      startDate = new Date(customStart)
      endDate = new Date(customEnd)
    } else {
      const periodRange = calculatePeriodRange(period)
      startDate = periodRange.start
      endDate = periodRange.end
    }

    const data = await receiptRepository.getExportData(startDate, endDate)

    return NextResponse.json({
      data,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      count: data.length,
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Error al exportar datos' },
      { status: 500 }
    )
  }
}
