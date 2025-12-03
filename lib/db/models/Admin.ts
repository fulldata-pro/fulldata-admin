import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import bcrypt from 'bcryptjs'
import { AdminRoles, AdminStatus, AdminRole, AdminStatusType } from '@/lib/constants'

export interface IAdmin extends Document {
  _id: Types.ObjectId
  uid: string
  name: string
  email: string
  password: string
  phone?: string
  avatar?: string
  role: AdminRole
  status: AdminStatusType
  lastLoginAt?: Date
  createdBy?: Types.ObjectId
  updatedBy?: Types.ObjectId
  deletedAt?: Date
  deletedBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

interface IAdminModel extends Model<IAdmin> {
  findByEmail(email: string): Promise<IAdmin | null>
}

const AdminSchema = new Schema<IAdmin>(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      default: () => `adm_${new Types.ObjectId().toString()}`,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(AdminRoles),
      default: AdminRoles.ADMIN,
    },
    status: {
      type: String,
      enum: Object.values(AdminStatus),
      default: AdminStatus.ACTIVE,
    },
    lastLoginAt: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    collection: 'admins',
    timestamps: true,
  }
)

// Hash password before saving
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Method to compare passwords
AdminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Static method to find by email
AdminSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email, deletedAt: null }).select('+password')
}

// Indexes
// Note: email index is already created by unique: true
AdminSchema.index({ role: 1 })
AdminSchema.index({ status: 1 })
AdminSchema.index({ deletedAt: 1 })

const Admin: IAdminModel =
  (mongoose.models.Admin as IAdminModel) ||
  mongoose.model<IAdmin, IAdminModel>('Admin', AdminSchema)

export default Admin
