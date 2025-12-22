import { IInvoice, IAFIPData } from '@/lib/db/models/Invoice'

/**
 * DTO for Invoice list response
 * Transforms database model to API response format
 */

interface AccountDTO {
  uid: string
  email: string
  billingName?: string
  taxId?: string
}

interface ReceiptDTO {
  uid: string
  total: number
  currency: string
}

interface AFIPDataDTO {
  /** Número de factura formateado (ej: "0001-00000123") */
  invoiceNumber: string
  /** Tipo de factura (A, B o C) */
  billType: 'A' | 'B' | 'C'
  /** Tipo de comprobante legible */
  voucherType: string
  /** Punto de venta */
  salePoint: number
  /** Total de la factura */
  total: number
  /** Moneda */
  currency: string
  /** CAE */
  cae: string
  /** Fecha de vencimiento del CAE */
  caeExpiredDate: string
  /** Fecha de emisión */
  emitedDate: string
  /** Datos del cliente en la factura */
  customer: {
    name: string
    taxId: string
    taxCondition: string
  }
}

export interface InvoiceListItemDTO {
  id: number
  uid: string
  type: string
  /** Número de factura formateado para mostrar (ej: "FA-A 0001-00000123") */
  displayNumber: string
  /** Datos AFIP parseados (solo para facturas AFIP) */
  afipData?: AFIPDataDTO
  /** URL del archivo PDF */
  fileUrl?: string
  /** Tiene archivo PDF */
  hasFile: boolean
  /** Cuenta asociada */
  account: AccountDTO
  /** Recibo asociado */
  receipt?: ReceiptDTO
  /** Fecha de creación */
  createdAt: string
}

/**
 * Transform an Invoice document to DTO format
 */
export function toInvoiceListItemDTO(invoice: IInvoice): InvoiceListItemDTO {
  const doc = invoice as unknown as Record<string, unknown>

  // Transform account (populated)
  const accountDoc = doc.account as Record<string, unknown> | undefined
  const billing = accountDoc?.billing as { name?: string; taxId?: string } | undefined
  const account: AccountDTO = accountDoc ? {
    uid: accountDoc.uid as string,
    email: accountDoc.email as string,
    billingName: billing?.name,
    taxId: billing?.taxId,
  } : {
    uid: '',
    email: '',
  }

  // Transform receipt (populated)
  const receiptDoc = doc.receiptId as Record<string, unknown> | undefined
  const receipt: ReceiptDTO | undefined = receiptDoc ? {
    uid: receiptDoc.uid as string,
    total: receiptDoc.total as number,
    currency: receiptDoc.currency as string,
  } : undefined

  // Transform file
  const fileDoc = doc.file as Record<string, unknown> | undefined
  const fileUrl = (fileDoc?.urlView || fileDoc?.urlDownload) as string | undefined

  // Parse AFIP data if available
  let afipData: AFIPDataDTO | undefined
  let displayNumber = invoice.uid

  const data = invoice.data as IAFIPData | Record<string, unknown>

  if (invoice.type === 'AFIP' && data && 'billType' in data) {
    const afip = data as IAFIPData

    // Format invoice number: "0001-00000123"
    const invoiceNumber = afip.invoice ||
      `${String(afip.salePoint).padStart(4, '0')}-${String(afip.voucherId).padStart(8, '0')}`

    // Display number: solo el número de factura
    displayNumber = invoiceNumber

    afipData = {
      invoiceNumber,
      billType: afip.billType,
      voucherType: afip.voucherType || 'FACTURA',
      salePoint: afip.salePoint,
      total: afip.total,
      currency: afip.currency,
      cae: afip.cae,
      caeExpiredDate: afip.caeExpiredDate ? new Date(afip.caeExpiredDate).toISOString() : '',
      emitedDate: afip.emitedDate ? new Date(afip.emitedDate).toISOString() : '',
      customer: {
        name: afip.account?.name || '',
        taxId: afip.account?.taxId || '',
        taxCondition: afip.account?.taxCondition || '',
      },
    }
  }

  return {
    id: invoice.id,
    uid: invoice.uid,
    type: invoice.type,
    displayNumber,
    afipData,
    fileUrl,
    hasFile: !!fileDoc || !!fileUrl,
    account,
    receipt,
    createdAt: invoice.createdAt.toISOString(),
  }
}

/**
 * Transform an array of Invoice documents to DTO format
 */
export function toInvoiceListDTO(invoices: IInvoice[]): InvoiceListItemDTO[] {
  return invoices.map(toInvoiceListItemDTO)
}
