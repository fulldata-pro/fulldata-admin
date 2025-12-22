import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'
import { MovementType, MovementStatus } from '@/lib/constants/movement.constants'

// Re-export para mantener compatibilidad con imports existentes
export { MovementType, MovementStatus }

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
  // Token amount (positivo para compras/bonus, negativo para consumos)
  tokenAmount?: number

  // Tipo de servicio (solo para consumos: PEOPLE, COMPANIES, etc.)
  serviceType?: string

  // General
  description?: string
  ipAddress?: string
  userAgent?: string

  // Payment/discount info - Desglose completo
  discountCode?: string           // Código de descuento usado (si aplica)
  discountAmount?: number          // Monto TOTAL descontado (suma de todos los descuentos)
  originalPrice?: number           // Precio original sin descuentos

  // Desglose de descuentos aplicados
  bulkDiscountAmount?: number      // Monto descontado por volumen/cantidad
  bulkDiscountPercentage?: number  // Porcentaje de descuento por volumen
  codeDiscountAmount?: number      // Monto descontado por código
  codeDiscountPercentage?: number  // Porcentaje de descuento por código

  // Payment info
  paymentId?: string
  completedAt?: Date
}

export interface IMovement extends Document {
  id: number
  uid: string
  type: MovementType
  status: MovementStatus
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
    // Token amount (positivo para compras/bonus, negativo para consumos)
    tokenAmount: { type: Number },

    // Tipo de servicio (solo para consumos)
    serviceType: { type: String },

    // General
    description: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },

    // Payment/discount info - Desglose completo
    discountCode: { type: String },
    discountAmount: { type: Number },
    originalPrice: { type: Number },

    // Desglose de descuentos aplicados
    bulkDiscountAmount: { type: Number },
    bulkDiscountPercentage: { type: Number },
    codeDiscountAmount: { type: Number },
    codeDiscountPercentage: { type: Number },

    // Payment info
    paymentId: { type: String },
    completedAt: { type: Date },
  },
  { _id: false }
)

const MovementSchema = new Schema<IMovement>(
  {
    id: { type: Number, required: true, unique: true },
    uid: { type: String, unique: true },
    type: {
      type: String,
      enum: Object.values(MovementType),
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
