import { NextRequest, NextResponse } from 'next/server'
import { movementRepository } from '@/lib/db/repositories'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')
    const groupBy = (searchParams.get('groupBy') as 'day' | 'month') || 'day'

    // Default to last 30 days if no dates provided
    const endDate = endDateStr ? new Date(endDateStr) : new Date()
    const startDate = startDateStr
      ? new Date(startDateStr)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Set time boundaries
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    const consumption = await movementRepository.getConsumptionByDateAndService(
      startDate,
      endDate,
      groupBy
    )

    return NextResponse.json(consumption)
  } catch (error) {
    console.error('Error fetching consumption data:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos de consumo' },
      { status: 500 }
    )
  }
}
