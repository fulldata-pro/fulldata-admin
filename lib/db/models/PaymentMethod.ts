import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'
import { PaymentMethodType, PaymentMethodAccepted } from '@/lib/constants'

export interface IPaymentMethod extends Document {
  id: number
  uid: string
  type: string
  name: string
  icon?: string
  color?: string
  currency: string
  acceptedMethods?: string[]
  isEnabled: boolean
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    id: { type: Number, required: true, unique: true },
    uid: { type: String, unique: true },
    type: {
      type: String,
      enum: Object.values(PaymentMethodType),
      required: true,
    },
    name: { type: String, required: true },
    icon: { type: String },
    color: { type: String },
    currency: { type: String, required: true, default: 'ARS' },
    acceptedMethods: [
      {
        type: String,
        enum: Object.values(PaymentMethodAccepted),
      },
    ],
    isEnabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'payment_methods',
    timestamps: false,
  }
)

// Add middleware
addUidMiddleware(PaymentMethodSchema)
addSoftDeleteMiddleware(PaymentMethodSchema)

const PaymentMethod: Model<IPaymentMethod> =
  mongoose.models.PaymentMethod || mongoose.model<IPaymentMethod>('PaymentMethod', PaymentMethodSchema)

export default PaymentMethod
