import { PrismaClient, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { FiscalPeriodService } from '../periods/FiscalPeriodService';

const prisma = new PrismaClient();

export interface JournalLine {
  glAccountId: string;
  costCenterId?: string;
  debitAmount?: number;
  creditAmount?: number;
  description?: string;
  taxCode?: string;
  taxAmount?: number;
  partnerId?: string;
  partnerType?: 'VENDOR' | 'CUSTOMER';
}

export interface PostJournalDto {
  entryDate: Date;
  postingDate: Date;
  entryType: string;
  referenceDoc?: string;
  referenceType?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  currency?: string;
  exchangeRate?: number;
  lines: JournalLine[];
  postedBy: string;
}

export class JournalPostingEngine {
  private periodService = new FiscalPeriodService();

  /**
   * نقطة الدخول الوحيدة لكل عملية ترحيل - كل قيد يمر من هنا
   */
  async postJournalEntry(dto: PostJournalDto): Promise<string> {
    const fiscalPeriod = await this.periodService.getOpenPeriodForDate(
      dto.postingDate
    );
    if (!fiscalPeriod) {
      throw new Error(
        `لا توجد فترة محاسبية مفتوحة لتاريخ: ${dto.postingDate.toISOString()}`
      );
    }

    const totalDebit = dto.lines.reduce(
      (s, l) => s + (l.debitAmount ?? 0), 0
    );
    const totalCredit = dto.lines.reduce(
      (s, l) => s + (l.creditAmount ?? 0), 0
    );

    // قاعدة صارمة: لا يمر أي قيد غير متزن
if (Math.abs(totalDebit - totalCredit) >= 0.01) {
      throw new Error(
        `القيد غير متزن: مدين ${totalDebit} دائن ${totalCredit}`
      );
    }

    const entryNumber = await this.generateEntryNumber(dto.entryType);

    return prisma.$transaction(async (tx) => {
      const entry = await tx.journalEntry.create({
        data: {
          id: uuidv4(),
          entryNumber,
          entryDate: dto.entryDate,
          postingDate: dto.postingDate,
          fiscalPeriodId: fiscalPeriod.id,
          entryType: dto.entryType,
          referenceDoc: dto.referenceDoc,
          referenceType: dto.referenceType,
          descriptionAr: dto.descriptionAr,
          descriptionEn: dto.descriptionEn,
          currency: dto.currency ?? 'SAR',
          exchangeRate: dto.exchangeRate ?? 1,
          totalDebit,
          totalCredit,
          status: 'POSTED',
          postedBy: dto.postedBy,
        },
      });

      const lineData = dto.lines.map((line, idx) => ({
        id: uuidv4(),
        journalEntryId: entry.id,
        lineNumber: idx + 1,
        glAccountId: line.glAccountId,
        costCenterId: line.costCenterId,
        debitAmount: line.debitAmount ?? 0,
        creditAmount: line.creditAmount ?? 0,
        currency: dto.currency ?? 'SAR',
        description: line.description,
        taxCode: line.taxCode,
        taxAmount: line.taxAmount ?? 0,
        partnerId: line.partnerId,
        partnerType: line.partnerType,
      }));

      await tx.journalEntryLine.createMany({ data: lineData });

      return entry.id;
    });
  }

  async reverseJournalEntry(
    journalEntryId: string,
    reversalDate: Date,
    postedBy: string
  ): Promise<string> {
    const original = await prisma.journalEntry.findUniqueOrThrow({
      where: { id: journalEntryId },
      include: { lines: true },
    });

    if (original.status === 'REVERSED') {
      throw new Error('هذا القيد معكوس مسبقاً');
    }

    const reversalLines: JournalLine[] = original.lines.map((l) => ({
      glAccountId: l.glAccountId,
      costCenterId: l.costCenterId ?? undefined,
      debitAmount: l.creditAmount.toNumber(),   // عكس المدين/الدائن
      creditAmount: l.debitAmount.toNumber(),
      description: `عكس ${l.description ?? ''}`,
      partnerId: l.partnerId ?? undefined,
      partnerType: (l.partnerType as any) ?? undefined,
    }));

    const reversalId = await this.postJournalEntry({
      entryDate: reversalDate,
      postingDate: reversalDate,
      entryType: 'REVERSAL',
      referenceDoc: original.entryNumber,
      referenceType: 'REVERSAL_OF',
      descriptionAr: `عكس قيد: ${original.descriptionAr}`,
      currency: original.currency,
      lines: reversalLines,
      postedBy,
    });

    await prisma.journalEntry.update({
      where: { id: journalEntryId },
      data: { status: 'REVERSED', reversalOf: reversalId },
    });

    return reversalId;
  }

  private async generateEntryNumber(entryType: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = entryType.substring(0, 3).toUpperCase();
    const count = await prisma.journalEntry.count({
      where: {
        entryNumber: { startsWith: `${prefix}-${year}-` },
      },
    });
    return `${prefix}-${year}-${String(count + 1).padStart(6, '0')}`;
  }
}
