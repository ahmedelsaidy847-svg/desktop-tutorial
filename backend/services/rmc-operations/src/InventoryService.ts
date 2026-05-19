import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class InventoryService {
  async getCurrentStock(materialId: string): Promise<number> {
    const material = await prisma.rawMaterial.findUniqueOrThrow({
      where: { id: materialId },
    });
    return material.currentStock.toNumber();
  }

  async adjustStock(
    materialId: string,
    adjustment: number, // موجب = إضافة، سالب = خصم
    reason: string
  ): Promise<void> {
    await prisma.rawMaterial.update({
      where: { id: materialId },
      data: { currentStock: { increment: adjustment } },
    });
  }

  async updateMovingAverageCost(
    materialId: string,
    incomingQty: number,
    incomingUnitCost: number
  ): Promise<number> {
    const material = await prisma.rawMaterial.findUniqueOrThrow({
      where: { id: materialId },
    });

    const currentQty = material.currentStock.toNumber();
    const currentCost = material.avgUnitCost?.toNumber() ?? 0;

    const newAvgCost =
      currentQty + incomingQty === 0
        ? incomingUnitCost
        : (currentQty * currentCost + incomingQty * incomingUnitCost) /
          (currentQty + incomingQty);

    await prisma.rawMaterial.update({
      where: { id: materialId },
      data: {
        avgUnitCost: newAvgCost,
        currentStock: { increment: incomingQty },
      },
    });

    return newAvgCost;
  }
}
