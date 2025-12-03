import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'

export interface IProvince extends Document {
  id: number
  uid: string
  name: string
  country: Types.ObjectId
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const ProvinceSchema = new Schema<IProvince>(
  {
    id: { type: Number, required: true, unique: true },
    uid: { type: String, unique: true },
    name: { type: String, required: true },
    country: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'provinces',
    timestamps: false,
  }
)

// Add middleware
addUidMiddleware(ProvinceSchema)
addSoftDeleteMiddleware(ProvinceSchema)

const Province: Model<IProvince> =
  mongoose.models.Province || mongoose.model<IProvince>('Province', ProvinceSchema)

export default Province
