import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'

/**
 * Account Token Balance Schema
 *
 * Mantiene el balance de tokens de una cuenta.
 * Reemplaza completamente el sistema de créditos con un balance unificado simple.
 * Los tokens NO expiran, simplificando enormemente la lógica.
 */

export interface IAccountTokenBalance extends Document {
  // Identificadores
  id: number
  uid: string
  accountId: Types.ObjectId

  // Balance principal (lo único necesario para operaciones)
  totalAvailable: number // Tokens disponibles actualmente

  // Histórico para auditoría y analytics
  totalPurchased: number // Total comprado históricamente
  totalBonus: number // Total bonificaciones recibidas
  totalConsumed: number // Total consumido históricamente
  totalRefunded: number // Total devuelto

  // Analytics de consumo por servicio (opcional, podría ir en otra colección)
  consumptionByService?: {
    [key: string]: {
      tokensUsed: number
      searchCount: number
      lastUsed?: Date
    }
  }

  // Campos de auditoría
  createdBy?: Types.ObjectId
  createdAt?: Date
  updatedBy?: Types.ObjectId
  updatedAt?: Date
  deletedBy?: Types.ObjectId
  deletedAt?: Date
}

const AccountTokenBalanceSchema = new Schema<IAccountTokenBalance>(
  {
    id: { type: Number, unique: true, required: true },
    uid: { type: String, unique: true },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      unique: true,
    },

    // Balance principal
    totalAvailable: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      index: true, // Índice para queries rápidas de verificación
    },

    // Histórico
    totalPurchased: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalBonus: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalConsumed: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalRefunded: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // Analytics opcional - usando Schema.Types.Mixed para permitir $inc en campos anidados dinámicos
    consumptionByService: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // Campos de auditoría
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  {
    collection: 'account_token_balances',
    timestamps: false,
  }
)

// Agregar middleware para generar uid desde _id
addUidMiddleware(AccountTokenBalanceSchema)

// Agregar soft delete middleware
addSoftDeleteMiddleware(AccountTokenBalanceSchema)

// Índices optimizados
AccountTokenBalanceSchema.index({ accountId: 1, deletedAt: 1 })
AccountTokenBalanceSchema.index({ totalAvailable: 1, deletedAt: 1 })

const AccountTokenBalance: Model<IAccountTokenBalance> =
  mongoose.models.AccountTokenBalance ||
  mongoose.model<IAccountTokenBalance>('AccountTokenBalance', AccountTokenBalanceSchema)

export default AccountTokenBalance
