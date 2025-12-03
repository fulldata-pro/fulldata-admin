import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'
import { RequestStatus } from '@/lib/constants'

interface IRequestRelation {
  request: Types.ObjectId
  type: string
}

export interface IRequest extends Document {
  id: number
  uid: string
  type: string
  accountTagId?: Types.ObjectId
  countryCode: string
  isDuplicated?: boolean
  metadata?: object
  prompts?: object
  intelligenceData?: any
  responseId?: string
  error?: object
  expiresAt?: Date
  status: string
  version?: string
  relations?: IRequestRelation[]
  accountId: Types.ObjectId
  userId?: Types.ObjectId
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const RequestRelationSchema = new Schema<IRequestRelation>(
  {
    request: { type: Schema.Types.ObjectId, ref: 'Request', required: true },
    type: { type: String, required: true },
  },
  { _id: false }
)

const RequestSchema = new Schema<IRequest>(
  {
    id: { type: Number, required: true, unique: true },
    uid: { type: String, unique: true },
    type: { type: String, required: true },
    accountTagId: { type: Schema.Types.ObjectId, ref: 'AccountTag' },
    countryCode: { type: String, required: true },
    isDuplicated: { type: Boolean, default: false },
    metadata: { type: Object },
    prompts: { type: Object },
    intelligenceData: { type: Schema.Types.Mixed },
    responseId: { type: String },
    error: { type: Object },
    expiresAt: { type: Date },
    status: {
      type: String,
      enum: Object.values(RequestStatus),
      default: RequestStatus.PENDING,
    },
    version: { type: String },
    relations: [RequestRelationSchema],
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'requests',
    timestamps: false,
  }
)

// Add middleware
addUidMiddleware(RequestSchema)
addSoftDeleteMiddleware(RequestSchema)

const Request: Model<IRequest> =
  mongoose.models.Request || mongoose.model<IRequest>('Request', RequestSchema)

export default Request
