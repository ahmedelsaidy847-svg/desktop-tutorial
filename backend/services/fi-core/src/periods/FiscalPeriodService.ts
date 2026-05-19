import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class FiscalPeriodService {
  async getOpenPeriodForDate(date: Date) {
    return prisma.fiscalPeriod.findFirst({
      where: {
        startDate: { lte: date },
        endDate: { gte: date },
        status: 'OPEN',
      },
    });
  }

  async closePeriod(periodId: string, closedBy: string): Promise<void> {
    const period = await prisma.fiscalPeriod.findUniqueOrThrow({
      where: { id: periodId },
    });
    if (period.status !== 'OPEN') {
      throw new Error('الفترة ليست مفتوحة');
    }
    await prisma.fiscalPeriod.update({
      where: { id: periodId },
      data: { status: 'CLOSED' },
    });
  }
}
