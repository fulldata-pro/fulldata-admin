import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IUser extends Document {
  _id: Types.ObjectId
  uid: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  phoneCountryCode?: string
  avatar?: string
  authMethod: 'LOCAL' | 'GOOGLE'
  emailVerifiedAt?: Date
  phoneVerifiedAt?: Date
  onboardingCreditUsedAt?: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      default: () => `usr_${new Types.ObjectId().toString()}`,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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
    phone: {
      type: String,
      trim: true,
    },
    phoneCountryCode: {
      type: String,
      trim: true,
    },
    avatar: String,
    authMethod: {
      type: String,
      enum: ['LOCAL', 'GOOGLE'],
      default: 'LOCAL',
    },
    emailVerifiedAt: Date,
    phoneVerifiedAt: Date,
    onboardingCreditUsedAt: Date,
    deletedAt: Date,
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    collection: 'users',
    timestamps: true,
  }
)

// Indexes
// Note: email index is already created by unique: true
UserSchema.index({ deletedAt: 1 })

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
