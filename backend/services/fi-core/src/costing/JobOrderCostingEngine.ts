import { PrismaClient } from '@prisma/client';
import { JournalPostingEngine } from '../gl/JournalPostingEngine';

const prisma = new PrismaClient();

export interface CostVarianceReport {
  productionOrderId: string;
  orderNumber: string;
  mixDesignCode: string;
  actualQtyM3: number;
  standardCostPerM3: number;
  actualCostPerM3: number;
  totalStandardCost: number;
  totalActualCost: number;
  varianceAmount: number;
  variancePct: number;
  materialBreakdown: MaterialVariance[];
  overheadBreakdown: OverheadBreakdown[];
}

interface MaterialVariance {
  materialCode: string;
  materialName: string;
  standardQtyPerM3: number;
  actualQtyPerM3: number;
  standardCost: number;
  actualCost: number;
  variance: number;
  variancePct: number;
}

interface OverheadBreakdown {
  overheadType: string;
  allocatedAmount: number;
  ratePerM3: number;
}

export class JobOrderCostingEngine {
  private glEngine = new JournalPostingEngine();

  /**
   * الدالة الرئيسية: تحسب تكاليف أمر التشغيل وتولد تقرير الانحراف
   */
  async calculateAndCloseOrder(
    productionOrderId: string,
    closedBy: string
  ): Promise<CostVarianceReport> {
    const order = await prisma.productionOrder.findUniqueOrThrow({
      where: { id: productionOrderId },
      include: {
        mixDesign: {
          include: { components: { include: { material: true } } },
        },
        materialConsumptions: { include: { material: true } },
        overheadAllocations: { include: { glAccount: true } },
      },
    });

    if (order.status !== 'COMPLETED') {
      throw new Error('لا يمكن إغلاق أمر تشغيل غير مكتمل');
    }

    const actualQty = order.actualQtyM3.toNumber();
    if (actualQty <= 0) throw new Error('كمية الإنتاج الفعلية صفر');

    // --- حساب التكاليف الفعلية ---
    const totalMaterialCost = order.materialConsumptions.reduce(
      (sum, c) => sum + c.totalCost.toNumber(), 0
    );
    const totalOverheadCost = order.overheadAllocations.reduce(
      (sum, o) => sum + o.allocatedAmount.toNumber(), 0
    );
    const totalActualCost = totalMaterialCost + totalOverheadCost;
    const actualCostPerM3 = totalActualCost / actualQty;

    // --- حساب التكاليف المعيارية ---
    const standardCostPerM3 = order.mixDesign.standardCostPerM3.toNumber();
    const totalStandardCost = standardCostPerM3 * actualQty;

    // --- حساب الانحراف ---
    const varianceAmount = totalActualCost - totalStandardCost;
    const variancePct =
      totalStandardCost !== 0
        ? (varianceAmount / totalStandardCost) * 100
        : 0;

    // --- تفصيل انحراف المواد ---
    const materialBreakdown: MaterialVariance[] =
      order.mixDesign.components.map((comp) => {
        const stdQtyPerM3 = comp.quantityPerM3.toNumber();
        const stdQtyTotal = stdQtyPerM3 * actualQty;

        const actualConsumption = order.materialConsumptions.find(
          (c) => c.materialId === comp.materialId
        );
        const actualQtyTotal = actualConsumption?.actualQty.toNumber() ?? 0;
        const unitCost = actualConsumption?.unitCost.toNumber() ?? 0;

        const stdCost = stdQtyTotal * unitCost;
        const actCost = actualQtyTotal * unitCost;
        const variance = actCost - stdCost;

        return {
          materialCode: comp.material.materialCode,
          materialName: comp.material.nameAr,
          standardQtyPerM3: stdQtyPerM3,
          actualQtyPerM3: actualQtyTotal / actualQty,
          standardCost: stdCost,
          actualCost: actCost,
          variance,
          variancePct: stdCost !== 0 ? (variance / stdCost) * 100 : 0,
        };
      });

    const overheadBreakdown: OverheadBreakdown[] =
      order.overheadAllocations.map((o) => ({
        overheadType: o.overheadType,
        allocatedAmount: o.allocatedAmount.toNumber(),
        ratePerM3: o.allocatedAmount.toNumber() / actualQty,
      }));

    // --- ترحيل قيد الانحراف لدفتر الأستاذ ---
    if (Math.abs(varianceAmount) >= 0.01) {
      await this.postVarianceJournalEntry(
        order,
        varianceAmount,
        closedBy
      );
    }

    // --- تحديث حالة الأمر ---
    await prisma.productionOrder.update({
      where: { id: productionOrderId },
      data: {
        standardCost: totalStandardCost,
        actualCost: totalActualCost,
        varianceAmount,
        variancePct,
        closedAt: new Date(),
      },
    });

    return {
      productionOrderId,
      orderNumber: order.orderNumber,
      mixDesignCode: order.mixDesign.designCode,
      actualQtyM3: actualQty,
      standardCostPerM3,
      actualCostPerM3,
      totalStandardCost,
      totalActualCost,
      varianceAmount,
      variancePct,
      materialBreakdown,
      overheadBreakdown,
    };
  }

  private async postVarianceJournalEntry(
    order: any,
    varianceAmount: number,
    postedBy: string
  ): Promise<void> {
    // جلب حسابات GL الانحراف من الإعداد
    const [varianceAccount, wipAccount] = await Promise.all([
      prisma.gLAccount.findFirstOrThrow({
        where: { accountCode: '5100-VARIANCE-MAT' },
      }),
      prisma.gLAccount.findFirstOrThrow({
        where: { accountCode: '1300-WIP' },
      }),
    ]);

    const isUnfavorable = varianceAmount > 0;
    const absVariance = Math.abs(varianceAmount);

    await this.glEngine.postJournalEntry({
      entryDate: new Date(),
      postingDate: new Date(),
      entryType: 'JOB_COSTING',
      referenceDoc: order.orderNumber,
      referenceType: 'PRODUCTION_ORDER',
      descriptionAr: `انحراف تكاليف - أمر إنتاج: ${order.orderNumber}`,
      currency: 'SAR',
      lines: [
        {
          glAccountId: isUnfavorable ? varianceAccount.id : wipAccount.id,
          costCenterId: order.costCenterId,
          debitAmount: absVariance,
          description: isUnfavorable ? 'انحراف غير ملائم' : 'انحراف ملائم',
        },
        {
          glAccountId: isUnfavorable ? wipAccount.id : varianceAccount.id,
          costCenterId: order.costCenterId,
          creditAmount: absVariance,
          description: isUnfavorable ? 'العمل تحت التشغيل' : 'انحراف ملائم',
        },
      ],
      postedBy,
    });
  }
}
