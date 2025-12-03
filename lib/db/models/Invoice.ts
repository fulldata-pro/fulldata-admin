import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { InvoiceType, InvoiceTypes } from '@/lib/constants'

export interface IAFIPData {
  cae: string
  caeExpiration: Date
  invoiceNumber: number
  pointOfSale: number
  invoiceType: string
  qrCode?: string
}

export interface IInvoice extends Document {
  _id: Types.ObjectId
  uid: string
  type: InvoiceType
  data: IAFIPData | Record<string, unknown>
  file?: string
  accountId: Types.ObjectId
  receiptId: Types.ObjectId
  movementId?: Types.ObjectId
  createdBy?: Types.ObjectId
  updatedBy?: Types.ObjectId
  deletedAt?: Date
  deletedBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      default: () => `inv_${new Types.ObjectId().toString()}`,
    },
    type: {
      type: String,
      enum: Object.values(InvoiceTypes),
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    file: String,
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    receiptId: {
      type: Schema.Types.ObjectId,
      ref: 'Receipt',
      required: true,
    },
    movementId: {
      type: Schema.Types.ObjectId,
      ref: 'Movement',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    deletedAt: Date,
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    collection: 'invoices',
    timestamps: true,
  }
)

// Indexes
InvoiceSchema.index({ accountId: 1 })
InvoiceSchema.index({ receiptId: 1 })
InvoiceSchema.index({ type: 1 })
InvoiceSchema.index({ createdAt: -1 })
InvoiceSchema.index({ deletedAt: 1 })

const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema)

export default Invoice
