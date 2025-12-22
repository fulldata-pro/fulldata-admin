import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'

export enum AuthProviders {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
}

export interface IUser extends Document {
  _id: Types.ObjectId
  id: number
  uid: string
  accounts: Types.ObjectId[]
  email: string
  password?: string
  firstName: string
  lastName: string
  avatar?: string
  phone?: string
  phoneCountryCode?: string
  googleId?: string
  provider?: AuthProviders
  emailVerifiedAt?: Date
  phoneVerifiedAt?: Date
  onboardingCreditUsedAt?: Date
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const UserSchema = new Schema<IUser>(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    uid: {
      type: String,
      unique: true,
    },
    accounts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Account',
      },
    ],
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: String,
    phone: {
      type: String,
      trim: true,
    },
    phoneCountryCode: {
      type: String,
      trim: true,
    },
    googleId: String,
    provider: {
      type: String,
      enum: Object.values(AuthProviders),
      default: AuthProviders.LOCAL,
    },
    emailVerifiedAt: Date,
    phoneVerifiedAt: Date,
    onboardingCreditUsedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: Date,
    deletedAt: Date,
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    collection: 'users',
    timestamps: false,
  }
)

// Add middleware to generate uid from _id
addUidMiddleware(UserSchema)

// Indexes
// Note: email index is already created by unique: true
UserSchema.index({ deletedAt: 1 })

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
