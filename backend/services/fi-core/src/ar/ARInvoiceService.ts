import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { JournalPostingEngine } from '../gl/JournalPostingEngine';

const prisma = new PrismaClient();

export interface CreateInvoiceDto {
  customerId: string;
  salesOrderId?: string;
  invoiceDate: Date;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  description?: string;
  createdBy: string;
}

export class ARInvoiceService {
  private glEngine = new JournalPostingEngine();

  async createInvoice(dto: CreateInvoiceDto): Promise<string> {
    return prisma.$transaction((tx) => this.createInvoiceInTx(tx, dto));
  }

  async createInvoiceInTx(
    tx: any,
    dto: CreateInvoiceDto
  ): Promise<string> {
    const customer = await tx.businessPartner.findUniqueOrThrow({
      where: { id: dto.customerId },
    });

    const year = new Date(dto.invoiceDate).getFullYear();
    const count = await tx.arInvoice.count({
      where: { invoiceNumber: { startsWith: `INV-${year}-` } },
    });
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(7, '0')}`;

    const dueDate = new Date(dto.invoiceDate);
    dueDate.setDate(dueDate.getDate() + (customer.creditDays ?? 30));

    const invoice = await tx.arInvoice.create({
      data: {
        id: uuidv4(),
        invoiceNumber,
        customerId: dto.customerId,
        salesOrderId: dto.salesOrderId,
        invoiceDate: dto.invoiceDate,
        dueDate,
        postingDate: dto.invoiceDate,
        subtotal: dto.subtotal,
        vatAmount: dto.vatAmount,
        totalAmount: dto.totalAmount,
        status: 'OPEN',
        createdBy: dto.createdBy,
      },
    });

    // ترحيل قيد محاسبي
    const arAccount = await tx.gLAccount.findFirstOrThrow({
      where: { accountCode: customer.glReconAccount },
    });
    const revenueAccount = await tx.gLAccount.findFirstOrThrow({
      where: { accountCode: '4100-CONCRETE-REVENUE' },
    });
    const vatAccount = await tx.gLAccount.findFirstOrThrow({
      where: { accountCode: '2300-VAT-OUTPUT' },
    });

    await this.glEngine.postJournalEntry({
      entryDate: dto.invoiceDate,
      postingDate: dto.invoiceDate,
      entryType: 'AR_INVOICE',
      referenceDoc: invoiceNumber,
      referenceType: 'AR_INVOICE',
      descriptionAr: `فاتورة مبيعات - ${customer.bpNameAr}`,
      currency: 'SAR',
      lines: [
        {
          glAccountId: arAccount.id,
          debitAmount: dto.totalAmount,
          partnerId: dto.customerId,
          partnerType: 'CUSTOMER',
          description: `مدين عميل: ${customer.bpNameAr}`,
        },
        {
          glAccountId: revenueAccount.id,
          creditAmount: dto.subtotal,
          description: 'إيرادات مبيعات الخرسانة',
        },
        {
          glAccountId: vatAccount.id,
          creditAmount: dto.vatAmount,
          description: 'VAT 15%',
        },
      ],
      postedBy: dto.createdBy,
    });

    await tx.arInvoice.update({
      where: { id: invoice.id },
      data: { journalEntryId: invoice.id }, // يتم تحديثه بعد الترحيل
    });

    return invoice.id;
  }
}
