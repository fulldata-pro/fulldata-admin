import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { AccountStatus, AccountStatusType } from '@/lib/constants'
import { addUidMiddleware } from '../helpers/uid-middleware'

export interface IBilling {
  taxId?: string
  name?: string
  type?: 'person' | 'company'
  address?: string
  city?: string
  zip?: string
  state?: Types.ObjectId
  country?: Types.ObjectId
  activity?: string
  incomeTaxType?: string
  vatType?: string
  verifiedAt?: Date
}

export interface IAccountUser {
  user: Types.ObjectId
  role: string
  addedAt: Date
}

export interface IAccount extends Document {
  _id: Types.ObjectId
  uid: string
  name?: string
  type?: string
  email: string
  phone?: string
  status: AccountStatusType
  billing: IBilling
  maxRequestsPerDay?: number
  maxRequestsPerMonth?: number
  webhookEnabled: boolean
  apiEnabled: boolean
  users: IAccountUser[]
  benefits: Types.ObjectId[]
  referralCode?: string
  referralBalance: number
  deletedAt?: Date | null
  deletedBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const BillingSchema = new Schema<IBilling>(
  {
    taxId: String,
    name: String,
    type: {
      type: String,
      enum: ['person', 'company'],
    },
    address: String,
    city: String,
    zip: String,
    state: {
      type: Schema.Types.ObjectId,
      ref: 'State',
    },
    country: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
    },
    activity: String,
    incomeTaxType: String,
    vatType: String,
    verifiedAt: Date,
  },
  { _id: false }
)

const AccountSchema = new Schema<IAccount>(
  {
    uid: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.PENDING,
    },
    billing: {
      type: BillingSchema,
      default: {},
    },
    maxRequestsPerDay: {
      type: Number,
      default: 100,
    },
    maxRequestsPerMonth: {
      type: Number,
      default: 1000,
    },
    webhookEnabled: {
      type: Boolean,
      default: false,
    },
    apiEnabled: {
      type: Boolean,
      default: false,
    },
    users: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          default: 'MEMBER',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        _id: false,
      },
    ],
    benefits: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Benefit',
      },
    ],
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referralBalance: {
      type: Number,
      default: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    collection: 'accounts',
    timestamps: true,
  }
)

// Add middleware to generate uid from _id
addUidMiddleware(AccountSchema)

// Indexes
// Note: referralCode index is already created by unique: true
AccountSchema.index({ email: 1 })
AccountSchema.index({ status: 1 })
AccountSchema.index({ deletedAt: 1 })
AccountSchema.index({ 'billing.taxId': 1 })

const Account: Model<IAccount> =
  mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema)

export default Account
