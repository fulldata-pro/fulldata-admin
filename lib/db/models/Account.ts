import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import {
  AccountStatus,
  AccountStatusType,
  AccountType,
  AccountTypeValue,
  AccountBillingType,
  AccountBillingTypeValue,
  AccountInvitationRole,
} from '@/lib/constants'
import { addUidMiddleware } from '../helpers/uid-middleware'

export interface IServiceConfig {
  maxRequestsPerDay?: number
  maxRequestsPerMonth?: number
  webhookEnabled?: boolean
  apiEnabled?: boolean
  didit?: {
    apiKey?: string
    workflowId?: string
  }
}

export interface IBilling {
  taxId?: string
  name?: string
  type?: AccountBillingTypeValue
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

export interface IAccountBenefit {
  benefit: Types.ObjectId
  appliedAt: Date
  expiresAt?: Date
}

export interface IAccount extends Document {
  _id: Types.ObjectId
  uid: string
  name: string
  avatar?: string
  billing?: IBilling
  /** @deprecated Use billing.type instead */
  type?: AccountTypeValue
  status: AccountStatusType
  serviceConfig?: IServiceConfig
  webhooks?: any
  users: IAccountUser[]
  benefits: IAccountBenefit[]
  referredBy?: Types.ObjectId
  referralCode?: string
  referralBalance?: number
  /** @deprecated Accounts no longer expire */
  expiration?: Date
  createdBy?: Types.ObjectId
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date | null
  deletedBy?: Types.ObjectId
}

const ServiceConfigSchema = new Schema<IServiceConfig>(
  {
    maxRequestsPerDay: { type: Number },
    maxRequestsPerMonth: { type: Number },
    webhookEnabled: { type: Boolean, default: false },
    apiEnabled: { type: Boolean, default: false },
    didit: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  { _id: false, strict: false }
)

const BillingSchema = new Schema<IBilling>(
  {
    taxId: String,
    name: String,
    type: {
      type: String,
      enum: Object.values(AccountBillingType),
      default: AccountBillingType.INDIVIDUAL,
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

const AccountUserSchema = new Schema<IAccountUser>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      default: AccountInvitationRole.MEMBER,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
)

const AccountBenefitSchema = new Schema<IAccountBenefit>(
  {
    benefit: {
      type: Schema.Types.ObjectId,
      ref: 'Benefit',
      required: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: Date,
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
      required: true,
      trim: true,
    },
    avatar: String,
    billing: BillingSchema,
    /** @deprecated Use billing.type instead */
    type: {
      type: String,
      enum: Object.values(AccountType),
      default: AccountType.INDIVIDUAL,
    },
    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.PENDING,
    },
    serviceConfig: ServiceConfigSchema,
    webhooks: Schema.Types.Mixed,
    users: [AccountUserSchema],
    benefits: [AccountBenefitSchema],
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referralBalance: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: Date,
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    /** @deprecated Accounts no longer expire */
    expiration: Date,
  },
  {
    collection: 'accounts',
    timestamps: false,
  }
)

// Add middleware to generate uid from _id
addUidMiddleware(AccountSchema)

// Indexes
AccountSchema.index({ status: 1 })
AccountSchema.index({ deletedAt: 1 })
AccountSchema.index({ 'billing.taxId': 1 })

const Account: Model<IAccount> =
  mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema)

export default Account
