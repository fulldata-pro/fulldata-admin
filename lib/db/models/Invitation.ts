import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'
import { InvitationStatus } from '@/lib/constants'

export interface IInvitation extends Document {
  id: number
  uid: string
  account: Types.ObjectId
  user?: Types.ObjectId
  email: string
  role: string
  status: string
  createdBy?: Types.ObjectId
  createdAt: Date
  updatedAt?: Date
  expiredAt?: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const InvitationSchema = new Schema<IInvitation>(
  {
    id: { type: Number, required: true, unique: true },
    uid: { type: String, unique: true },
    account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true },
    role: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(InvitationStatus),
      default: InvitationStatus.PENDING,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    expiredAt: { type: Date },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'invitations',
    timestamps: false,
  }
)

// Add middleware
addUidMiddleware(InvitationSchema)
addSoftDeleteMiddleware(InvitationSchema)

const Invitation: Model<IInvitation> =
  mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema)

export default Invitation
