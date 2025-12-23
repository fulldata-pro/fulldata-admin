import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Invoice, { IInvoice } from '@/lib/db/models/Invoice'
import '@/lib/db/models/register-models'
import { validateAdminRequest } from '@/lib/auth'
import { toInvoiceListDTO } from '@/lib/dto/invoice.dto'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    await dbConnect()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type') || ''
    const accountId = searchParams.get('accountId') || ''

    const query: Record<string, unknown> = { deletedAt: null }

    if (type) {
      query.type = type
    }

    if (accountId) {
      query.account = accountId
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate('account', 'uid email billing')
        .populate('receiptId', 'uid total currency')
        .populate('file', 'url')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Invoice.countDocuments(query),
    ])

    return NextResponse.json({
      invoices: toInvoiceListDTO(invoices as unknown as IInvoice[]),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get invoices error:', error)
    return NextResponse.json(
      { error: 'Error al obtener facturas' },
      { status: 500 }
    )
  }
}
