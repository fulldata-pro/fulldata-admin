import { Schema } from 'mongoose';

/**
 * Agrega un middleware pre-save al schema para generar automáticamente
 * el campo uid desde el _id de MongoDB
 * @param schema - El schema de Mongoose al que se le agregará el middleware
 */
export function addUidMiddleware(schema: Schema<any>): void {
  schema.pre('save', function(next) {
    if (this.isNew && !this.uid && this._id) {
      this.uid = this._id.toString();
    }
    next();
  });
}
