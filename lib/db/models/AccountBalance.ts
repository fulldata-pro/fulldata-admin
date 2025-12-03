import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { ServiceType, ServicesType } from '@/lib/constants'

export interface ISearchBalance {
  type: ServiceType
  proxyId: Types.ObjectId
  totalAvailable: number
  totalPurchased: number
  totalSubscription: number
  totalConsumed: number
  nextExpiration?: Date
}

export interface IAccountBalance extends Document {
  _id: Types.ObjectId
  accountId: Types.ObjectId
  searchBalances: ISearchBalance[]
  deletedAt?: Date
  deletedBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const SearchBalanceSchema = new Schema<ISearchBalance>(
  {
    type: {
      type: String,
      enum: Object.values(ServicesType),
      required: true,
    },
    proxyId: {
      type: Schema.Types.ObjectId,
      ref: 'Proxy',
      required: true,
    },
    totalAvailable: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPurchased: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSubscription: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalConsumed: {
      type: Number,
      default: 0,
      min: 0,
    },
    nextExpiration: Date,
  },
  { _id: false }
)

const AccountBalanceSchema = new Schema<IAccountBalance>(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      unique: true,
    },
    searchBalances: [SearchBalanceSchema],
    deletedAt: Date,
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    collection: 'account_balances',
    timestamps: true,
  }
)

// Indexes
AccountBalanceSchema.index({ accountId: 1 })
AccountBalanceSchema.index({ 'searchBalances.proxyId': 1, 'searchBalances.type': 1 })
AccountBalanceSchema.index({ deletedAt: 1 })

const AccountBalance: Model<IAccountBalance> =
  mongoose.models.AccountBalance ||
  mongoose.model<IAccountBalance>('AccountBalance', AccountBalanceSchema)

export default AccountBalance
