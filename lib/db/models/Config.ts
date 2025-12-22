import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'

export enum ConfigReferralType {
  PERCENTAGE = 'PERCENTAGE',
  AMOUNT = 'AMOUNT',
}

export interface IConfig extends Document {
  searches: {
    expirations: {
      time: number
      isEnabled: boolean
    }
  }
  referrals: {
    account: {
      isEnabled: boolean
      type: ConfigReferralType
      amount: number
      maxAmount: number
    }
    referred: {
      isEnabled: boolean
      type: ConfigReferralType
      amount: number
      maxAmount: number
    }
    limits: {
      referrals: number
      referred: number
    }
    minAmount: number
  }
  benefit: {
    firstPurchase: {
      isEnabled: boolean
      type: ConfigReferralType
      amount: number
      maxAmount: number
    }
  }
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const ConfigSchema = new Schema<IConfig>(
  {
    searches: {
      expirations: {
        time: { type: Number, default: 90 },
        isEnabled: { type: Boolean, default: true },
      },
    },
    referrals: {
      account: {
        isEnabled: { type: Boolean, default: true },
        type: {
          type: String,
          enum: Object.values(ConfigReferralType),
          default: ConfigReferralType.PERCENTAGE,
        },
        amount: { type: Number, default: 0.05 },
        maxAmount: { type: Number, default: 25 },
      },
      referred: {
        isEnabled: { type: Boolean, default: true },
        type: {
          type: String,
          enum: Object.values(ConfigReferralType),
          default: ConfigReferralType.AMOUNT,
        },
        amount: { type: Number, default: 25 },
        maxAmount: { type: Number, default: 0 },
      },
      limits: {
        referrals: { type: Number, default: 2 },
        referred: { type: Number, default: 0 },
      },
      minAmount: { type: Number, default: 10 },
    },
    benefit: {
      firstPurchase: {
        isEnabled: { type: Boolean, default: true },
        type: {
          type: String,
          enum: Object.values(ConfigReferralType),
          default: ConfigReferralType.AMOUNT,
        },
        amount: { type: Number, default: 50 },
        maxAmount: { type: Number, default: 50 },
      },
    },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'config',
    timestamps: true,
  }
)

// Agregar middleware para soft delete
addSoftDeleteMiddleware(ConfigSchema)

const Config: Model<IConfig> =
  mongoose.models.Config || mongoose.model<IConfig>('Config', ConfigSchema)

export default Config
