import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Receipt from '@/lib/db/models/Receipt'
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
    const status = searchParams.get('status') || ''
    const accountId = searchParams.get('accountId') || ''

    const query: Record<string, unknown> = {}

    if (status) {
      query.status = status
    }

    if (accountId) {
      query.accountId = accountId
    }

    const [receipts, total] = await Promise.all([
      Receipt.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('accountId', 'uid email billing'),
      Receipt.countDocuments(query),
    ])

    return NextResponse.json({
      receipts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get receipts error:', error)
    return NextResponse.json(
      { error: 'Error al obtener recibos' },
      { status: 500 }
    )
  }
}
