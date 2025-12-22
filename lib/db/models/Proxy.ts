import mongoose, { Schema, Document, Types } from 'mongoose'
import { ServiceType, ServicesType } from '@/lib/constants'
import { ExtendedModel, DocumentCommon } from '@/lib/db/types/model.types'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'

export interface IProxyPrompt {
  key: string
  match: string
  type: 'any' | 'number' | 'text'
}

export interface IProxyServicePrice {
  amount: number
  currency: string
}

export interface IProxyService {
  type: ServiceType

  // Sistema de tokens (nuevo)
  tokenCost?: number // Costo en tokens del servicio

  // Sistema de precios legacy (mantener temporalmente para migración)
  prices: IProxyServicePrice[]

  isEnabled: boolean
  hideInSearchForm?: boolean
  prompts: IProxyPrompt[]
  updatedBy?: Types.ObjectId
  updatedAt?: Date
}

export interface IProxy extends Document, DocumentCommon {
  id: number
  uid: string
  name: string
  countryCode: string
  services: IProxyService[]
  currency: string
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const ProxyPromptSchema = new Schema<IProxyPrompt>(
  {
    key: { type: String, required: true },
    match: { type: String, required: true },
    type: { type: String, enum: ['any', 'number', 'text'], required: true },
  },
  { _id: false }
)

const ProxyServicePriceSchema = new Schema<IProxyServicePrice>(
  {
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
  },
  { _id: false }
)

const ProxyServiceSchema = new Schema<IProxyService>(
  {
    type: {
      type: String,
      enum: Object.values(ServicesType),
      required: true,
    },

    // Sistema de tokens (nuevo)
    tokenCost: { type: Number, min: 0 }, // Costo en tokens, opcional por ahora

    // Sistema legacy (mantener temporalmente)
    prices: { type: [ProxyServicePriceSchema], required: true },

    isEnabled: {
      type: Boolean,
      default: true,
    },
    hideInSearchForm: {
      type: Boolean,
      default: false,
    },
    prompts: {
      type: [ProxyPromptSchema],
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    updatedAt: Date,
  },
  { _id: false }
)

const ProxySchema = new Schema<IProxy>(
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    countryCode: {
      type: String,
      required: true,
      uppercase: true,
    },
    services: {
      type: [ProxyServiceSchema],
      default: [],
    },
    currency: {
      type: String,
      required: true,
    },
    deletedAt: Date,
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    collection: 'proxies',
    timestamps: true,
  }
)

// Agregar middleware para generar uid desde _id
addUidMiddleware(ProxySchema)

// Agregar middleware para soft delete
addSoftDeleteMiddleware(ProxySchema)

// Indexes
ProxySchema.index({ countryCode: 1 })
ProxySchema.index({ 'services.type': 1 })
ProxySchema.index({ deletedAt: 1 })

// Static method to get next ID
ProxySchema.statics.getNextId = async function (): Promise<number> {
  const lastDoc = await this.findOne().sort({ id: -1 }).select('id').lean()
  return ((lastDoc as { id?: number })?.id || 0) + 1
}

const Proxy =
  (mongoose.models.Proxy as ExtendedModel<IProxy>) ||
  mongoose.model<IProxy, ExtendedModel<IProxy>>('Proxy', ProxySchema)

export default Proxy
