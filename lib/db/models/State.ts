import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'

export interface IState extends Document {
  id: number
  uid: string
  name: string
  country: Types.ObjectId
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const StateSchema = new Schema<IState>(
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
    collection: 'states',
    timestamps: false,
  }
)

// Add indexes for common queries
StateSchema.index({ name: 1 })
StateSchema.index({ country: 1 })
StateSchema.index({ name: 1, country: 1 })

// Add middleware
addUidMiddleware(StateSchema)
addSoftDeleteMiddleware(StateSchema)

const State: Model<IState> =
  mongoose.models.State || mongoose.model<IState>('State', StateSchema)

export default State
