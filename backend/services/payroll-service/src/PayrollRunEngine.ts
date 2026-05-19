import { PrismaClient } from '@prisma/client';
import { LoanDeductionEngine } from './LoanDeductionEngine';
import { DriverCommissionCalculator } from './DriverCommissionCalculator';
import { SymbolicAccountRouter } from '../../fi-core/src/symbolic/SymbolicAccountRouter';

const prisma = new PrismaClient();

/**
 * محرك دورة الرواتب - ينسق جميع الوحدات
 */
export class PayrollRunEngine {
  private loanEngine = new LoanDeductionEngine();
  private commissionCalc = new DriverCommissionCalculator();
  private symbolicRouter = new SymbolicAccountRouter();

  async runPayroll(
    payrollYear: number,
    payrollMonth: number,
    runType: 'REGULAR' | 'SUPPLEMENTARY' = 'REGULAR',
    initiatedBy: string
  ): Promise<string> {
    const existingRun = await prisma.payrollRun.findFirst({
      where: { payrollYear, payrollMonth, runType, status: { not: 'REVERSED' } },
    });
    if (existingRun && runType === 'REGULAR') {
      throw new Error(`يوجد بالفعل دورة رواتب لهذا الشهر: ${existingRun.id}`);
    }

    const runNumber = `PAY-${payrollYear}-${String(payrollMonth).padStart(2, '0')}-${runType.substring(0, 3)}`;

    const run = await prisma.payrollRun.create({
      data: {
        runNumber,
        payrollYear,
        payrollMonth,
        runType,
        status: 'DRAFT',
      },
    });

    // تحضير إدخالات الرواتب
    await this.generatePayrollItems(run.id, payrollYear, payrollMonth);

    // حساب عمولات السائقين
    await this.commissionCalc.bulkPopulateDriverCommissions(
      run.id, payrollYear, payrollMonth
    );

    // معالجة خصومات السلف
    await this.processLoanDeductions(run.id, payrollYear, payrollMonth);

    // إعادة حساب الصافي
    await this.recalculateNetSalaries(run.id);

    // تحديث حالة الدورة
    const totals = await prisma.payrollItem.aggregate({
      where: { payrollRunId: run.id },
      _sum: {
        grossSalary: true,
        totalDeductions: true,
        netSalary: true,
      },
    });

    await prisma.payrollRun.update({
      where: { id: run.id },
      data: {
        status: 'CALCULATED',
        totalGross: totals._sum.grossSalary ?? 0,
        totalDeductions: totals._sum.totalDeductions ?? 0,
        totalNet: totals._sum.netSalary ?? 0,
      },
    });

    return run.id;
  }

  async approveAndPost(
    payrollRunId: string,
    approvedBy: string
  ): Promise<void> {
    const run = await prisma.payrollRun.findUniqueOrThrow({
      where: { id: payrollRunId },
      include: { items: { include: { employee: true } } },
    });

    if (run.status !== 'CALCULATED') {
      throw new Error('الدورة يجب أن تكون محسوبة');
    }

    const postingDate = new Date(
      run.payrollYear, run.payrollMonth - 1, 28
    );

    // ترحيل القيد عبر طبقة الحسابات الرمزية
    const journalEntryId = await this.symbolicRouter.postPayrollJournalEntry(
      payrollRunId,
      run.items,
      postingDate,
      approvedBy
    );

    await prisma.payrollRun.update({
      where: { id: payrollRunId },
      data: {
        status: 'POSTED',
        approvedBy,
        approvedAt: new Date(),
        postedAt: new Date(),
        journalEntryId,
      },
    });
  }

  private async generatePayrollItems(
    payrollRunId: string,
    year: number,
    month: number
  ): Promise<void> {
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
    });

    const daysInMonth = new Date(year, month, 0).getDate();

    const itemsData = employees.map((emp) => ({
      payrollRunId,
      employeeId: emp.id,
      workingDays: daysInMonth,
      basicSalary: emp.basicSalary,
      housingAllowance: emp.housingAllowance,
      transportAllowance: emp.transportAllowance,
      otherAllowances: emp.otherAllowances,
      grossSalary:
        emp.basicSalary.toNumber() +
        emp.housingAllowance.toNumber() +
        emp.transportAllowance.toNumber() +
        emp.otherAllowances.toNumber(),
      netSalary:
        emp.basicSalary.toNumber() +
        emp.housingAllowance.toNumber() +
        emp.transportAllowance.toNumber() +
        emp.otherAllowances.toNumber(),
      employeeGroup: emp.employeeGroup,
      costCenterId: emp.costCenterId,
    }));

    await prisma.payrollItem.createMany({ data: itemsData });
  }

  private async processLoanDeductions(
    payrollRunId: string,
    year: number,
    month: number
  ): Promise<void> {
    const items = await prisma.payrollItem.findMany({
      where: { payrollRunId },
      include: { employee: true },
    });

    const daysInMonth = new Date(year, month, 0).getDate();

    for (const item of items) {
      const lopDays = item.lopDays?.toNumber() ?? 0;

      const deductionResults = await this.loanEngine.processEmployeeLoans(
        item.employeeId,
        payrollRunId,
        year,
        month,
        lopDays,
        daysInMonth
      );

      const totalLoanDeduction = deductionResults
        .filter((r) => r.action === 'DEDUCTED')
        .reduce((s, r) => s + r.deductedAmount, 0);

      await prisma.payrollItem.update({
        where: { id: item.id },
        data: { loanDeduction: totalLoanDeduction },
      });
    }
  }

  private async recalculateNetSalaries(payrollRunId: string): Promise<void> {
    const items = await prisma.payrollItem.findMany({
      where: { payrollRunId },
    });

    for (const item of items) {
      const totalDeductions =
        item.loanDeduction.toNumber() +
        item.gosiDeduction.toNumber() +
        item.otherDeductions.toNumber();

      const netSalary =
        item.grossSalary.toNumber() +
        item.driverCommission.toNumber() -
        totalDeductions;

      await prisma.payrollItem.update({
        where: { id: item.id },
        data: { totalDeductions, netSalary: Math.max(0, netSalary) },
      });
    }
  }
}
