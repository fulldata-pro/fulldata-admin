import { Model, Document, Types } from 'mongoose';

/**
 * Interfaz genérica para modelos de Mongoose con métodos extendidos
 *
 * Incluye:
 * - Métodos de soft delete (findWithDeleted, findDeleted, findOnlyDeleted)
 * - Utilidades comunes (getNextId)
 *
 * @template T - El tipo del documento que extiende de Document
 *
 * @example
 * ```typescript
 * import { ExtendedModel } from '@/lib/db/types/model.types';
 *
 * interface IUser extends Document {
 *   name: string;
 *   email: string;
 * }
 *
 * const User = model<IUser, ExtendedModel<IUser>>('User', UserSchema);
 *
 * ```
 */
export interface ExtendedModel<T extends Document> extends Model<T> {
  /**
   * Encuentra todos los documentos incluyendo los eliminados (soft delete)
   * @returns Query que incluye documentos con deletedAt !== null
   */
  findWithDeleted(): any;

  /**
   * Encuentra solo documentos eliminados
   * @returns Query con documentos donde deletedAt !== null
   */
  findDeleted(): any;

  /**
   * Alias de findDeleted() - Encuentra solo documentos eliminados
   * @returns Query con documentos donde deletedAt !== null
   */
  findOnlyDeleted(): any;

  /**
   * Obtiene el siguiente ID secuencial para autoincremento
   * Incluye documentos eliminados para evitar colisiones de ID
   * @returns Promise con el siguiente número de ID disponible
   */
  getNextId(): Promise<number>;
}

export interface DocumentCommon extends Document<Types.ObjectId> {
  /**
   * Soft delete this document
   * @param deletedBy - Optional user ID who deleted the document
   * @returns Promise that resolves to the updated document
   */
  softDelete(deletedBy?: string | Types.ObjectId): Promise<this>;

  /**
   * Restore a soft-deleted document
   * @returns Promise that resolves to the restored document
   */
  restore(): Promise<this>;
}
