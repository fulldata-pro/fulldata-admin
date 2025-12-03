import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { ReceiptStatus, ReceiptStatusType, ServiceType, ServicesType } from '@/lib/constants'

export interface ISearchPurchased {
  proxyId: Types.ObjectId
  serviceType: ServiceType
  quantity: number
  cost: number
  costUSD: number
}

export interface IReceiptExtra {
  type: 'TAX' | 'DISCOUNT'
  key: string
  amount: number
  amountUSD: number
}

export interface IReceipt extends Document {
  _id: Types.ObjectId
  uid: string
  status: ReceiptStatusType
  statusMessage?: string
  total: number
  totalUSD: number
  subtotal: number
  subtotalUSD: number
  currency: string
  exchangeRate: number
  searches: ISearchPurchased[]
  extra: IReceiptExtra[]
  paymentMethodId?: Types.ObjectId
  benefitId?: Types.ObjectId
  accountId: Types.ObjectId
  invoiceId?: Types.ObjectId
  transactionId?: string
  deletedAt?: Date
  deletedBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const SearchPurchasedSchema = new Schema<ISearchPurchased>(
  {
    proxyId: {
      type: Schema.Types.ObjectId,
      ref: 'Proxy',
      required: true,
    },
    serviceType: {
      type: String,
      enum: Object.values(ServicesType),
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    cost: {
      type: Number,
      required: true,
    },
    costUSD: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
)

const ExtraSchema = new Schema<IReceiptExtra>(
  {
    type: {
      type: String,
      enum: ['TAX', 'DISCOUNT'],
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    amountUSD: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
)

const ReceiptSchema = new Schema<IReceipt>(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      default: () => `rcp_${new Types.ObjectId().toString()}`,
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
    totalUSD: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    subtotalUSD: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    exchangeRate: {
      type: Number,
      default: 1,
    },
    searches: [SearchPurchasedSchema],
    extra: [ExtraSchema],
    paymentMethodId: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentMethod',
    },
    benefitId: {
      type: Schema.Types.ObjectId,
      ref: 'Benefit',
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
    transactionId: String,
    deletedAt: Date,
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    collection: 'receipts',
    timestamps: true,
  }
)

// Indexes
ReceiptSchema.index({ accountId: 1 })
ReceiptSchema.index({ status: 1 })
ReceiptSchema.index({ createdAt: -1 })
ReceiptSchema.index({ deletedAt: 1 })

const Receipt: Model<IReceipt> =
  mongoose.models.Receipt || mongoose.model<IReceipt>('Receipt', ReceiptSchema)

export default Receipt
