import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Benefit from '@/lib/db/models/Benefit'
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
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const isEnabled = searchParams.get('isEnabled')

    const query: Record<string, unknown> = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ]
    }

    if (isEnabled !== null && isEnabled !== '') {
      query.isEnabled = isEnabled === 'true'
    }

    const [benefits, total] = await Promise.all([
      Benefit.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Benefit.countDocuments(query),
    ])

    return NextResponse.json({
      benefits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get benefits error:', error)
    return NextResponse.json(
      { error: 'Error al obtener beneficios' },
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

    if (!body.name || !body.code || !body.advantage) {
      return NextResponse.json(
        { error: 'Nombre, código y ventaja son requeridos' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Check if code exists
    const existingBenefit = await Benefit.findOne({ code: body.code.toUpperCase(), deletedAt: null })
    if (existingBenefit) {
      return NextResponse.json(
        { error: 'El código ya existe' },
        { status: 400 }
      )
    }

    const benefit = new Benefit({
      name: body.name,
      description: body.description,
      code: body.code.toUpperCase(),
      advantage: body.advantage,
      isEnabled: body.isEnabled ?? true,
      startDate: body.startDate,
      endDate: body.endDate,
      minimumPurchase: body.minimumPurchase,
      selfApply: body.selfApply ?? false,
      maxUses: body.maxUses,
      maxUsesPerAccount: body.maxUsesPerAccount,
    })

    await benefit.save()

    return NextResponse.json({ benefit }, { status: 201 })
  } catch (error) {
    console.error('Create benefit error:', error)
    return NextResponse.json(
      { error: 'Error al crear beneficio' },
      { status: 500 }
    )
  }
}
