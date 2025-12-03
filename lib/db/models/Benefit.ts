import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { BenefitAdvantageType, BenefitAdvantageTypes } from '@/lib/constants'

export interface IBenefitAdvantage {
  type: BenefitAdvantageType
  value: number
}

export interface IBenefitUse {
  accountId: Types.ObjectId
  receiptId: Types.ObjectId
  usedAt: Date
}

export interface IBenefit extends Document {
  _id: Types.ObjectId
  uid: string
  name: string
  description?: string
  code: string
  advantage: IBenefitAdvantage
  isEnabled: boolean
  startDate?: Date
  endDate?: Date
  beneficiaries?: Types.ObjectId[]
  uses: IBenefitUse[]
  minimumPurchase?: number
  selfApply: boolean
  maxUses?: number
  maxUsesPerAccount?: number
  deletedAt?: Date
  deletedBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const AdvantageSchema = new Schema<IBenefitAdvantage>(
  {
    type: {
      type: String,
      enum: Object.values(BenefitAdvantageTypes),
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
)

const UseSchema = new Schema<IBenefitUse>(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    receiptId: {
      type: Schema.Types.ObjectId,
      ref: 'Receipt',
      required: true,
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
)

const BenefitSchema = new Schema<IBenefit>(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      default: () => `ben_${new Types.ObjectId().toString()}`,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    advantage: {
      type: AdvantageSchema,
      required: true,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    startDate: Date,
    endDate: Date,
    beneficiaries: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Account',
      },
    ],
    uses: [UseSchema],
    minimumPurchase: {
      type: Number,
      min: 0,
    },
    selfApply: {
      type: Boolean,
      default: false,
    },
    maxUses: {
      type: Number,
      min: 1,
    },
    maxUsesPerAccount: {
      type: Number,
      min: 1,
    },
    deletedAt: Date,
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    collection: 'benefits',
    timestamps: true,
  }
)

// Indexes
BenefitSchema.index({ code: 1 })
BenefitSchema.index({ isEnabled: 1 })
BenefitSchema.index({ startDate: 1, endDate: 1 })
BenefitSchema.index({ deletedAt: 1 })

const Benefit: Model<IBenefit> =
  mongoose.models.Benefit || mongoose.model<IBenefit>('Benefit', BenefitSchema)

export default Benefit
