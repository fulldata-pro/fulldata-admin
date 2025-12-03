import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'
import { ServicesType, AccountCreditSource, AccountCreditStatus } from '@/lib/constants'

export interface ICreditMetadata {
  purchasePrice?: number
  currency?: string
  promotionCode?: string
  description?: string
}

export interface IAccountCredits extends Document {
  id: number
  uid: string
  accountId: Types.ObjectId
  searchType: string
  proxyId: Types.ObjectId
  batchId: string
  amount: number
  remaining: number
  expiresAt: Date | null
  source: string
  createdAt: Date
  movementId?: Types.ObjectId
  status: string
  consumedAt?: Date
  archivedAt?: Date
  metadata?: ICreditMetadata
  updatedAt: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const AccountCreditsSchema = new Schema<IAccountCredits>(
  {
    id: { type: Number, required: true, unique: true },
    uid: { type: String, unique: true },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    searchType: {
      type: String,
      enum: Object.values(ServicesType),
      required: true,
      index: true,
    },
    proxyId: {
      type: Schema.Types.ObjectId,
      ref: 'Proxy',
      required: true,
      index: true,
    },
    batchId: {
      type: String,
      unique: true,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    remaining: {
      type: Number,
      required: true,
      min: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    source: {
      type: String,
      enum: Object.values(AccountCreditSource),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(AccountCreditStatus),
      default: AccountCreditStatus.ACTIVE,
      required: true,
    },
    consumedAt: { type: Date },
    archivedAt: { type: Date },
    movementId: {
      type: Schema.Types.ObjectId,
      ref: 'Movement',
    },
    metadata: {
      purchasePrice: { type: Number },
      currency: { type: String },
      promotionCode: { type: String },
      description: { type: String },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'account_credits',
    timestamps: true,
  }
)

// Índices optimizados para consultas frecuentes
AccountCreditsSchema.index({
  accountId: 1,
  searchType: 1,
  proxyId: 1,
  status: 1,
})
AccountCreditsSchema.index({ expiresAt: 1, status: 1 })
AccountCreditsSchema.index({ accountId: 1, status: 1, remaining: 1 })
AccountCreditsSchema.index({ archivedAt: 1 })

// Add middlewares
addUidMiddleware(AccountCreditsSchema)
addSoftDeleteMiddleware(AccountCreditsSchema)

// Hook para actualizar status automáticamente
AccountCreditsSchema.pre('save', function (next) {
  // Auto-marcar como expirado si ha pasado la fecha
  if (
    this.expiresAt &&
    this.expiresAt <= new Date() &&
    this.status === AccountCreditStatus.ACTIVE
  ) {
    this.status = AccountCreditStatus.EXPIRED
    this.remaining = 0
  }
  // Auto-marcar como consumido si no queda nada
  if (this.remaining === 0 && this.status === AccountCreditStatus.ACTIVE) {
    this.status = AccountCreditStatus.CONSUMED
    if (!this.consumedAt) {
      this.consumedAt = new Date()
    }
  }
  next()
})

const AccountCredits: Model<IAccountCredits> =
  mongoose.models.AccountCredits || mongoose.model<IAccountCredits>('AccountCredits', AccountCreditsSchema)

export default AccountCredits
