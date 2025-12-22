import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'

/**
 * Token Pricing Schema
 *
 * Define el precio de los tokens por región/moneda y los paquetes disponibles.
 * Permite gestionar diferentes precios por país y ofertas especiales.
 */

export interface ITokenPackage {
  id: string
  name: string              // "Starter", "Professional", "Enterprise"
  amount: number           // Cantidad de tokens en el paquete
  price: number           // Precio del paquete en la moneda local
  discount: number        // Porcentaje de descuento sobre precio base
  popular?: boolean       // Marcar como destacado
  maxPurchases?: number   // Límite de compras por cuenta (opcional)
  validFrom?: Date        // Fecha desde la cual está disponible
  validUntil?: Date       // Fecha hasta la cual está disponible
  description?: string    // Descripción del paquete
}

export interface IPriceHistory {
  price: number
  packagePrices?: ITokenPackage[]
  validFrom: Date
  validUntil?: Date
  changedBy: Types.ObjectId
  changeReason?: string
}

export interface ITokenPricing extends Document {
  // Identificadores
  id: number
  uid: string

  // Configuración regional
  countryCode: string     // AR, MX, US, BR, GLOBAL
  currency: string        // ARS, USD, MXN, BRL

  // Precio base del token
  price: number           // Precio de 1 token en moneda local
  minPurchase: number     // Cantidad mínima de tokens para compra
  maxPurchase?: number    // Cantidad máxima de tokens por transacción

  // Paquetes con descuentos
  packages: ITokenPackage[]

  // Historial de precios (para auditoría y análisis)
  priceHistory: IPriceHistory[]

  // Estado
  isEnabled: boolean
  updatedStatusAt?: Date

  // Campos de auditoría
  createdBy?: Types.ObjectId
  createdAt?: Date
  updatedBy?: Types.ObjectId
  updatedAt?: Date
  deletedBy?: Types.ObjectId
  deletedAt?: Date
}

const TokenPackageSchema = new Schema<ITokenPackage>(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    maxPurchases: Number,
    validFrom: Date,
    validUntil: Date,
    description: String,
  },
  { _id: false }
)

const PriceHistorySchema = new Schema<IPriceHistory>(
  {
    price: {
      type: Number,
      required: true,
    },
    packagePrices: [TokenPackageSchema],
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: Date,
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changeReason: String,
  },
  { _id: false }
)

const TokenPricingSchema = new Schema<ITokenPricing>(
  {
    id: {
      type: Number,
      unique: true,
      required: true,
    },
    uid: {
      type: String,
      unique: true,
    },

    // Configuración regional
    countryCode: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },

    // Precio base
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    minPurchase: {
      type: Number,
      required: true,
      default: 100,
      min: 1,
    },
    maxPurchase: {
      type: Number,
      min: 1,
    },

    // Paquetes
    packages: {
      type: [TokenPackageSchema],
      default: [],
    },

    // Historial
    priceHistory: {
      type: [PriceHistorySchema],
      default: [],
    },

    // Estado
    isEnabled: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
    updatedStatusAt: Date,

    // Campos de auditoría
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedAt: {
      type: Date,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    collection: 'token_pricing',
    timestamps: false,
  }
)

// Agregar middleware para generar uid desde _id
addUidMiddleware(TokenPricingSchema)

// Agregar soft delete middleware
addSoftDeleteMiddleware(TokenPricingSchema)

// Índices optimizados
TokenPricingSchema.index({ countryCode: 1, currency: 1, isEnabled: 1, deletedAt: 1 }, { unique: true })
TokenPricingSchema.index({ isEnabled: 1, deletedAt: 1 })

const TokenPricing: Model<ITokenPricing> =
  mongoose.models.TokenPricing || mongoose.model<ITokenPricing>('TokenPricing', TokenPricingSchema)

export default TokenPricing
