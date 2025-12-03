import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'
import { NotificationType, notificationTypes } from './types/notification-types'

export interface INotification extends Document {
  accountId: Types.ObjectId
  userId?: Types.ObjectId
  type: NotificationType
  customTitle?: string
  customMessage?: string
  link?: string
  metadata?: Record<string, any>
  sendEmail?: boolean
  emailSentAt?: Date
  createdBy?: Types.ObjectId
  createdAt: Date
  readAt?: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const NotificationSchema = new Schema<INotification>(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: notificationTypes,
      required: true,
    },
    customTitle: { type: String },
    customMessage: { type: String },
    link: { type: String },
    metadata: { type: Schema.Types.Mixed },
    sendEmail: { type: Boolean, default: false },
    emailSentAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    readAt: { type: Date, default: null },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'notifications',
    timestamps: false,
  }
)

// Índice compuesto para consultas eficientes
NotificationSchema.index({ accountId: 1, createdAt: -1 })
NotificationSchema.index({ accountId: 1, readAt: 1, createdAt: -1 })
NotificationSchema.index({ userId: 1, createdAt: -1 })
NotificationSchema.index({ accountId: 1, userId: 1, createdAt: -1 })

// Add soft delete middleware
addSoftDeleteMiddleware(NotificationSchema)

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)

export default Notification
