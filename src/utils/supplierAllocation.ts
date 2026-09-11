import { SaleInvoice, PurchaseInvoice, Product, Supplier, SupplierBatchAllocation } from '../types';

export interface ItemSupplierAllocation {
  itemIndex: number;
  productId: string;
  productName: string;
  barcode: string;
  unit?: string;
  totalQuantity: number;
  unitPrice: number;
  itemTotalSale: number;
  itemTotalCost: number;
  itemProfit: number;
  batches: SupplierBatchAllocation[];
}

export interface InvoiceProfitSummary {
  items: ItemSupplierAllocation[];
  totalSaleAmount: number;
  totalCostAmount: number;
  grossProfit: number;
  discountAmount: number;
  vatAmount: number;
  otherCost: number;
  netProfit: number;
  profitMarginPercent: number;
}

/**
 * Calculates FIFO Supplier SL wise breakdown and net profit for a sales invoice.
 * For each sold product:
 * 1. Checks supplier purchase batches by chronological order (SL-01, SL-02...).
 * 2. Takes quantity from the first supplier SL until depleted, then moves to the next supplier SL.
 * 3. Accurately calculates Total Cost, Total Sale, and Net Profit.
 */
export function calculateInvoiceSupplierProfit(
  invoice: SaleInvoice,
  purchases: PurchaseInvoice[],
  products: Product[],
  suppliers: Supplier[]
): InvoiceProfitSummary {
  const itemAllocations: ItemSupplierAllocation[] = [];

  let totalCostAmount = 0;
  let totalSaleAmount = 0;

  invoice.items.forEach((item, index) => {
    const product = products.find((p) => p.id === item.productId);
    const defaultCost = product?.unitCost ?? (item.unitPrice > 0 ? item.unitPrice * 0.75 : 0);
    const itemTotalSale = item.total || item.quantity * item.unitPrice;

    // Find all purchase records that contain this product
    interface CandidateBatch {
      purchaseNo: string;
      purchaseDate: string;
      supplierId: string;
      supplierName: string;
      unitCost: number;
      availableQty: number;
    }

    const candidateBatches: CandidateBatch[] = [];

    // Sort purchases oldest first to respect chronological FIFO SL order
    const sortedPurchases = [...purchases].reverse();

    sortedPurchases.forEach((pur) => {
      const match = pur.items.find((pi) => pi.productId === item.productId);
      if (match && match.quantity > 0) {
        candidateBatches.push({
          purchaseNo: pur.purchaseNo,
          purchaseDate: pur.date,
          supplierId: pur.supplierId,
          supplierName: pur.supplierName,
          unitCost: match.unitCost > 0 ? match.unitCost : defaultCost,
          availableQty: match.quantity,
        });
      }
    });

    let remainingNeeded = item.quantity;
    const allocatedBatches: SupplierBatchAllocation[] = [];
    let slCounter = 1;

    // Allocate from supplier batches in FIFO SL order
    for (const batch of candidateBatches) {
      if (remainingNeeded <= 0) break;

      const takeQty = Math.min(batch.availableQty, remainingNeeded);
      if (takeQty > 0) {
        const batchCost = takeQty * batch.unitCost;
        const batchSale = takeQty * item.unitPrice;
        const batchProfit = batchSale - batchCost;
        const batchMargin = batchSale > 0 ? (batchProfit / batchSale) * 100 : 0;

        allocatedBatches.push({
          productId: item.productId,
          productName: item.productName,
          barcode: item.barcode,
          unit: item.unit || product?.unit || 'Pcs',
          supplierId: batch.supplierId,
          supplierName: batch.supplierName,
          supplierSl: `SL-${String(slCounter).padStart(2, '0')} (${batch.purchaseNo})`,
          purchaseNo: batch.purchaseNo,
          purchaseDate: batch.purchaseDate,
          quantity: takeQty,
          unitCost: batch.unitCost,
          unitPrice: item.unitPrice,
          totalCost: batchCost,
          totalSale: batchSale,
          profit: batchProfit,
          profitPercent: batchMargin,
        });

        remainingNeeded -= takeQty;
        slCounter++;
      }
    }

    // If still remaining quantity (e.g. opening stock or purchase not entered yet)
    if (remainingNeeded > 0) {
      // Find a primary or default supplier
      const fallbackSupplier =
        suppliers[index % Math.max(1, suppliers.length)] || {
          id: 'sup-default',
          name: 'Primary Depot / Store Stock',
        };

      const fallbackCost = takeFallbackCost(defaultCost, item.unitPrice);
      const batchCost = remainingNeeded * fallbackCost;
      const batchSale = remainingNeeded * item.unitPrice;
      const batchProfit = batchSale - batchCost;
      const batchMargin = batchSale > 0 ? (batchProfit / batchSale) * 100 : 0;

      allocatedBatches.push({
        productId: item.productId,
        productName: item.productName,
        barcode: item.barcode,
        unit: item.unit || product?.unit || 'Pcs',
        supplierId: fallbackSupplier.id,
        supplierName: fallbackSupplier.name,
        supplierSl: `SL-${String(slCounter).padStart(2, '0')} (Lot/Opening)`,
        purchaseNo: 'LOT-OPEN',
        purchaseDate: invoice.date,
        quantity: remainingNeeded,
        unitCost: fallbackCost,
        unitPrice: item.unitPrice,
        totalCost: batchCost,
        totalSale: batchSale,
        profit: batchProfit,
        profitPercent: batchMargin,
      });
    }

    const itemTotalCost = allocatedBatches.reduce((sum, b) => sum + b.totalCost, 0);
    const itemProfit = itemTotalSale - itemTotalCost;

    totalCostAmount += itemTotalCost;
    totalSaleAmount += itemTotalSale;

    itemAllocations.push({
      itemIndex: index + 1,
      productId: item.productId,
      productName: item.productName,
      barcode: item.barcode,
      unit: item.unit || product?.unit || 'Pcs',
      totalQuantity: item.quantity,
      unitPrice: item.unitPrice,
      itemTotalSale,
      itemTotalCost,
      itemProfit,
      batches: allocatedBatches,
    });
  });

  const grossProfit = totalSaleAmount - totalCostAmount;
  const discountAmount = invoice.discountAmount || 0;
  const vatAmount = invoice.vatAmount || 0;
  const otherCost = invoice.otherCost || 0;
  const netProfit = grossProfit - discountAmount + otherCost;
  const profitMarginPercent =
    invoice.grandTotal > 0 ? (netProfit / invoice.grandTotal) * 100 : 0;

  return {
    items: itemAllocations,
    totalSaleAmount,
    totalCostAmount,
    grossProfit,
    discountAmount,
    vatAmount,
    otherCost,
    netProfit,
    profitMarginPercent,
  };
}

function takeFallbackCost(cost: number, sellPrice: number): number {
  if (cost > 0) return cost;
  if (sellPrice > 0) return Math.round(sellPrice * 0.75 * 100) / 100;
  return 0;
}
