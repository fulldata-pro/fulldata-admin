import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'
import { ReferralType } from '@/lib/constants'

export interface IReferral extends Document {
  id: number
  uid: string
  type: string
  amount: number
  balance: number
  account: Types.ObjectId
  referred?: Types.ObjectId
  receipt?: Types.ObjectId
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const ReferralSchema = new Schema<IReferral>(
  {
    id: { type: Number, required: true, unique: true },
    uid: { type: String, unique: true },
    type: {
      type: String,
      enum: Object.values(ReferralType),
      required: true,
    },
    amount: { type: Number, required: true },
    balance: { type: Number, required: true },
    account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    referred: { type: Schema.Types.ObjectId, ref: 'Account' },
    receipt: { type: Schema.Types.ObjectId, ref: 'Receipt' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'referrals',
    timestamps: false,
  }
)

// Add middleware
addUidMiddleware(ReferralSchema)
addSoftDeleteMiddleware(ReferralSchema)

const Referral: Model<IReferral> =
  mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema)

export default Referral
