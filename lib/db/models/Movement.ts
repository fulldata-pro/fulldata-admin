import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'
import { MovementTypes, MovementStatus } from '@/lib/constants'

export interface ISearchBalance {
  quantity: number
  expiration: Date
}

export interface IMovementSearch {
  proxy?: Types.ObjectId
  type: string
  balance?: ISearchBalance
}

export interface IMovementMetadata {
  paymentProvider?: string
  preferenceId?: string | null
  amount?: number
  currency?: string
  items?: Array<{
    id: string
    title: string
    description?: string
    quantity: number
    unitPrice: number
  }>
}

export interface IMovement extends Document {
  id: number
  uid: string
  type: string
  status: string
  searches: IMovementSearch[]
  requestId?: Types.ObjectId[]
  receiptId?: Types.ObjectId
  accountId: Types.ObjectId
  expirationAt: Date | null
  metadata?: IMovementMetadata
  createdBy?: Types.ObjectId
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const SearchBalanceSchema = new Schema<ISearchBalance>(
  {
    quantity: { type: Number, required: true },
    expiration: { type: Date, required: true },
  },
  { _id: false }
)

const MovementSearchSchema = new Schema<IMovementSearch>(
  {
    proxy: { type: Schema.Types.ObjectId, ref: 'Proxy' },
    type: { type: String, required: true },
    balance: SearchBalanceSchema,
  },
  { _id: false }
)

const MovementMetadataSchema = new Schema<IMovementMetadata>(
  {
    paymentProvider: { type: String },
    preferenceId: { type: String },
    amount: { type: Number },
    currency: { type: String },
    items: [
      {
        id: { type: String },
        title: { type: String },
        description: { type: String },
        quantity: { type: Number },
        unitPrice: { type: Number },
      },
    ],
  },
  { _id: false }
)

const MovementSchema = new Schema<IMovement>(
  {
    id: { type: Number, required: true, unique: true },
    uid: { type: String, unique: true },
    type: {
      type: String,
      enum: Object.values(MovementTypes),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(MovementStatus),
      default: MovementStatus.PENDING,
      required: true,
    },
    searches: { type: [MovementSearchSchema], required: true },
    requestId: [{ type: Schema.Types.ObjectId, ref: 'Request' }],
    receiptId: { type: Schema.Types.ObjectId, ref: 'Receipt' },
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    expirationAt: { type: Date, default: null },
    metadata: { type: MovementMetadataSchema },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'movements',
    timestamps: false,
  }
)

// Add middleware
addUidMiddleware(MovementSchema)
addSoftDeleteMiddleware(MovementSchema)

const Movement: Model<IMovement> =
  mongoose.models.Movement || mongoose.model<IMovement>('Movement', MovementSchema)

export default Movement
