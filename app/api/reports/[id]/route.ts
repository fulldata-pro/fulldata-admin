import { NextRequest, NextResponse } from 'next/server'
import { requestRepository } from '@/lib/db/repositories'
import { validateAdminRequest } from '@/lib/auth'
import { getFullReport } from '@/lib/services/reportService'
import { RequestStatus } from '@/lib/constants'

export const dynamic = 'force-dynamic'

/**
 * Get full report by ID
 * GET /api/reports/[id]
 *
 * Fetches report metadata from MongoDB and full report data from external service
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Report ID is required' },
        { status: 400 }
      )
    }

    // Find Request by uid
    const requestDoc = await requestRepository.findByUid(id)

    if (!requestDoc) {
      return NextResponse.json(
        {
          success: false,
          error: 'REPORT_NOT_FOUND',
          message: 'No se encontro el reporte solicitado.',
        },
        { status: 404 }
      )
    }

    // Build base response from request document
    const baseResponse = {
      _id: requestDoc._id?.toString(),
      id: requestDoc.id,
      uid: requestDoc.uid,
      type: requestDoc.type,
      countryCode: requestDoc.countryCode,
      status: requestDoc.status,
      responseId: requestDoc.responseId,
      version: requestDoc.version,
      metadata: requestDoc.metadata,
      createdAt: requestDoc.createdAt,
      accountId: requestDoc.accountId,
      userId: requestDoc.userId,
    }

    // Check if report is still processing
    if (requestDoc.status === RequestStatus.PENDING || requestDoc.status === RequestStatus.PROCESSING) {
      return NextResponse.json(
        {
          ...baseResponse,
          message: 'El reporte aun esta siendo procesado.',
        },
        { status: 202 }
      )
    }

    // Check if report failed
    if (requestDoc.status === RequestStatus.FAILED) {
      return NextResponse.json(
        {
          ...baseResponse,
          error: requestDoc.error,
          message: 'El reporte fallo durante el procesamiento.',
        },
        { status: 422 }
      )
    }

    // Check if report was not found
    if (requestDoc.status === RequestStatus.NOT_FOUND) {
      return NextResponse.json({
        ...baseResponse,
        data: null,
        message: 'No se encontraron resultados para esta busqueda.',
      })
    }

    // For COMPLETED, PARTIAL, or REVIEW_NEEDED status, fetch full report from external service
    if (!requestDoc.responseId) {
      return NextResponse.json(
        {
          ...baseResponse,
          data: null,
          message: 'El reporte no tiene datos disponibles.',
        }
      )
    }

    // Fetch full report from external service
    let fullReport
    try {
      fullReport = await getFullReport(requestDoc.responseId)
    } catch (fetchError) {
      console.error(`Error fetching report from external service ${id}:`, fetchError)
      return NextResponse.json(
        {
          success: false,
          error: 'EXTERNAL_SERVICE_ERROR',
          message: 'No se pudo obtener el reporte del servicio externo.',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown error',
          // Still return the base response so admin can see metadata
          ...baseResponse,
        },
        { status: 502 }
      )
    }

    // Combine data
    const report = {
      ...fullReport,
      ...baseResponse,
      _id: baseResponse._id,
      id: baseResponse.id,
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Get report error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
