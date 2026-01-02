import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import AccountApi from '@/lib/db/models/AccountApi'
import { validateAdminRequest } from '@/lib/auth'
import { ServicesType, WebhookEvent } from '@/lib/constants'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Obtener webhooks de una cuenta
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()

    const accountApi = await AccountApi.findOne({ accountId: id, deletedAt: null })

    return NextResponse.json({
      webhooks: accountApi?.webhooks || [],
    })
  } catch (error) {
    console.error('Get webhooks error:', error)
    return NextResponse.json(
      { error: 'Error al obtener webhooks' },
      { status: 500 }
    )
  }
}

// POST - Agregar un nuevo webhook
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Validar campos requeridos
    if (!body.type || !body.url) {
      return NextResponse.json(
        { error: 'El tipo y la URL son requeridos' },
        { status: 400 }
      )
    }

    // Validar tipo de servicio
    if (!Object.values(ServicesType).includes(body.type)) {
      return NextResponse.json(
        { error: 'Tipo de servicio inválido' },
        { status: 400 }
      )
    }

    // Validar eventos
    if (body.events && Array.isArray(body.events)) {
      const invalidEvents = body.events.filter(
        (e: string) => !Object.values(WebhookEvent).includes(e as typeof WebhookEvent[keyof typeof WebhookEvent])
      )
      if (invalidEvents.length > 0) {
        return NextResponse.json(
          { error: `Eventos inválidos: ${invalidEvents.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Validar URL
    try {
      new URL(body.url)
    } catch {
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      )
    }

    await dbConnect()

    let accountApi = await AccountApi.findOne({ accountId: id, deletedAt: null })

    if (!accountApi) {
      return NextResponse.json(
        { error: 'AccountApi no encontrado para esta cuenta' },
        { status: 404 }
      )
    }

    // Verificar si ya existe un webhook para este tipo
    const existingWebhook = accountApi.webhooks.find((w) => w.type === body.type)
    if (existingWebhook) {
      return NextResponse.json(
        { error: `Ya existe un webhook para el servicio ${body.type}` },
        { status: 400 }
      )
    }

    // Agregar el nuevo webhook
    const newWebhook = {
      type: body.type,
      url: body.url,
      events: body.events || [WebhookEvent.SEARCH_COMPLETED],
      headers: body.headers || {},
      isEnabled: body.isEnabled !== undefined ? body.isEnabled : true,
    }

    accountApi.webhooks.push(newWebhook)
    accountApi.updatedBy = admin._id
    await accountApi.save()

    return NextResponse.json({
      webhook: newWebhook,
      webhooks: accountApi.webhooks,
    })
  } catch (error) {
    console.error('Create webhook error:', error)
    return NextResponse.json(
      { error: 'Error al crear webhook' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un webhook existente
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    if (!body.type) {
      return NextResponse.json(
        { error: 'El tipo de webhook es requerido para identificarlo' },
        { status: 400 }
      )
    }

    // Validar URL si se proporciona
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

    // Validar eventos si se proporcionan
    if (body.events && Array.isArray(body.events)) {
      const invalidEvents = body.events.filter(
        (e: string) => !Object.values(WebhookEvent).includes(e as typeof WebhookEvent[keyof typeof WebhookEvent])
      )
      if (invalidEvents.length > 0) {
        return NextResponse.json(
          { error: `Eventos inválidos: ${invalidEvents.join(', ')}` },
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

    // Buscar el webhook por tipo
    const webhookIndex = accountApi.webhooks.findIndex((w) => w.type === body.type)
    if (webhookIndex === -1) {
      return NextResponse.json(
        { error: `Webhook de tipo ${body.type} no encontrado` },
        { status: 404 }
      )
    }

    // Actualizar campos
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

// DELETE - Eliminar un webhook
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (!type) {
      return NextResponse.json(
        { error: 'El tipo de webhook es requerido' },
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

    // Buscar y eliminar el webhook
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
