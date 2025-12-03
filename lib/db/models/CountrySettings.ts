import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'

interface ICountrySettingName {
  id: string
  name: string
  isLegalEntity?: boolean
}

interface ISalarySchema {
  min: number
  max: number
  label: string
}

interface IEstimatedBilling {
  fe: number
  min: number | null
  max: number | null
  average: number
}

export interface ICountrySettings extends Document {
  id: number
  uid: string
  country: Types.ObjectId
  activities?: ICountrySettingName[]
  incomeTaxType?: ICountrySettingName[]
  salaryRange?: ISalarySchema[]
  estimatedBilling: IEstimatedBilling[]
  vatType?: ICountrySettingName[]
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const CountrySettingNameSchema = new Schema<ICountrySettingName>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    isLegalEntity: { type: Boolean, required: false },
  },
  { _id: false }
)

const SalarySchema = new Schema<ISalarySchema>(
  {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
)

const EstimatedBillingSchema = new Schema<IEstimatedBilling>(
  {
    fe: { type: Number, required: true },
    min: { type: Number, required: false, default: null },
    max: { type: Number, required: false, default: null },
    average: { type: Number, required: true },
  },
  { _id: false }
)

const CountrySettingsSchema = new Schema<ICountrySettings>(
  {
    id: { type: Number, required: true, unique: true },
    uid: { type: String, unique: true },
    country: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
    activities: [CountrySettingNameSchema],
    incomeTaxType: [CountrySettingNameSchema],
    salaryRange: [SalarySchema],
    estimatedBilling: [EstimatedBillingSchema],
    vatType: [CountrySettingNameSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'country_settings',
    timestamps: false,
  }
)

// Add middleware
addUidMiddleware(CountrySettingsSchema)
addSoftDeleteMiddleware(CountrySettingsSchema)

const CountrySettings: Model<ICountrySettings> =
  mongoose.models.CountrySettings || mongoose.model<ICountrySettings>('CountrySettings', CountrySettingsSchema)

export default CountrySettings
