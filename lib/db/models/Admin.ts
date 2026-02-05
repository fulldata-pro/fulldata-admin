import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import bcrypt from 'bcryptjs'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'

export enum AdminStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

export interface IAdmin extends Document {
  id: number
  uid: string
  name: string
  avatar?: string
  phone?: string
  email: string
  password: string
  status: AdminStatus
  role: AdminRole
  lastLoginAt?: Date
  createdBy?: Types.ObjectId
  createdAt: Date
  updatedBy?: Types.ObjectId
  updatedAt?: Date
  deletedBy?: Types.ObjectId
  deletedAt?: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

interface IAdminModel extends Model<IAdmin> {
  findByEmail(email: string): Promise<IAdmin | null>
}

const AdminSchema = new Schema<IAdmin>(
  {
    id: { type: Number, required: true, unique: true },
    uid: { type: String, unique: true },
    name: { type: String, required: true },
    avatar: { type: String },
    phone: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(AdminStatus),
      default: AdminStatus.ACTIVE,
    },
    role: {
      type: String,
      enum: Object.values(AdminRole),
      required: true,
    },
    lastLoginAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    createdAt: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    updatedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    deletedAt: { type: Date },
  },
  {
    collection: 'admins',
    timestamps: false,
  }
)

// Unique email only among non-deleted records
AdminSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } })

// Agregar middleware para generar uid desde _id
addUidMiddleware(AdminSchema)

// Agregar middleware para soft delete
addSoftDeleteMiddleware(AdminSchema)

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

const Admin: IAdminModel =
  (mongoose.models.Admin as IAdminModel) ||
  mongoose.model<IAdmin, IAdminModel>('Admin', AdminSchema)

export default Admin
