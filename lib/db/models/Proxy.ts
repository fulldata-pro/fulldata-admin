import mongoose, { Schema, Document, Types } from 'mongoose'
import { ServiceType, ServicesType } from '@/lib/constants'
import { ExtendedModel, DocumentCommon } from '@/lib/db/types/model.types'

export interface IProxyPrompt {
  key: string
  match: string
  type: 'any' | 'number' | 'text'
}

export interface IProxyService {
  type: ServiceType
  tokenCost: number
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

const ProxyServiceSchema = new Schema<IProxyService>(
  {
    type: {
      type: String,
      enum: Object.values(ServicesType),
      required: true,
    },
    tokenCost: {
      type: Number,
      required: true,
      min: 0,
    },
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
      default: [],
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

// Pre-save middleware to generate uid from _id
ProxySchema.pre('save', function (next) {
  if (!this.uid && this._id) {
    this.uid = `prx_${this._id.toString()}`
  }
  next()
})

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
