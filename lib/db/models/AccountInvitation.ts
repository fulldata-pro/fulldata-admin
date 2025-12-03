import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'
import { AccountInvitationRole } from '@/lib/constants'
import crypto from 'crypto'

export interface IAccountInvitation extends Document {
  account: Types.ObjectId
  email: string
  role: string
  token: string
  expiresAt: Date
  createdAt: Date
  acceptedAt?: Date
  acceptedBy?: Types.ObjectId
  rejectedAt?: Date
  rejectedBy?: Types.ObjectId
  createdBy: Types.ObjectId
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const AccountInvitationSchema = new Schema<IAccountInvitation>(
  {
    account: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(AccountInvitationRole),
      default: AccountInvitationRole.MEMBER,
      required: true,
    },
    token: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(32).toString('hex'),
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: { type: Date },
    acceptedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: { type: Date },
    rejectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'account_invitations',
    timestamps: false,
  }
)

// Indexes
AccountInvitationSchema.index({ account: 1, email: 1 })
AccountInvitationSchema.index({ expiresAt: 1 })

// Add soft delete middleware
addSoftDeleteMiddleware(AccountInvitationSchema)

// Instance methods
AccountInvitationSchema.methods.isAccepted = function (): boolean {
  return !!this.acceptedAt
}

AccountInvitationSchema.methods.isRejected = function (): boolean {
  return !!this.rejectedAt
}

AccountInvitationSchema.methods.canBeAccepted = function (): boolean {
  const isExpired = new Date() > this.expiresAt
  return !isExpired && !this.isAccepted() && !this.isRejected() && !this.deletedAt
}

// Check for existing pending invitations before creating new one
AccountInvitationSchema.pre('save', async function (next) {
  if (this.isNew) {
    const existingInvitation = await (this.constructor as any).findOne({
      account: this.account,
      email: this.email,
      acceptedAt: null,
      rejectedAt: null,
      deletedAt: null,
      expiresAt: { $gt: new Date() },
    })
    if (existingInvitation) {
      const error = new Error('Ya existe una invitación pendiente para este email en esta cuenta')
      ;(error as any).code = 'INVITATION_EXISTS'
      throw error
    }
  }
  next()
})

const AccountInvitation: Model<IAccountInvitation> =
  mongoose.models.AccountInvitation ||
  mongoose.model<IAccountInvitation>('AccountInvitation', AccountInvitationSchema)

export default AccountInvitation
