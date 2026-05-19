import { PrismaClient } from '@prisma/client';
import { JournalPostingEngine, JournalLine } from '../gl/JournalPostingEngine';

const prisma = new PrismaClient();

/**
 * طبقة التجريد - تحاكي آلية Symbolic Accounts في SAP
 *
 * مبدأ العمل:
 *   Wage Type  --->  Symbolic Account  --->  GL Account  (based on Employee Group)
 *
 * مثال:
 *   /001 (Basic Salary) --> SA-SALARY-BASIC --> عبر Employee Group:
 *     MANAGEMENT  --> 6100-MGMT-SALARY  (DEBIT)
 *     DRIVER      --> 5200-DRV-SALARY   (DEBIT)
 *     *           --> 6000-GEN-SALARY   (DEBIT)
 */
export interface WageTypeEntry {
  wageTypeCode: string;
  employeeId: string;
  employeeGroup: string;
  amount: number;
  costCenterId?: string;
}

export interface ResolvedGLEntry {
  wageTypeCode: string;
  symbolicAccountCode: string;
  glAccountId: string;
  costCenterId?: string;
  postingSide: 'DEBIT' | 'CREDIT';
  amount: number;
}

export class SymbolicAccountRouter {
  private glEngine = new JournalPostingEngine();

  /**
   * الدالة الرئيسية: تحل جميع أنواع الأجور إلى GL حسب مجموعة الموظف
   */
  async resolveWageTypes(
    entries: WageTypeEntry[],
    postingDate: Date
  ): Promise<ResolvedGLEntry[]> {
    const resolved: ResolvedGLEntry[] = [];

    for (const entry of entries) {
      const wageType = await prisma.wageType.findUniqueOrThrow({
        where: { code: entry.wageTypeCode },
        include: { symbolicAccount: true },
      });

      // جلب mapping الخاص بمجموعة الموظف - فإن لم يوجد يرجع للافتراضي
      const mapping = await prisma.symbolicAccountGlMapping.findFirst({
        where: {
          symbolicAccountId: wageType.symbolicAccount.id,
          employeeGroup: entry.employeeGroup,
          isActive: true,
          validFrom: { lte: postingDate },
          OR: [
            { validTo: null },
            { validTo: { gte: postingDate } },
          ],
        },
        orderBy: { validFrom: 'desc' },
      }) ?? await prisma.symbolicAccountGlMapping.findFirstOrThrow({
        where: {
          symbolicAccountId: wageType.symbolicAccount.id,
          employeeGroup: 'DEFAULT',
          isActive: true,
        },
      });

      resolved.push({
        wageTypeCode: entry.wageTypeCode,
        symbolicAccountCode: wageType.symbolicAccount.code,
        glAccountId: mapping.glAccountId,
        costCenterId: mapping.costCenterId ?? entry.costCenterId,
        postingSide: mapping.postingSide as 'DEBIT' | 'CREDIT',
        amount: entry.amount,
      });
    }

    return resolved;
  }

  /**
   * ترحيل قيد مالي كامل لدورة رواتب عبر طبقة التجريد
   */
  async postPayrollJournalEntry(
    payrollRunId: string,
    payrollItems: any[],
    postingDate: Date,
    postedBy: string
  ): Promise<string> {
    const wageEntries: WageTypeEntry[] = [];

    for (const item of payrollItems) {
      // بناء قائمة أنواع الأجور لكل موظف
      const wages: { code: string; amount: number }[] = [
        { code: '/001', amount: item.basicSalary },
        { code: '/002', amount: item.housingAllowance },
        { code: '/003', amount: item.transportAllowance },
        { code: '/DRV', amount: item.driverCommission },
        { code: '/OT1', amount: item.overtimeAmount },
        { code: '/D10', amount: -item.loanDeduction },   // خصم
        { code: '/D20', amount: -item.gosiDeduction },
        { code: '/D99', amount: -item.otherDeductions },
      ].filter((w) => Math.abs(w.amount) >= 0.01);

      wages.forEach((w) =>
        wageEntries.push({
          wageTypeCode: w.code,
          employeeId: item.employeeId,
          employeeGroup: item.employeeGroup,
          amount: Math.abs(w.amount),
          costCenterId: item.costCenterId,
        })
      );
    }

    const resolvedEntries = await this.resolveWageTypes(
      wageEntries,
      postingDate
    );

    // تحويل النتائج إلى سطور GL
    const glLines: JournalLine[] = resolvedEntries.map((r) => ({
      glAccountId: r.glAccountId,
      costCenterId: r.costCenterId,
      debitAmount: r.postingSide === 'DEBIT' ? r.amount : 0,
      creditAmount: r.postingSide === 'CREDIT' ? r.amount : 0,
      description: `${r.symbolicAccountCode} - ${r.wageTypeCode}`,
    }));

    // إضافة سطر مقابل حسابات البنك/الخزينة
    const totalNet = payrollItems.reduce(
      (s: number, i: any) => s + i.netSalary, 0
    );
    const bankAccount = await prisma.gLAccount.findFirstOrThrow({
      where: { accountCode: '2100-PAYROLL-PAYABLE' },
    });
    glLines.push({
      glAccountId: bankAccount.id,
      creditAmount: totalNet,
      description: 'إجمالي صافي الرواتب المستحقة',
    });

    return this.glEngine.postJournalEntry({
      entryDate: postingDate,
      postingDate,
      entryType: 'PAYROLL',
      referenceDoc: payrollRunId,
      referenceType: 'PAYROLL_RUN',
      descriptionAr: `قيد رواتب - دورة ${payrollRunId}`,
      currency: 'SAR',
      lines: glLines,
      postedBy,
    });
  }
}
