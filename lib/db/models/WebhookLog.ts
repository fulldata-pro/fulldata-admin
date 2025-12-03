import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'
import { WebhookEvent, WebhookLogStatus } from '@/lib/constants'

export interface IWebhookLog extends Document {
  id: number
  uid: string
  accountApiId: Types.ObjectId
  accountId: Types.ObjectId
  event: string
  url: string
  requestHeaders?: Record<string, string>
  requestId?: string
  responseStatus?: number
  responseHeaders?: Record<string, string>
  status: string
  error?: string
  executionTime?: number
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const WebhookLogSchema = new Schema<IWebhookLog>(
  {
    id: { type: Number, required: true, unique: true },
    uid: { type: String, unique: true },
    accountApiId: { type: Schema.Types.ObjectId, ref: 'AccountApi', required: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    event: {
      type: String,
      enum: Object.values(WebhookEvent),
      required: true,
    },
    url: { type: String, required: true },
    requestHeaders: { type: Schema.Types.Mixed },
    requestId: { type: String },
    responseStatus: { type: Number },
    responseHeaders: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: Object.values(WebhookLogStatus),
      required: true,
      default: WebhookLogStatus.SUCCESS,
    },
    error: { type: String },
    executionTime: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'webhook_logs',
    timestamps: false,
  }
)

// Índices para búsquedas eficientes
WebhookLogSchema.index({ accountId: 1, createdAt: -1 })
WebhookLogSchema.index({ accountApiId: 1, createdAt: -1 })
WebhookLogSchema.index({ status: 1 })

// Add middleware
addUidMiddleware(WebhookLogSchema)
addSoftDeleteMiddleware(WebhookLogSchema)

const WebhookLog: Model<IWebhookLog> =
  mongoose.models.WebhookLog || mongoose.model<IWebhookLog>('WebhookLog', WebhookLogSchema)

export default WebhookLog
