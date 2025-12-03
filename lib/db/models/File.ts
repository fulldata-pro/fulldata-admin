import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { addUidMiddleware } from '../helpers/uid-middleware'
import { addSoftDeleteMiddleware } from '../helpers/soft-delete-middleware'

export interface IFile extends Document {
  id: number
  uid: string
  fileName: string
  fileSize: number
  fileType: string
  urlView?: string
  urlDownload?: string
  storageKey: string
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
  deletedBy?: Types.ObjectId
}

const FileSchema = new Schema<IFile>(
  {
    id: { type: Number, required: true, unique: true },
    uid: { type: String, unique: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileType: { type: String, required: true },
    urlView: { type: String },
    urlDownload: { type: String },
    storageKey: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'files',
    timestamps: false,
  }
)

// Add middleware
addUidMiddleware(FileSchema)
addSoftDeleteMiddleware(FileSchema)

const File: Model<IFile> =
  mongoose.models.File || mongoose.model<IFile>('File', FileSchema)

export default File
