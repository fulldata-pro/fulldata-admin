import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { ServiceType, ServicesType, CurrencyType, Currencies } from '@/lib/constants'

export interface IPrompt {
  key: string
  match?: string
  type: 'any' | 'number' | 'text'
}

export interface IPrice {
  amount: number
  currency: CurrencyType
}

export interface IProxyService {
  type: ServiceType
  prices: IPrice[]
  isEnabled: boolean
  hideInSearchForm: boolean
  prompts: IPrompt[]
}

export interface IProxy extends Document {
  _id: Types.ObjectId
  uid: string
  name: string
  countryCode: string
  services: IProxyService[]
  deletedAt?: Date
  deletedBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const PromptSchema = new Schema<IPrompt>(
  {
    key: {
      type: String,
      required: true,
    },
    match: String,
    type: {
      type: String,
      enum: ['any', 'number', 'text'],
      default: 'any',
    },
  },
  { _id: false }
)

const PriceSchema = new Schema<IPrice>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: Object.values(Currencies),
      required: true,
    },
  },
  { _id: false }
)

const ServiceSchema = new Schema<IProxyService>(
  {
    type: {
      type: String,
      enum: Object.values(ServicesType),
      required: true,
    },
    prices: [PriceSchema],
    isEnabled: {
      type: Boolean,
      default: true,
    },
    hideInSearchForm: {
      type: Boolean,
      default: false,
    },
    prompts: [PromptSchema],
  },
  { _id: false }
)

const ProxySchema = new Schema<IProxy>(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      default: () => `prx_${new Types.ObjectId().toString()}`,
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
    services: [ServiceSchema],
    deletedAt: Date,
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    collection: 'proxies',
    timestamps: true,
  }
)

// Indexes
ProxySchema.index({ countryCode: 1 })
ProxySchema.index({ 'services.type': 1 })
ProxySchema.index({ deletedAt: 1 })

const Proxy: Model<IProxy> =
  mongoose.models.Proxy || mongoose.model<IProxy>('Proxy', ProxySchema)

export default Proxy
