import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import AccountApi from '@/lib/db/models/AccountApi'
import { validateAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string; type: string }>
}

/**
 * PATCH /api/accounts/[id]/webhooks/[type]/toggle
 * Toggle webhook enabled status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    const { id, type } = await params
    const body = await request.json()
    const { enabled } = body

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    await dbConnect()

    const accountApi = await AccountApi.findOne({ accountId: id, deletedAt: null })

    if (!accountApi) {
      return NextResponse.json(
        { error: 'AccountApi no encontrado para esta cuenta' },
        { status: 404 }
      )
    }

    // Find webhook by type
    const webhookIndex = accountApi.webhooks.findIndex((w) => w.type === type)
    if (webhookIndex === -1) {
      return NextResponse.json(
        { error: `Webhook de tipo ${type} no encontrado` },
        { status: 404 }
      )
    }

    // Update enabled status
    accountApi.webhooks[webhookIndex].isEnabled = enabled
    accountApi.updatedBy = admin._id
    await accountApi.save()

    return NextResponse.json({
      success: true,
      message: enabled ? 'Webhook habilitado' : 'Webhook deshabilitado',
      webhook: accountApi.webhooks[webhookIndex]
    })
  } catch (error) {
    console.error('Toggle webhook error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar estado del webhook' },
      { status: 500 }
    )
  }
}