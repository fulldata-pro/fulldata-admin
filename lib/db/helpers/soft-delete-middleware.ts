import { Schema } from "mongoose";

/**
 * Agrega middleware de soft delete a un schema de Mongoose.
 * Filtra automáticamente documentos con deletedAt no nulo en todas las operaciones de búsqueda.
 *
 * @param schema - El schema de Mongoose al cual agregar el middleware
 */
export function addSoftDeleteMiddleware(schema: Schema): void {
  // Middleware para find y findOne
  const findMiddleware = function (this: any) {
    // Solo agregar el filtro si no se está buscando explícitamente documentos eliminados
    if (!this.getOptions().includeDeleted) {
      this.where({ deletedAt: null });
    }
  };

  // Middleware para findOneAndUpdate
  const findOneAndUpdateMiddleware = function (this: any) {
    if (!this.getOptions().includeDeleted) {
      this.where({ deletedAt: null });
    }
  };

  // Aplicar middleware a todas las operaciones de búsqueda
  schema.pre("find", findMiddleware);
  schema.pre("findOne", findMiddleware);
  schema.pre("findOneAndUpdate", findOneAndUpdateMiddleware);
  schema.pre("findOneAndDelete", findOneAndUpdateMiddleware);
  schema.pre("findOneAndReplace", findOneAndUpdateMiddleware);
  schema.pre("countDocuments", findMiddleware);
  schema.pre("countDocuments", findMiddleware);
  schema.pre("distinct", findMiddleware);

  // Método helper para soft delete
  schema.methods.softDelete = function (deletedBy?: any) {
    this.deletedAt = new Date();
    if (deletedBy) {
      this.deletedBy = deletedBy;
    }
    return this.save();
  };

  // Método helper para restaurar
  schema.methods.restore = function () {
    this.deletedAt = null;
    this.deletedBy = null;
    return this.save();
  };

  // Método estático para encontrar documentos eliminados
  schema.statics.findDeleted = function () {
    return this.find({ deletedAt: { $ne: null } });
  };

  // Método estático para encontrar con documentos eliminados incluidos
  schema.statics.findWithDeleted = function () {
    return this.find({}).setOptions({ includeDeleted: true });
  };


  // Método estático para obtener el siguiente ID secuencial
  // Incluye documentos eliminados para evitar colisiones de ID
  schema.statics.getNextId = async function() {
    const lastDoc = await this.findOne()
      .setOptions({ includeDeleted: true })
      .sort({ id: -1 })
      .select('id')
      .lean();
    return lastDoc ? lastDoc.id + 1 : 1;
  };
}
