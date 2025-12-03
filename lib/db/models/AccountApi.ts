import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'
import { ServicesType, WebhookEvent } from '@/lib/constants'

export interface IWebhookConfig {
  type: string
  url: string
  events: string[]
  headers?: Record<string, string>
  isEnabled: boolean
}

export interface IAccountApi extends Document {
  id: number
  uid: string
  isEnabled: boolean
  accountId: Types.ObjectId
  apiKey: string
  webhooks: IWebhookConfig[]
  createdBy?: Types.ObjectId
  updatedBy?: Types.ObjectId
  deletedBy?: Types.ObjectId
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
}

const WebhookConfigSchema = new Schema<IWebhookConfig>(
  {
    type: {
      type: String,
      enum: Object.values(ServicesType),
      required: true,
    },
    url: { type: String, required: true },
    events: {
      type: [String],
      enum: Object.values(WebhookEvent),
      default: [],
    },
    headers: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isEnabled: { type: Boolean, default: true },
  },
  { _id: false }
)

const AccountApiSchema = new Schema<IAccountApi>(
  {
    id: { type: Number, required: true, unique: true },
    uid: { type: String, unique: true },
    isEnabled: { type: Boolean, default: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, unique: true },
    apiKey: { type: String, required: true, unique: true },
    webhooks: { type: [WebhookConfigSchema] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
  },
  {
    collection: 'account_apis',
    timestamps: false,
  }
)

// Add middleware
addUidMiddleware(AccountApiSchema)
addSoftDeleteMiddleware(AccountApiSchema)

// Índices para optimizar queries
AccountApiSchema.index({ 'webhooks.type': 1 })

const AccountApi: Model<IAccountApi> =
  mongoose.models.AccountApi || mongoose.model<IAccountApi>('AccountApi', AccountApiSchema)

export default AccountApi
