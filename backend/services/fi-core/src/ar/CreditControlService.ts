import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreditCheckResult {
  approved: boolean;
  customerId: string;
  creditLimit: number;
  currentExposure: number;
  availableCredit: number;
  message: string;
}

export class CreditControlService {
  async checkCredit(
    customerId: string,
    requestedAmount: number
  ): Promise<CreditCheckResult> {
    const customer = await prisma.businessPartner.findUniqueOrThrow({
      where: { id: customerId },
    });

    const creditLimit = customer.creditLimit?.toNumber() ?? 0;
    if (creditLimit === 0) {
      return {
        approved: true,
        customerId,
        creditLimit: 0,
        currentExposure: 0,
        availableCredit: Infinity,
        message: 'لا حد ائتماني محدد',
      };
    }

    const openInvoices = await prisma.arInvoice.aggregate({
      where: {
        customerId,
        status: { in: ['OPEN', 'PARTIAL'] },
      },
      _sum: { balance: true },
    });

    const currentExposure = openInvoices._sum.balance?.toNumber() ?? 0;
    const availableCredit = creditLimit - currentExposure;
    const approved = availableCredit >= requestedAmount;

    return {
      approved,
      customerId,
      creditLimit,
      currentExposure,
      availableCredit,
      message: approved
        ? `الحد الائتماني متاح - المتبقي: ${availableCredit.toFixed(2)} ريال`
        : `تجاوز الحد الائتماني. مطلوب: ${requestedAmount.toFixed(2)}، متاح: ${availableCredit.toFixed(2)}`,
    };
  }
}
