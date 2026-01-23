import mongoose, { Schema, Document, Types } from 'mongoose'
import { InvoiceType, InvoiceTypes } from '@/lib/constants'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'
import { ExtendedModel } from '../types/model.types'

/**
 * AFIP Business Data
 */
export interface IAFIPBusiness {
  name: string
  address: string
  taxId: string
  taxCondition: string
  activityAt: number
}

/**
 * AFIP Account/Customer Data
 */
export interface IAFIPAccount {
  name: string
  taxId: string
  taxCondition: string
  address: string
}

/**
 * AFIP Invoice Item
 */
export interface IAFIPItem {
  code: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  amount: number
  currency: string
}

/**
 * Complete AFIP Invoice Data
 */
export interface IAFIPData {
  /** Número de factura (ej: "0001-00000123") */
  invoice: string
  /** Tipo de factura (A, B o C) */
  billType: 'A' | 'B' | 'C'
  /** ID del tipo de comprobante AFIP */
  voucherId: number
  /** Tipo de comprobante legible */
  voucherType: 'FACTURA' | 'NOTA_DE_DEBITO' | 'NOTA_DE_CREDITO' | 'RECIBO' | 'NOTAS_DE_VENTA_AL_CONTADO'
  /** Número de punto de venta */
  salePoint: number
  /** Condición de venta */
  saleCondition: string
  /** Datos del emisor (negocio) */
  business: IAFIPBusiness
  /** Datos del receptor (cliente) */
  account: IAFIPAccount
  /** Items/productos de la factura */
  items: IAFIPItem[]
  /** Total de la factura */
  total: number
  /** Moneda */
  currency: string
  /** Código de Autorización Electrónica */
  cae: string
  /** Fecha de vencimiento del CAE (timestamp) */
  caeExpiredDate: number
  /** Fecha de emisión (timestamp) */
  emitedDate: number
  /** Fecha de inicio del servicio (timestamp) */
  startDate?: number
  /** Fecha de fin del servicio (timestamp) */
  endDate?: number
  /** Fecha de vencimiento de pago (timestamp) */
  expiredDate?: number
  /** Código QR en base64 */
  qrCode: string
}

export interface IInvoice extends Document {
  _id: Types.ObjectId
  id: number
  uid: string
  type: InvoiceType
  data: IAFIPData | Record<string, unknown>
  file?: Types.ObjectId
  account: Types.ObjectId
  receiptId?: Types.ObjectId
  movementId?: Types.ObjectId
  createdBy?: Types.ObjectId
  updatedBy?: Types.ObjectId
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    uid: {
      type: String,
      unique: true,
    },
    type: {
      type: String,
      enum: Object.values(InvoiceTypes),
      required: true,
      default: 'AFIP',
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    file: {
      type: Schema.Types.ObjectId,
      ref: 'File',
    },
    account: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    receiptId: {
      type: Schema.Types.ObjectId,
      ref: 'Receipt',
    },
    movementId: {
      type: Schema.Types.ObjectId,
      ref: 'Movement',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: Date,
    deletedAt: Date,
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    collection: 'invoices',
    timestamps: false,
  }
)

// Add middleware
addUidMiddleware(InvoiceSchema)
addSoftDeleteMiddleware(InvoiceSchema)

// Indexes
InvoiceSchema.index({ account: 1 })
InvoiceSchema.index({ receiptId: 1 })
InvoiceSchema.index({ type: 1 })
InvoiceSchema.index({ createdAt: -1 })
InvoiceSchema.index({ deletedAt: 1 })

const Invoice: ExtendedModel<IInvoice> =
  (mongoose.models.Invoice as ExtendedModel<IInvoice>) ||
  mongoose.model<IInvoice>('Invoice', InvoiceSchema) as ExtendedModel<IInvoice>

export default Invoice
