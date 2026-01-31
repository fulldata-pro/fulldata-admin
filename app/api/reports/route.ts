import { NextRequest, NextResponse } from 'next/server'
import { requestRepository } from '@/lib/db/repositories'
import { validateAdminRequest } from '@/lib/auth'
import { RequestStatusType } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const accountId = searchParams.get('accountId') || ''

    const result = await requestRepository.list({
      page,
      limit,
      search: search || undefined,
      status: (status as RequestStatusType) || undefined,
      type: type || undefined,
      accountId: accountId || undefined,
    })

    // Transform data for frontend (safe fields only)
    const reports = result.data.map((report: any) => {
      // Check if populate worked (populated docs have uid, non-populated are ObjectIds)
      const account = report.accountId && report.accountId.uid ? {
        uid: report.accountId.uid,
        email: report.accountId.email,
        name: report.accountId.billing?.name || report.accountId.name || null,
      } : null

      const user = report.userId && report.userId.uid ? {
        uid: report.userId.uid,
        firstName: report.userId.firstName,
        lastName: report.userId.lastName,
        email: report.userId.email,
      } : null

      // Ensure searchQuery is a string (some records have corrupted data with objects)
      const rawSearchQuery = report.metadata?.searchQuery
      const searchQuery = typeof rawSearchQuery === 'string' ? rawSearchQuery : null

      // Extract metadata fields for identity reports
      const metadata = report.type === 'IDENTITY' && report.metadata?.fullName ? {
        fullName: report.metadata.fullName
      } : undefined

      return {
        id: report.id,
        uid: report.uid,
        type: report.type,
        status: report.status,
        searchQuery,
        isBatch: report.isBatch || false,
        source: report.source || null,
        account,
        user,
        metadata,
        createdAt: report.createdAt,
        deletedAt: report.deletedAt || null,
      }
    })

    return NextResponse.json({
      reports,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json(
      { error: 'Error al obtener reportes' },
      { status: 500 }
    )
  }
}
