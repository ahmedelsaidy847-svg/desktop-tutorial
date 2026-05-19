import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export interface BatchData {
  batchId: string;
  productionOrderNumber: string;
  timestamp: string;
  actualVolume: number;       // م³ فعلية
  materialConsumptions: {
    materialCode: string;
    actualQtyKg: number;
    targetQtyKg: number;
    moisture: number;          // رطوبة الركام
  }[];
  waterAddition:      number; // لتر
  admixtureDosage:    number; // مل
  drumSpeed:          number; // دورة/دقيقة
  loadingTime:        string;
  vehicleId:          string;
}

/**
 * نقطة تكامل مع متحكمات وزن المحطة (Batching Controllers)
 * تحديث المخزون آلياً بعد كل خلطة
 */
export class BatchingControllerIntegration {
  /**
   * POST /api/batching/record - يتلقى البيانات من متحكم الوزن
   */
  async receiveBatchRecord(data: BatchData): Promise<void> {
    // 1. التحقق من وجود أمر الإنتاج
    const productionOrder = await prisma.productionOrder.findFirstOrThrow({
      where: { orderNumber: data.productionOrderNumber },
      include: { mixDesign: { include: { components: true } } },
    });

    // 2. تحديث الكمية الفعلية للأمر
    await prisma.productionOrder.update({
      where: { id: productionOrder.id },
      data: {
        actualQtyM3: {
          increment: data.actualVolume,
        },
        status: 'IN_PROGRESS',
      },
    });

    // 3. تسجيل استهلاك المواد الفعلي
    for (const consumption of data.materialConsumptions) {
      const material = await prisma.rawMaterial.findFirstOrThrow({
        where: { materialCode: consumption.materialCode },
      });

      const actualQtyInUom = this.convertToBaseUnit(
        consumption.actualQtyKg,
        material.unitOfMeasure
      );

      await prisma.productionMaterialConsumption.create({
        data: {
          productionOrderId: productionOrder.id,
          materialId: material.id,
          plannedQty: consumption.targetQtyKg,
          actualQty: actualQtyInUom,
          unitCost: material.avgUnitCost ?? 0,
          source: 'BATCHING',
        },
      });

      // 4. خصم الكمية من المخزون آلياً
      await prisma.rawMaterial.update({
        where: { id: material.id },
        data: {
          currentStock: { decrement: actualQtyInUom },
        },
      });

      // تحذير مخزون منخفض
      const updatedMaterial = await prisma.rawMaterial.findUnique({
        where: { id: material.id },
      });
      if (
        updatedMaterial &&
        updatedMaterial.currentStock.toNumber() <
          (updatedMaterial.minStockLevel?.toNumber() ?? 0)
      ) {
        await this.triggerLowStockAlert(material.id, material.nameAr);
      }
    }

    // 5. ربط الرحلة بأمر الإنتاج
    if (data.vehicleId) {
      await prisma.deliveryTrip.updateMany({
        where: {
          vehicleId: data.vehicleId,
          productionOrderId: productionOrder.id,
        },
        data: { status: 'LOADED' },
      });
    }
  }

  private convertToBaseUnit(kg: number, uom: string): number {
    switch (uom) {
      case 'TON':  return kg / 1000;
      case 'LITER': return kg;       // تقريبي للماء
      case 'KG':   return kg;
      default:     return kg;
    }
  }

  private async triggerLowStockAlert(
    materialId: string,
    materialName: string
  ): Promise<void> {
    // هنا يمكن إرسال إشعار عبر WebSocket أو بريد إلكتروني
    console.warn(`تحذير: مستوى مخزون منخفض لـ ${materialName} (ID: ${materialId})`);
  }

  /**
   * مزامنة بيانات من متحكم الوزن (في حال عدم دعم Push)
   */
  async pullBatchDataFromController(plantId: string): Promise<void> {
    const plant = await prisma.rmcPlant.findUniqueOrThrow({
      where: { id: plantId },
    });

    if (!plant.batchingApiEndpoint) {
      throw new Error('لا يوجد نقطة تكامل مع متحكم الوزن');
    }

    const response = await axios.get(
      `${plant.batchingApiEndpoint}/batches/pending`,
      { timeout: 5000 }
    );

    const pendingBatches: BatchData[] = response.data;
    for (const batch of pendingBatches) {
      await this.receiveBatchRecord(batch);
    }
  }
}
