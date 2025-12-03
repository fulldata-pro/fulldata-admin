import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISearchExpiration {
  time: number
  isEnabled: boolean
}

export interface IReferralConfig {
  isEnabled: boolean
  type: 'PERCENTAGE' | 'FIXED'
  amount: number
  maxAmountPerAccount?: number
  maxAmountPerReferred?: number
}

export interface IBenefitFirstPurchase {
  isEnabled: boolean
  benefitId?: string
}

export interface IConfig extends Document {
  searches: {
    expirations: ISearchExpiration
  }
  referrals: IReferralConfig
  benefits: {
    firstPurchase: IBenefitFirstPurchase
  }
  createdAt: Date
  updatedAt: Date
}

const SearchExpirationSchema = new Schema<ISearchExpiration>(
  {
    time: {
      type: Number,
      default: 30,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
)

const ReferralConfigSchema = new Schema<IReferralConfig>(
  {
    isEnabled: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['PERCENTAGE', 'FIXED'],
      default: 'PERCENTAGE',
    },
    amount: {
      type: Number,
      default: 10,
    },
    maxAmountPerAccount: Number,
    maxAmountPerReferred: Number,
  },
  { _id: false }
)

const BenefitFirstPurchaseSchema = new Schema<IBenefitFirstPurchase>(
  {
    isEnabled: {
      type: Boolean,
      default: false,
    },
    benefitId: String,
  },
  { _id: false }
)

const ConfigSchema = new Schema<IConfig>(
  {
    searches: {
      expirations: {
        type: SearchExpirationSchema,
        default: {},
      },
    },
    referrals: {
      type: ReferralConfigSchema,
      default: {},
    },
    benefits: {
      firstPurchase: {
        type: BenefitFirstPurchaseSchema,
        default: {},
      },
    },
  },
  {
    collection: 'config',
    timestamps: true,
  }
)

const Config: Model<IConfig> =
  mongoose.models.Config || mongoose.model<IConfig>('Config', ConfigSchema)

export default Config
