import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { ReceiptStatus, ReceiptStatusType } from '@/lib/constants'
import { addUidMiddleware } from '../helpers/uid-middleware'

export interface IReceiptTokens {
  /** Cantidad de tokens comprados */
  quantity: number
  /** Precio unitario del token en la moneda del recibo */
  unitPrice: number
}

export interface IReceipt extends Document {
  _id: Types.ObjectId
  /** ID numérico del recibo */
  id: number
  /** UID del recibo */
  uid: string
  /** Estado del recibo */
  status: ReceiptStatusType
  /** Mensaje del estado */
  statusMessage?: string
  /** Monto total */
  total: number
  /** Subtotal (antes de aplicar descuentos) */
  subtotal: number
  /** Moneda de la transacción */
  currency: string
  /** Método de pago */
  paymentMethodId?: Types.ObjectId
  /** Información de tokens comprados */
  tokens?: IReceiptTokens
  /** Beneficio adherido */
  benefitId?: Types.ObjectId
  /** Código de descuento aplicado */
  discountCodeId?: Types.ObjectId
  /** Descuento por volumen aplicado */
  bulkDiscountId?: Types.ObjectId
  /** ID de transacción del proveedor de pago (MercadoPago, Stripe, etc.) */
  providerTransactionId?: string
  /** URL de pago del proveedor */
  providerTransactionUrl?: string
  /** Cuenta vinculada al recibo */
  accountId: Types.ObjectId
  /** Factura generada para este recibo */
  invoiceId?: Types.ObjectId
  /** Fecha de vencimiento */
  expiredAt: Date
  /** Usuario creador */
  createdBy?: Types.ObjectId
  /** Fecha de creación */
  createdAt: Date
  /** Fecha de actualización */
  updatedAt?: Date
  /** Fecha de eliminación */
  deletedAt?: Date
  /** Usuario eliminador */
  deletedBy?: Types.ObjectId
}

const ReceiptTokensSchema = new Schema<IReceiptTokens>(
  {
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
)

const ReceiptSchema = new Schema<IReceipt>(
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
    status: {
      type: String,
      enum: Object.values(ReceiptStatus),
      default: ReceiptStatus.PENDING,
    },
    statusMessage: String,
    total: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    tokens: {
      type: ReceiptTokensSchema,
      required: false,
    },
    paymentMethodId: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentMethod',
    },
    providerTransactionId: String,
    providerTransactionUrl: String,
    benefitId: {
      type: Schema.Types.ObjectId,
      ref: 'Benefit',
    },
    discountCodeId: {
      type: Schema.Types.ObjectId,
      ref: 'DiscountCode',
    },
    bulkDiscountId: {
      type: Schema.Types.ObjectId,
      ref: 'BulkDiscount',
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    expiredAt: {
      type: Date,
      required: true,
    },
    createdBy: {
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
    collection: 'receipts',
    timestamps: false,
  }
)

// Add middleware to generate uid from _id
addUidMiddleware(ReceiptSchema)

// Indexes
ReceiptSchema.index({ accountId: 1 })
ReceiptSchema.index({ status: 1 })
ReceiptSchema.index({ createdAt: -1 })
ReceiptSchema.index({ deletedAt: 1 })

const Receipt: Model<IReceipt> =
  mongoose.models.Receipt || mongoose.model<IReceipt>('Receipt', ReceiptSchema)

export default Receipt
