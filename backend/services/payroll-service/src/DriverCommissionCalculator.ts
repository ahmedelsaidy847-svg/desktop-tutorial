import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CommissionCalculationResult {
  driverId: string;
  payrollMonth: number;
  payrollYear: number;
  totalTrips: number;
  totalKm: number;
  totalM3Delivered: number;
  commissionAmount: number;
  breakdown: TripCommission[];
}

interface TripCommission {
  tripNumber: string;
  basis: string;
  calculatedAmount: number;
}

/**
 * حساب عمولات السائقين ديناميكياً
 * يقرأ بيانات الرحلات من جدول التشغيل ويرحلها لكشف الرواتب
 */
export class DriverCommissionCalculator {
  async calculateMonthlyCommission(
    driverId: string,
    payrollYear: number,
    payrollMonth: number
  ): Promise<CommissionCalculationResult> {
    const startDate = new Date(payrollYear, payrollMonth - 1, 1);
    const endDate = new Date(payrollYear, payrollMonth, 0, 23, 59, 59);

    // جلب جميع رحلات السائق المكتملة في الشهر
    const trips = await prisma.deliveryTrip.findMany({
      where: {
        driverId,
        status: 'COMPLETED',
        loadTime: { gte: startDate, lte: endDate },
      },
      include: {
        vehicle: { include: { plant: true } },
        salesOrder: true,
      },
    });

    const breakdown: TripCommission[] = [];
    let totalCommission = 0;

    for (const trip of trips) {
      const tripKm = trip.tripDistanceKm?.toNumber() ?? 0;
      const tripM3 = trip.deliveredQtyM3?.toNumber() ?? 0;
      const plantId = trip.vehicle.plantId;

      // اجلب قاعدة العمولة المناسبة
      const rule = await this.findApplicableRule(
        plantId,
        tripKm,
        new Date(trip.loadTime!)
      );

      if (!rule) {
        breakdown.push({
          tripNumber: trip.tripNumber,
          basis: 'NO_RULE',
          calculatedAmount: 0,
        });
        continue;
      }

      let tripCommission = 0;

      switch (rule.basis) {
        case 'PER_TRIP':
          tripCommission = rule.commissionAmount?.toNumber() ?? 0;
          break;

        case 'PER_KM':
          tripCommission = tripKm * (rule.commissionAmount?.toNumber() ?? 0);
          break;

        case 'PER_M3':
          tripCommission = tripM3 * (rule.commissionAmount?.toNumber() ?? 0);
          break;

        case 'HYBRID':
          // عمولة = (ثابت لكل رحلة) + (كم × سعر الكم)
          tripCommission =
            (rule.commissionAmount?.toNumber() ?? 0) +
            tripKm * (rule.commissionRate?.toNumber() ?? 0);
          break;
      }

      // تحديث الرحلة بالعمولة المحسوبة
      await prisma.deliveryTrip.update({
        where: { id: trip.id },
        data: { driverCommissionAmount: tripCommission },
      });

      totalCommission += tripCommission;
      breakdown.push({
        tripNumber: trip.tripNumber,
        basis: rule.basis,
        calculatedAmount: tripCommission,
      });
    }

    const totalKm = trips.reduce(
      (s, t) => s + (t.tripDistanceKm?.toNumber() ?? 0), 0
    );
    const totalM3 = trips.reduce(
      (s, t) => s + (t.deliveredQtyM3?.toNumber() ?? 0), 0
    );

    return {
      driverId,
      payrollMonth,
      payrollYear,
      totalTrips: trips.length,
      totalKm,
      totalM3Delivered: totalM3,
      commissionAmount: totalCommission,
      breakdown,
    };
  }

  private async findApplicableRule(
    plantId: string | null,
    distanceKm: number,
    tripDate: Date
  ) {
    // بحث عن قاعدة خاصة بالمحطة والمسافة أولاً
    const specificRule = await prisma.driverCommissionRule.findFirst({
      where: {
        plantId: plantId ?? undefined,
        isActive: true,
        effectiveFrom: { lte: tripDate },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: tripDate } },
        ],
        AND: [
          { OR: [{ minDistanceKm: null }, { minDistanceKm: { lte: distanceKm } }] },
          { OR: [{ maxDistanceKm: null }, { maxDistanceKm: { gte: distanceKm } }] },
        ],
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    if (specificRule) return specificRule;

    // قاعدة عامة (plantId = null)
    return prisma.driverCommissionRule.findFirst({
      where: {
        plantId: null,
        isActive: true,
        effectiveFrom: { lte: tripDate },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: tripDate } },
        ],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  /**
   * ترحيل عمولات جميع سائقي المحطة آلياً لجدول الرواتب
   */
  async bulkPopulateDriverCommissions(
    payrollRunId: string,
    payrollYear: number,
    payrollMonth: number
  ): Promise<void> {
    const driverItems = await prisma.payrollItem.findMany({
      where: {
        payrollRunId,
        employee: { employeeGroup: 'DRIVER' },
      },
    });

    for (const item of driverItems) {
      const commResult = await this.calculateMonthlyCommission(
        item.employeeId,
        payrollYear,
        payrollMonth
      );

      await prisma.payrollItem.update({
        where: { id: item.id },
        data: { driverCommission: commResult.commissionAmount },
      });
    }
  }
}
