import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Proxy from '@/lib/db/models/Proxy'
import { validateAdminRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    await dbConnect()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const countryCode = searchParams.get('countryCode') || ''

    const query: Record<string, unknown> = {}

    if (countryCode) {
      query.countryCode = countryCode.toUpperCase()
    }

    const [proxies, total] = await Promise.all([
      Proxy.find(query)
        .sort({ countryCode: 1, name: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Proxy.countDocuments(query),
    ])

    return NextResponse.json({
      proxies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
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

    await dbConnect()

    const proxy = new Proxy({
      name: body.name,
      countryCode: body.countryCode?.toUpperCase(),
      services: body.services || [],
    })

    await proxy.save()

    return NextResponse.json({ proxy }, { status: 201 })
  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json(
      { error: 'Error al crear servicio' },
      { status: 500 }
    )
  }
}
