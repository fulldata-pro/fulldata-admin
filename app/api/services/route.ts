import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import { proxyRepository } from '@/lib/db/repositories'
import { toProxyListDTO } from '@/lib/dto/proxy.dto'

export async function GET(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const countryCode = searchParams.get('countryCode') || undefined
    const currency = searchParams.get('currency') || undefined

    const result = await proxyRepository.list({
      page,
      limit,
      filters: {
        countryCode,
        currency,
      },
    })

    return NextResponse.json({
      proxies: toProxyListDTO(result.data),
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('Get services error:', error)
    return NextResponse.json(
      { error: 'Error al obtener servicios' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.name || !body.countryCode) {
      return NextResponse.json(
        { error: 'Nombre y código de país son requeridos' },
        { status: 400 }
      )
    }

    const proxy = await proxyRepository.createProxy({
      name: body.name,
      countryCode: body.countryCode,
      services: body.services || [],
    })

    return NextResponse.json({
      proxy: {
        id: proxy.id,
        uid: proxy.uid,
        name: proxy.name,
        countryCode: proxy.countryCode,
        services: proxy.services.map((s) => ({
          type: s.type,
          tokenCost: s.tokenCost ?? 0,
          isEnabled: s.isEnabled,
          hideInSearchForm: s.hideInSearchForm ?? false,
        })),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json(
      { error: 'Error al crear servicio' },
      { status: 500 }
    )
  }
}
