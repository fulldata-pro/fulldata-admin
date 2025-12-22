import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { DiscountType, DiscountTypeType } from '@/lib/constants/discount.constants'
import { addUidMiddleware } from '../helpers/uid-middleware'

/**
 * Discount Code Schema
 *
 * Maneja códigos de descuento/cupones para la compra de tokens
 */

export interface IDiscountCodeUsage {
  accountId: Types.ObjectId
  usedAt: Date
  tokensAmount: number
  discountApplied: number
  currency: string
  receiptId?: Types.ObjectId
}

export interface IDiscountCode extends Document {
  _id: Types.ObjectId
  id: number
  uid: string

  // Información básica
  code: string
  name: string
  description?: string

  // Configuración del descuento
  type: DiscountTypeType
  value: number

  // Aplicabilidad
  applicableCurrencies?: string[]
  minimumPurchase?: number
  maximumDiscount?: number

  // Restricciones de uso
  maxUses?: number
  maxUsesPerAccount?: number
  currentUses: number

  // Restricciones de tiempo
  validFrom?: Date
  validUntil?: Date

  // Restricciones de cuenta
  restrictToAccounts?: Types.ObjectId[]
  excludeAccounts?: Types.ObjectId[]
  requiresVerification?: boolean
  firstPurchaseOnly?: boolean

  // Estado
  isEnabled: boolean
  termsAndConditions?: string
  usageHistory?: IDiscountCodeUsage[]

  // Campos de auditoría
  createdBy?: Types.ObjectId
  createdAt: Date
  updatedBy?: Types.ObjectId
  updatedAt?: Date
  deletedBy?: Types.ObjectId
  deletedAt?: Date
}

const DiscountCodeSchema = new Schema<IDiscountCode>(
  {
    id: { type: Number, unique: true, required: true },
    uid: { type: String, unique: true },

    // Información básica
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,

    // Configuración del descuento
    type: {
      type: String,
      enum: Object.values(DiscountType),
      required: true
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },

    // Aplicabilidad
    applicableCurrencies: [{
      type: String,
      uppercase: true
    }],
    minimumPurchase: {
      type: Number,
      min: 0
    },
    maximumDiscount: {
      type: Number,
      min: 0
    },

    // Restricciones de uso
    maxUses: Number,
    maxUsesPerAccount: {
      type: Number,
      default: 1
    },
    currentUses: {
      type: Number,
      default: 0,
      min: 0
    },

    // Restricciones de tiempo
    validFrom: Date,
    validUntil: Date,

    // Restricciones de cuenta
    restrictToAccounts: [{
      type: Schema.Types.ObjectId,
      ref: 'Account'
    }],
    excludeAccounts: [{
      type: Schema.Types.ObjectId,
      ref: 'Account'
    }],
    requiresVerification: {
      type: Boolean,
      default: false
    },
    firstPurchaseOnly: {
      type: Boolean,
      default: false
    },

    // Estado
    isEnabled: {
      type: Boolean,
      default: true,
      index: true
    },
    termsAndConditions: String,

    // Historial de uso
    usageHistory: [{
      accountId: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
      },
      usedAt: {
        type: Date,
        default: Date.now
      },
      tokensAmount: Number,
      discountApplied: Number,
      currency: String,
      receiptId: {
        type: Schema.Types.ObjectId,
        ref: 'Receipt'
      }
    }],

    // Campos de auditoría
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date }
  },
  {
    collection: 'discount_codes',
    timestamps: false
  }
)

// Middleware para generar uid desde _id
addUidMiddleware(DiscountCodeSchema)

// Índices optimizados
DiscountCodeSchema.index({ code: 1, isEnabled: 1, deletedAt: 1 })
DiscountCodeSchema.index({ validUntil: 1, isEnabled: 1 })
DiscountCodeSchema.index({ 'usageHistory.accountId': 1 })

const DiscountCode: Model<IDiscountCode> =
  mongoose.models.DiscountCode || mongoose.model<IDiscountCode>('DiscountCode', DiscountCodeSchema)

export default DiscountCode
