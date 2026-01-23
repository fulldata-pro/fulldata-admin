import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import AccountApi from '@/lib/db/models/AccountApi'
import { validateAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string; type: string }>
}

/**
 * PUT /api/accounts/[id]/webhooks/[type]
 * Update a webhook
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    const { id, type } = await params
    const body = await request.json()

    // Validate URL if provided
    if (body.url) {
      try {
        new URL(body.url)
      } catch {
        return NextResponse.json(
          { error: 'URL inválida' },
          { status: 400 }
        )
      }
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

    // Update fields
    if (body.url !== undefined) {
      accountApi.webhooks[webhookIndex].url = body.url
    }
    if (body.events !== undefined) {
      accountApi.webhooks[webhookIndex].events = body.events
    }
    if (body.headers !== undefined) {
      accountApi.webhooks[webhookIndex].headers = body.headers
    }
    if (body.isEnabled !== undefined) {
      accountApi.webhooks[webhookIndex].isEnabled = body.isEnabled
    }
    if (body.description !== undefined) {
      accountApi.webhooks[webhookIndex].description = body.description
    }

    accountApi.updatedBy = admin._id
    await accountApi.save()

    return NextResponse.json({
      webhook: accountApi.webhooks[webhookIndex],
      webhooks: accountApi.webhooks,
    })
  } catch (error) {
    console.error('Update webhook error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar webhook' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/accounts/[id]/webhooks/[type]
 * Delete a webhook
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    const { id, type } = await params

    await dbConnect()

    const accountApi = await AccountApi.findOne({ accountId: id, deletedAt: null })

    if (!accountApi) {
      return NextResponse.json(
        { error: 'AccountApi no encontrado para esta cuenta' },
        { status: 404 }
      )
    }

    // Find and delete webhook
    const webhookIndex = accountApi.webhooks.findIndex((w) => w.type === type)
    if (webhookIndex === -1) {
      return NextResponse.json(
        { error: `Webhook de tipo ${type} no encontrado` },
        { status: 404 }
      )
    }

    accountApi.webhooks.splice(webhookIndex, 1)
    accountApi.updatedBy = admin._id
    await accountApi.save()

    return NextResponse.json({
      success: true,
      webhooks: accountApi.webhooks,
    })
  } catch (error) {
    console.error('Delete webhook error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar webhook' },
      { status: 500 }
    )
  }
}