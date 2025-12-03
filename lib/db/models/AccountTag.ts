import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'

export interface IAccountTag extends Document {
  id: number
  uid: string
  name: string
  type: string
  account: Types.ObjectId
  createdBy?: Types.ObjectId
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const AccountTagSchema = new Schema<IAccountTag>(
  {
    id: { type: Number, required: true, unique: true },
    uid: { type: String, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'account_tags',
    timestamps: false,
  }
)

// Add middleware
addUidMiddleware(AccountTagSchema)
addSoftDeleteMiddleware(AccountTagSchema)

const AccountTag: Model<IAccountTag> =
  mongoose.models.AccountTag || mongoose.model<IAccountTag>('AccountTag', AccountTagSchema)

export default AccountTag
