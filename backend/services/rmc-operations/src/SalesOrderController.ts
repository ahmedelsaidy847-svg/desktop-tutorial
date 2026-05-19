import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { DumpAndDivertEngine } from './DumpAndDivertEngine';
import { CreditControlService } from '../../fi-core/src/ar/CreditControlService';

const router = Router();
const prisma = new PrismaClient();
const divertEngine = new DumpAndDivertEngine();
const creditService = new CreditControlService();

// GET /api/sales-orders
router.get('/', async (req: Request, res: Response) => {
  const {
    status, customerId, plantId,
    deliveryDateFrom, deliveryDateTo,
    page = '1', limit = '20',
  } = req.query;

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const where: any = {};
  if (status) where.status = status;
  if (customerId) where.customerId = customerId;
  if (plantId) where.plantId = plantId;
  if (deliveryDateFrom || deliveryDateTo) {
    where.deliveryDate = {};
    if (deliveryDateFrom)
      where.deliveryDate.gte = new Date(deliveryDateFrom as string);
    if (deliveryDateTo)
      where.deliveryDate.lte = new Date(deliveryDateTo as string);
  }

  const [orders, total] = await Promise.all([
    prisma.salesOrder.findMany({
      where,
      include: {
        customer: { select: { bpCode: true, bpNameAr: true } },
        plant: { select: { plantCode: true, plantNameAr: true } },
        mixDesign: { select: { designCode: true, concretGrade: true } },
      },
      orderBy: { deliveryDate: 'asc' },
      skip,
      take: parseInt(limit as string),
    }),
    prisma.salesOrder.count({ where }),
  ]);

  res.json({
    data: orders,
    pagination: {
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      pages: Math.ceil(total / parseInt(limit as string)),
    },
  });
});

// POST /api/sales-orders
router.post('/', async (req: Request, res: Response) => {
  const body = req.body;

  // فحص الحد الائتماني
  const creditCheck = await creditService.checkCredit(
    body.customerId,
    body.orderedQtyM3 * body.unitPrice * 1.15
  );

  if (!creditCheck.approved) {
    return res.status(400).json({
      error: 'CREDIT_LIMIT_EXCEEDED',
      message: creditCheck.message,
      availableCredit: creditCheck.availableCredit,
    });
  }

  const year = new Date().getFullYear();
  const count = await prisma.salesOrder.count({
    where: { orderNumber: { startsWith: `SO-${year}-` } },
  });

  const order = await prisma.salesOrder.create({
    data: {
      ...body,
      orderNumber: `SO-${year}-${String(count + 1).padStart(6, '0')}`,
      status: 'CONFIRMED',
      creditChecked: true,
      totalAmount: body.orderedQtyM3 * body.unitPrice * 1.15,
    },
  });

  res.status(201).json(order);
});

// POST /api/sales-orders/trips/:tripId/divert - تحويل الخرسانة
router.post('/trips/:tripId/divert', async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const { targetSalesOrderId, divertedQtyM3, reason } = req.body;

  const result = await divertEngine.executeDivert({
    tripId,
    targetSalesOrderId,
    divertedQtyM3,
    reason,
    authorizedBy: (req as any).user?.id ?? 'SYSTEM',
  });

  res.json(result);
});

export default router;
