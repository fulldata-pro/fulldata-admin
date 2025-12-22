import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'

/**
 * Bulk Discount Schema
 *
 * Maneja descuentos por cantidad/volumen para compras de tokens
 */

export interface IDiscountTier {
  minTokens: number
  maxTokens?: number
  discountPercentage: number
  label?: string
  isEnabled?: boolean
}

export interface IBulkDiscountStats {
  totalUses: number
  totalTokensSold: number
  totalDiscountGiven: number
  lastUsedAt?: Date
}

export interface IBulkDiscount extends Document {
  _id: Types.ObjectId
  id: number
  uid: string

  // Información básica
  name: string
  description?: string
  isDefault?: boolean

  // Tiers de descuento
  tiers: IDiscountTier[]

  // Aplicabilidad
  applicableCurrencies?: string[]
  applicableCountries?: string[]

  // Relación con token_pricing
  linkedPricings?: Types.ObjectId[]

  // Restricciones
  requiresVerification?: boolean
  minAccountAge?: number
  restrictToAccounts?: Types.ObjectId[]
  excludeAccounts?: Types.ObjectId[]

  // Vigencia
  validFrom?: Date
  validUntil?: Date
  isEnabled: boolean

  // Prioridad
  priority: number

  // Estadísticas
  stats?: IBulkDiscountStats

  // Campos de auditoría
  createdBy?: Types.ObjectId
  createdAt: Date
  updatedBy?: Types.ObjectId
  updatedAt?: Date
  deletedBy?: Types.ObjectId
  deletedAt?: Date
}

const BulkDiscountSchema = new Schema<IBulkDiscount>(
  {
    id: { type: Number, unique: true, required: true },
    uid: { type: String, unique: true },

    // Información básica
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: String,
    isDefault: {
      type: Boolean,
      default: false
    },

    // Tiers de descuento
    tiers: [{
      minTokens: {
        type: Number,
        required: true,
        min: 1
      },
      maxTokens: {
        type: Number,
        min: 1
      },
      discountPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      label: String,
      isEnabled: {
        type: Boolean,
        default: true
      }
    }],

    // Aplicabilidad
    applicableCurrencies: [{
      type: String,
      uppercase: true
    }],
    applicableCountries: [{
      type: String,
      uppercase: true
    }],

    // Relación con token_pricing
    linkedPricings: [{
      type: Schema.Types.ObjectId,
      ref: 'TokenPricing'
    }],

    // Restricciones
    requiresVerification: {
      type: Boolean,
      default: false
    },
    minAccountAge: {
      type: Number,
      min: 0
    },
    restrictToAccounts: [{
      type: Schema.Types.ObjectId,
      ref: 'Account'
    }],
    excludeAccounts: [{
      type: Schema.Types.ObjectId,
      ref: 'Account'
    }],

    // Vigencia
    validFrom: Date,
    validUntil: Date,
    isEnabled: {
      type: Boolean,
      default: true,
      index: true
    },

    // Prioridad
    priority: {
      type: Number,
      default: 0,
      index: true
    },

    // Estadísticas
    stats: {
      totalUses: {
        type: Number,
        default: 0
      },
      totalTokensSold: {
        type: Number,
        default: 0
      },
      totalDiscountGiven: {
        type: Number,
        default: 0
      },
      lastUsedAt: Date
    },

    // Campos de auditoría
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date }
  },
  {
    collection: 'bulk_discounts',
    timestamps: false
  }
)

// Middleware para generar uid desde _id
addUidMiddleware(BulkDiscountSchema)

// Índices optimizados
BulkDiscountSchema.index({ isEnabled: 1, priority: -1, deletedAt: 1 })
BulkDiscountSchema.index({ applicableCurrencies: 1, isEnabled: 1 })
BulkDiscountSchema.index({ validUntil: 1, isEnabled: 1 })

const BulkDiscount: Model<IBulkDiscount> =
  mongoose.models.BulkDiscount || mongoose.model<IBulkDiscount>('BulkDiscount', BulkDiscountSchema)

export default BulkDiscount
