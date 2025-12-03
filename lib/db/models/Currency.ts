import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'

export interface IExchangeRate {
  code: string
  rate: number
  updatedAt?: Date
}

export interface ICurrency extends Document {
  id: number
  uid: string
  name: string
  decimal: number
  exchangeRate?: IExchangeRate[]
  paymentMethodId?: Types.ObjectId
  createdAt: Date
  updatedAt?: Date
  updatedBy?: Types.ObjectId
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const ExchangeRateSchema = new Schema<IExchangeRate>(
  {
    code: { type: String, required: true },
    rate: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const CurrencySchema = new Schema<ICurrency>(
  {
    id: { type: Number, required: true, unique: true },
    uid: { type: String, unique: true },
    name: { type: String, required: true },
    decimal: { type: Number, default: 2 },
    exchangeRate: [ExchangeRateSchema],
    paymentMethodId: { type: Schema.Types.ObjectId, ref: 'PaymentMethod' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'currencies',
    timestamps: false,
  }
)

// Add middleware
addUidMiddleware(CurrencySchema)
addSoftDeleteMiddleware(CurrencySchema)

const Currency: Model<ICurrency> =
  mongoose.models.Currency || mongoose.model<ICurrency>('Currency', CurrencySchema)

export default Currency
