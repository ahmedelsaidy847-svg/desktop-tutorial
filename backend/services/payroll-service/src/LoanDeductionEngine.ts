import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DeductionResult {
  employeeId: string;
  payrollRunId: string;
  installmentId: string;
  scheduledAmount: number;
  deductedAmount: number;
  action: 'DEDUCTED' | 'CARRIED_FORWARD' | 'SKIPPED' | 'PARTIAL';
  reason: string;
  newInstallmentId?: string; // في حالة CARRY_FORWARD
}

/**
 * محرك خصم السلف - الدالة الأساسية
 *
 * سيناريوهات الغياب:
 *   CARRY_FORWARD  - ترحيل القسط للشهر القادم (منطقي للغياب الجزئي)
 *   NO_DEDUCTION   - لا خصم وتمديد فترة القرض (لغياب كامل LOP)
 */
export class LoanDeductionEngine {
  async processEmployeeLoans(
    employeeId: string,
    payrollRunId: string,
    payrollYear: number,
    payrollMonth: number,
    lopDays: number,          // أيام الغياب بدون أجر
    workingDaysInMonth: number
  ): Promise<DeductionResult[]> {
    const results: DeductionResult[] = [];

    // جلب جميع الأقساط المجدولة لهذا الشهر
    const dueInstallments = await prisma.loanInstallmentSchedule.findMany({
      where: {
        loan: {
          employeeId,
          status: 'ACTIVE',
        },
        dueYear: payrollYear,
        dueMonth: payrollMonth,
        status: 'SCHEDULED',
      },
      include: {
        loan: { include: { policy: true } },
      },
    });

    for (const installment of dueInstallments) {
      const policy = installment.loan.policy;
      const scheduledAmount = installment.totalDue.toNumber();
      const isFullLop = lopDays >= workingDaysInMonth; // غياب كامل
      const isPartialLop = lopDays > 0 && !isFullLop;

      const result = await this.resolveInstallmentAction({
        installment,
        policy,
        payrollRunId,
        payrollYear,
        payrollMonth,
        isFullLop,
        isPartialLop,
        lopDays,
        workingDaysInMonth,
        scheduledAmount,
      });

      results.push(result);
    }

    return results;
  }

  private async resolveInstallmentAction(ctx: {
    installment: any;
    policy: any;
    payrollRunId: string;
    payrollYear: number;
    payrollMonth: number;
    isFullLop: boolean;
    isPartialLop: boolean;
    lopDays: number;
    workingDaysInMonth: number;
    scheduledAmount: number;
  }): Promise<DeductionResult> {
    const {
      installment, policy, payrollRunId, payrollYear, payrollMonth,
      isFullLop, lopDays, workingDaysInMonth, scheduledAmount,
    } = ctx;

    // === حالة 1: غياب كامل (Full LOP) ===
    if (isFullLop) {
      return this.handleFullLop(
        installment, policy, payrollRunId,
        payrollYear, payrollMonth, scheduledAmount
      );
    }

    // === حالة 2: غياب جزئي - خصم كامل عادية
    return this.deductNormally(
      installment, payrollRunId, scheduledAmount
    );
  }

  /**
   * معالجة الغياب الكامل (Full LOP)
   * حسب سياسة القرض
   */
  private async handleFullLop(
    installment: any,
    policy: any,
    payrollRunId: string,
    currentYear: number,
    currentMonth: number,
    scheduledAmount: number
  ): Promise<DeductionResult> {
    const lopAction = policy.lopAction;

    if (lopAction === 'CARRY_FORWARD') {
      // ترحيل القسط للشهر التالي
      const nextMonth = this.addOneMonth(currentYear, currentMonth);

      // هل يوجد قسط مجدول في الشهر التالي؟
      const existingNext = await prisma.loanInstallmentSchedule.findFirst({
        where: {
          loanId: installment.loanId,
          dueYear: nextMonth.year,
          dueMonth: nextMonth.month,
        },
      });

      let newInstallmentId: string | undefined;

      if (existingNext) {
        // دمج القسط المرحّل مع القسط القائم
        await prisma.loanInstallmentSchedule.update({
          where: { id: existingNext.id },
          data: {
            principalAmount: {
              increment: installment.principalAmount,
            },
            interestAmount: {
              increment: installment.interestAmount,
            },
          },
        });
        newInstallmentId = existingNext.id;
      } else {
        // إنشاء قسط جديد في الشهر التالي
        const newInstallment = await prisma.loanInstallmentSchedule.create({
          data: {
            loanId: installment.loanId,
            installmentNumber:
              (await prisma.loanInstallmentSchedule.count({
                where: { loanId: installment.loanId },
              })) + 1,
            dueYear: nextMonth.year,
            dueMonth: nextMonth.month,
            dueDate: new Date(nextMonth.year, nextMonth.month - 1, 25),
            principalAmount: installment.principalAmount,
            interestAmount: installment.interestAmount,
            status: 'SCHEDULED',
          },
        });
        newInstallmentId = newInstallment.id;
      }

      // تحديث القسط الحالي
      await prisma.loanInstallmentSchedule.update({
        where: { id: installment.id },
        data: {
          status: 'CARRIED_FORWARD',
          carryForwardTo: newInstallmentId,
          notes: `غياب كامل - ترحيل ل ${nextMonth.year}/${nextMonth.month}`,
        },
      });

      // تمديد تاريخ انتهاء القرض
      await prisma.employeeLoan.update({
        where: { id: installment.loanId },
        data: {
          expectedEndDate: {
            // تمديد شهر واحد
            set: await this.getExtendedEndDate(installment.loanId),
          },
        },
      });

      return {
        employeeId: installment.loan.employeeId,
        payrollRunId,
        installmentId: installment.id,
        scheduledAmount,
        deductedAmount: 0,
        action: 'CARRIED_FORWARD',
        reason: `غياب كامل - تم ترحيل القسط للشهر ${nextMonth.year}/${nextMonth.month}`,
        newInstallmentId,
      };
    }

    if (lopAction === 'NO_DEDUCTION') {
      // لا خصم - تمديد فترة القرض الكلية
      await prisma.loanInstallmentSchedule.update({
        where: { id: installment.id },
        data: {
          status: 'SKIPPED',
          notes: 'غياب كامل - لا خصم وفقاً لسياسة القرض',
        },
      });

      await prisma.employeeLoan.update({
        where: { id: installment.loanId },
        data: {
          expectedEndDate: {
            set: await this.getExtendedEndDate(installment.loanId),
          },
        },
      });

      return {
        employeeId: installment.loan.employeeId,
        payrollRunId,
        installmentId: installment.id,
        scheduledAmount,
        deductedAmount: 0,
        action: 'SKIPPED',
        reason: 'غياب كامل - تم تخطي القسط وتمديد القرض',
      };
    }

    // حالة افتراضية: خصم اعتيادي
    return this.deductNormally(installment, payrollRunId, scheduledAmount);
  }

  private async deductNormally(
    installment: any,
    payrollRunId: string,
    scheduledAmount: number
  ): Promise<DeductionResult> {
    await prisma.loanInstallmentSchedule.update({
      where: { id: installment.id },
      data: {
        status: 'DEDUCTED',
        deductedAmount: scheduledAmount,
        deductedInPayroll: payrollRunId,
      },
    });

    // تحديث الرصيد المتبقي
    await prisma.employeeLoan.update({
      where: { id: installment.loanId },
      data: {
        paidInstallments: { increment: 1 },
        remainingBalance: { decrement: scheduledAmount },
      },
    });

    // فحص إن تم سداد القرض بالكامل
    const loan = await prisma.employeeLoan.findUniqueOrThrow({
      where: { id: installment.loanId },
    });
    if (loan.remainingBalance.toNumber() <= 0.01) {
      await prisma.employeeLoan.update({
        where: { id: installment.loanId },
        data: { status: 'COMPLETED', remainingBalance: 0 },
      });
    }

    return {
      employeeId: installment.loan.employeeId,
      payrollRunId,
      installmentId: installment.id,
      scheduledAmount,
      deductedAmount: scheduledAmount,
      action: 'DEDUCTED',
      reason: 'تم الخصم بنجاح',
    };
  }

  /**
   * تسوية رصيد السلفة من مكافأة نهاية الخدمة (Gratuity Settlement)
   */
  async settleLoansFromGratuity(
    employeeId: string,
    gratuityAmount: number,
    terminationDate: Date,
    settledBy: string
  ): Promise<{ settledLoans: string[]; remainingGratuity: number }> {
    const activeLoans = await prisma.employeeLoan.findMany({
      where: { employeeId, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    });

    let remainingGratuity = gratuityAmount;
    const settledLoans: string[] = [];

    for (const loan of activeLoans) {
      if (remainingGratuity <= 0) break;

      const balance = loan.remainingBalance?.toNumber() ?? 0;
      const settlement = Math.min(balance, remainingGratuity);

      await prisma.employeeLoan.update({
        where: { id: loan.id },
        data: {
          remainingBalance: { decrement: settlement },
          status: settlement >= balance ? 'SETTLED' : 'ACTIVE',
          settlementSource: 'GRATUITY',
        },
      });

      // إلغاء الأقساط غير المدفوعة عند التسوية الكامل
      if (settlement >= balance) {
        await prisma.loanInstallmentSchedule.updateMany({
          where: { loanId: loan.id, status: 'SCHEDULED' },
          data: { status: 'SETTLED', notes: 'تم التسوية من مكافأة نهاية الخدمة' },
        });
        settledLoans.push(loan.id);
      }

      remainingGratuity -= settlement;
    }

    return { settledLoans, remainingGratuity };
  }

  private addOneMonth(
    year: number,
    month: number
  ): { year: number; month: number } {
    if (month === 12) return { year: year + 1, month: 1 };
    return { year, month: month + 1 };
  }

  private async getExtendedEndDate(loanId: string): Promise<Date> {
    const lastInstallment = await prisma.loanInstallmentSchedule.findFirst({
      where: { loanId },
      orderBy: { dueDate: 'desc' },
    });
    const base = lastInstallment?.dueDate ?? new Date();
    const extended = new Date(base);
    extended.setMonth(extended.getMonth() + 1);
    return extended;
  }
}
