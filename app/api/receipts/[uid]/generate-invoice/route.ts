import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import dbConnect from '@/lib/db/connection'
import { receiptRepository, accountRepository, invoiceRepository } from '@/lib/db/repositories'

interface LambdaInvoiceRequest {
  movementId: string
  receiptId?: string
  accountId: string
  billing: {
    name: string
    taxId: string
    address?: string
    city?: string
    state?: string
    country: string
    postalCode?: string
  }
  searches: Array<{
    type: string
    quantity: number
    unitPrice?: number
    title?: string
  }>
  totalAmount: number
  currency: string
}

interface LambdaInvoiceResponse {
  success: boolean
  invoice?: {
    invoiceNumber: string
    cae: string
    caeFchVto: string
    voucherType: string
    billType: string
    salePoint: number
    voucherId: number
    qrCode: string
    pdfUrl: string
    pdfKey: string
  }
  afipData?: any
  error?: string
  code?: string
  details?: any
}

export async function POST(
  req: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { admin, error } = await validateAdminRequest(req)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    await dbConnect()

    const { uid } = params

    // Get the receipt
    const receipt = await receiptRepository.findOne({ uid })
    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    // Check if invoice already exists
    if (receipt.invoiceId) {
      const existingInvoice = await invoiceRepository.findById(receipt.invoiceId)
      if (existingInvoice) {
        return NextResponse.json(
          { error: 'Invoice already exists for this receipt' },
          { status: 400 }
        )
      }
    }

    // Check if it's a gift (benefit) - no invoice for gifts
    if (receipt.benefitId) {
      return NextResponse.json(
        { error: 'Cannot generate invoice for gift receipts' },
        { status: 400 }
      )
    }

    // Get the account with billing data
    const account = await accountRepository.findById(receipt.accountId)

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Check if billing data is complete
    if (!account.billing?.name || !account.billing?.taxId) {
      return NextResponse.json(
        { error: 'Billing data is incomplete' },
        { status: 400 }
      )
    }

    // Prepare Lambda request
    const lambdaRequest: LambdaInvoiceRequest = {
      movementId: receipt.uid, // Using receipt UID as movementId for backward compatibility
      receiptId: receipt.uid,
      accountId: account.uid,
      billing: {
        name: account.billing.name,
        taxId: account.billing.taxId,
        address: account.billing.address,
        city: account.billing.city,
        state: account.billing.state?.toString() || '',
        country: account.billing.country?.toString() || 'Argentina',
        postalCode: account.billing.zip || '',
      },
      searches: receipt.tokens
        ? [
            {
              type: 'TOKENS',
              quantity: receipt.tokens.quantity,
              unitPrice: receipt.tokens.unitPrice,
              title: `Compra de ${receipt.tokens.quantity} tokens`,
            },
          ]
        : [],
      totalAmount: receipt.total,
      currency: receipt.currency,
    }

    // Call Lambda function
    const lambdaUrl = process.env.LAMBDA_AFIP_INVOICE_URL
    const lambdaApiKey = process.env.LAMBDA_API_KEY

    if (!lambdaUrl) {
      return NextResponse.json(
        { error: 'Invoice generation service not configured' },
        { status: 500 }
      )
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (lambdaApiKey) {
      headers['X-API-Key'] = lambdaApiKey
    }

    const lambdaResponse = await fetch(lambdaUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(lambdaRequest),
    })

    const lambdaData: LambdaInvoiceResponse = await lambdaResponse.json()

    if (!lambdaResponse.ok || !lambdaData.success) {
      console.error('Lambda invoice generation failed:', lambdaData)
      return NextResponse.json(
        {
          error: lambdaData.error || 'Failed to generate invoice',
          details: lambdaData.details,
        },
        { status: 500 }
      )
    }

    if (!lambdaData.invoice) {
      return NextResponse.json(
        { error: 'Invalid response from invoice service' },
        { status: 500 }
      )
    }

    // Create invoice record
    const newInvoice = await invoiceRepository.create({
      type: 'AFIP',
      data: {
        invoice: lambdaData.invoice.invoiceNumber,
        billType: lambdaData.invoice.billType as 'A' | 'B' | 'C',
        voucherId: lambdaData.invoice.voucherId,
        voucherType: lambdaData.invoice.voucherType as any,
        salePoint: lambdaData.invoice.salePoint,
        business: {
          name: 'Fulldata S.R.L.',
          address: process.env.BUSINESS_ADDRESS || '',
          taxId: process.env.BUSINESS_TAX_ID || '',
          taxCondition: 'IVA Responsable Inscripto',
          activityAt: Date.now(),
        },
        account: {
          name: account.billing.name,
          taxId: account.billing.taxId,
          taxCondition: account.billing.vatType || 'Consumidor Final',
          address: account.billing.address || '',
        },
        items: lambdaRequest.searches.map((search) => ({
          code: '000001',
          description: search.title || 'Servicios de búsqueda',
          quantity: search.quantity,
          unit: 'unidades',
          unitPrice: search.unitPrice || receipt.total / search.quantity,
          amount: receipt.total,
          currency: receipt.currency,
        })),
        total: receipt.total,
        currency: receipt.currency,
        cae: lambdaData.invoice.cae,
        caeExpiredDate: new Date(lambdaData.invoice.caeFchVto).getTime(),
        emitedDate: Date.now(),
        qrCode: lambdaData.invoice.qrCode,
      },
      account: receipt.accountId,
      receiptId: receipt._id,
      createdBy: admin._id,
    })

    // Update receipt with invoice reference
    await receiptRepository.update(receipt._id, {
      invoiceId: newInvoice._id,
    })

    return NextResponse.json({
      success: true,
      invoice: {
        uid: newInvoice.uid,
        invoiceNumber: lambdaData.invoice.invoiceNumber,
        pdfUrl: lambdaData.invoice.pdfUrl,
        cae: lambdaData.invoice.cae,
        caeFchVto: lambdaData.invoice.caeFchVto,
      },
    })
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}