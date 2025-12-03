import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'

export interface ICountry extends Document {
  id: number
  uid: string
  name: string
  alpha2Code: string
  alpha3Code: string
  callingCode: string
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const CountrySchema = new Schema<ICountry>(
  {
    id: { type: Number, required: true, unique: true },
    uid: { type: String, unique: true },
    name: { type: String, required: true },
    alpha2Code: { type: String, required: true, unique: true },
    alpha3Code: { type: String, required: true, unique: true },
    callingCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'countries',
    timestamps: false,
  }
)

// Add middleware
addUidMiddleware(CountrySchema)
addSoftDeleteMiddleware(CountrySchema)

const Country: Model<ICountry> =
  mongoose.models.Country || mongoose.model<ICountry>('Country', CountrySchema)

export default Country
