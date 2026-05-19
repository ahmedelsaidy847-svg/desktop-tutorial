import { PrismaClient } from '@prisma/client';
import { ARInvoiceService } from '../../fi-core/src/ar/ARInvoiceService';
import { InventoryService } from './InventoryService';

const prisma = new PrismaClient();

export interface DivertRequest {
  tripId: string;
  targetSalesOrderId: string;  // أمر البيع المستقبل
  divertedQtyM3: number;       // الكمية المحولة
  reason: string;
  authorizedBy: string;
}

export interface DivertResult {
  success: boolean;
  originalOrderId: string;
  targetOrderId: string;
  divertedQtyM3: number;
  originalInvoiceAdjusted: boolean;
  newInvoiceCreated: boolean;
  newInvoiceId?: string;
  wastedQtyM3: number;           // ما تبقى كهدر بعد التحويل
  message: string;
}

/**
 * خوارزمية التفريغ والتحويل (Dump & Divert)
 *
 * السيناريو: شاحنة محملة بالخرسانة تتجه لعميل (A)
 * ولكن يجب تحويلها لعميل (B) لتفادي هدر الخرسانة
 */
export class DumpAndDivertEngine {
  private arService = new ARInvoiceService();
  private inventoryService = new InventoryService();

  async executeDivert(request: DivertRequest): Promise<DivertResult> {
    return prisma.$transaction(async (tx) => {
      // --- 1. تحقق من وجود الرحلة وصلاحيتها للتحويل ---
      const trip = await tx.deliveryTrip.findUniqueOrThrow({
        where: { id: request.tripId },
        include: {
          salesOrder: { include: { customer: true, mixDesign: true } },
          vehicle: true,
          driver: true,
        },
      });

      const allowedStatuses = ['LOADED', 'IN_TRANSIT', 'ARRIVED'];
      if (!allowedStatuses.includes(trip.status)) {
        throw new Error(
          `لا يمكن تحويل رحلة بحالة: ${trip.status}`
        );
      }

      const loadedQty = trip.loadedQtyM3.toNumber();
      const divertQty = request.divertedQtyM3;

      if (divertQty > loadedQty) {
        throw new Error(
          `الكمية المحولة (${divertQty} م³) أكبر من المحمل (${loadedQty} م³)`
        );
      }

      // --- 2. جلب أمر البيع المستهدف ---
      const targetOrder = await tx.salesOrder.findUniqueOrThrow({
        where: { id: request.targetSalesOrderId },
        include: { customer: true },
      });

      // --- 3. تحقق من الحد الائتماني للعميل المستهدف ---
      await this.validateCreditLimit(targetOrder, divertQty, tx);

      const remainingOnOriginal = loadedQty - divertQty;
      const wastedQty = Math.max(0, remainingOnOriginal); // ما لا يمكن صبه

      // --- 4. تحديث حالة الرحلة ---
      await tx.deliveryTrip.update({
        where: { id: request.tripId },
        data: {
          status: 'DIVERTED',
          dumpDivertedTo: request.targetSalesOrderId,
          deliveredQtyM3: divertQty,
          wastedQtyM3: wastedQty,
          divertReason: request.reason,
        },
      });

      // --- 5. تحديث أمر البيع الأصلي ---
      const originalOrder = trip.salesOrder;
      const originalDelivered = originalOrder.deliveredQtyM3.toNumber();

      await tx.salesOrder.update({
        where: { id: originalOrder.id },
        data: {
          deliveredQtyM3: originalDelivered, // لم يُسلّم له شيء
          status: originalDelivered >= originalOrder.orderedQtyM3.toNumber()
            ? 'COMPLETED'
            : 'DIVERTED',
          notes: `تحويل ${divertQty} م³ إلى أمر ${targetOrder.orderNumber}`,
        },
      });

      // --- 6. تحديث كمية الاستلام في أمر البيع المستهدف ---
      const currentDelivered = targetOrder.deliveredQtyM3.toNumber();
      const newDeliveredTotal = currentDelivered + divertQty;

      await tx.salesOrder.update({
        where: { id: request.targetSalesOrderId },
        data: {
          deliveredQtyM3: newDeliveredTotal,
          status:
            newDeliveredTotal >= targetOrder.orderedQtyM3.toNumber()
              ? 'COMPLETED'
              : 'IN_DELIVERY',
        },
      });

      // --- 7. إنشاء فاتورة للعميل المستهدف ---
      let newInvoiceId: string | undefined;
      let newInvoiceCreated = false;

      if (divertQty > 0) {
        const invoiceAmount =
          divertQty * targetOrder.unitPrice.toNumber() +
          (targetOrder.pumpRequired ? targetOrder.pumpPrice.toNumber() : 0);

        const vatAmount = invoiceAmount * 0.15;

        newInvoiceId = await this.arService.createInvoiceInTx(tx, {
          customerId: targetOrder.customerId,
          salesOrderId: targetOrder.id,
          invoiceDate: new Date(),
          subtotal: invoiceAmount,
          vatAmount,
          totalAmount: invoiceAmount + vatAmount,
          description: `خرسانة جاهزة - تحويل من شاحنة ${trip.vehicle.vehicleNumber}`,
          createdBy: request.authorizedBy,
        });
        newInvoiceCreated = true;
      }

      // --- 8. تسجيل الهدر في المخزون (لوجستيات) ---
      // المواد تم استهلاكها فعلياً من المخزون، لا إرجاع حتى لو تهدر

      return {
        success: true,
        originalOrderId: originalOrder.id,
        targetOrderId: request.targetSalesOrderId,
        divertedQtyM3: divertQty,
        originalInvoiceAdjusted: true,
        newInvoiceCreated,
        newInvoiceId,
        wastedQtyM3: wastedQty,
        message: `تم تحويل ${divertQty} م³ بنجاح إلى أمر ${targetOrder.orderNumber}`,
      };
    });
  }

  private async validateCreditLimit(
    order: any,
    additionalQty: number,
    tx: any
  ): Promise<void> {
    const customer = order.customer;
    const creditLimit = customer.creditLimit?.toNumber() ?? 0;
    if (creditLimit === 0) return; // لا حد ائتماني - مسموح

    // إجمالي الفواتير المفتوحة للعميل
    const openBalance = await tx.arInvoice.aggregate({
      where: {
        customerId: customer.id,
        status: { in: ['OPEN', 'PARTIAL'] },
      },
      _sum: { balance: true },
    });

    const currentBalance = openBalance._sum.balance?.toNumber() ?? 0;
    const newOrderValue =
      additionalQty * order.unitPrice.toNumber() * 1.15; // شامل VAT

    if (currentBalance + newOrderValue > creditLimit) {
      throw new Error(
        `تجاوز الحد الائتماني. ` +
        `المتاح: ${(creditLimit - currentBalance).toFixed(2)} ريال، ` +
        `المطلوب: ${newOrderValue.toFixed(2)} ريال`
      );
    }
  }
}
