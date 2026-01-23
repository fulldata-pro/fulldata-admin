import { BaseRepository } from './base.repository'
import Invoice, { IInvoice } from '../models/Invoice'

class InvoiceRepository extends BaseRepository<IInvoice> {
  constructor() {
    super(Invoice)
  }
}

export const invoiceRepository = new InvoiceRepository()