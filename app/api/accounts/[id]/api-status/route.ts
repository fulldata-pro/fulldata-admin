import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import AccountApi from '@/lib/db/models/AccountApi'
import { validateAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/accounts/[id]/api-status
 * Update API enabled status for an account
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { enabled } = body

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Update all API keys for this account
    const result = await AccountApi.updateMany(
      { accountId: id },
      {
        $set: {
          isEnabled: enabled,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'No se encontraron API keys para esta cuenta' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: enabled ? 'API habilitada' : 'API deshabilitada',
      updated: result.modifiedCount
    })
  } catch (error) {
    console.error('Update API status error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar estado de API' },
      { status: 500 }
    )
  }
}