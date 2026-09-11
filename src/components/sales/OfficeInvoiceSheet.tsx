import React, { useEffect, useRef } from 'react';
import { SaleInvoice, PurchaseInvoice, Product, Supplier, ShopSettings } from '../../types';
import { calculateInvoiceSupplierProfit } from '../../utils/supplierAllocation';
import { numberToWords } from '../../utils/numberToWords';
import { ShieldCheck, TrendingUp, Layers, Building2, DollarSign } from 'lucide-react';
import JsBarcode from 'jsbarcode';

interface OfficeInvoiceSheetProps {
  invoice: SaleInvoice;
  shopSettings: ShopSettings;
  language: 'en' | 'bn';
  purchases: PurchaseInvoice[];
  products: Product[];
  suppliers: Supplier[];
}

export const OfficeInvoiceSheet: React.FC<OfficeInvoiceSheetProps> = ({
  invoice,
  shopSettings,
  language,
  purchases,
  products,
  suppliers,
}) => {
  const barcodeSvgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeSvgRef.current && invoice) {
      try {
        JsBarcode(barcodeSvgRef.current, invoice.invoiceNo, {
          format: 'CODE128',
          lineColor: '#0f172a',
          width: 1.3,
          height: 32,
          displayValue: false,
          margin: 0,
        });
      } catch (err) {
        console.error('Office invoice barcode error:', err);
      }
    }
  }, [invoice]);

  // Calculate FIFO Supplier SL allocation and profit summary
  const profitSummary = calculateInvoiceSupplierProfit(
    invoice,
    purchases,
    products,
    suppliers
  );

  const totalQuantity = invoice.items.reduce((sum, i) => sum + i.quantity, 0);
  const inWords = numberToWords(invoice.grandTotal);

  return (
    <div className="w-full bg-white text-slate-800 font-sans text-xs">
      {/* Office Top Confidential Banner */}
      <div className="mb-3 px-3 py-1.5 bg-slate-900 text-white rounded-md flex flex-wrap items-center justify-between text-[11px]">
        <div className="flex items-center gap-2 font-bold tracking-wide">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            {language === 'bn'
              ? '🔒 অফিস কপি • অভ্যন্তরীণ হিসাব ও সরবরাহকারী ব্যাচ (FIFO) বিবরণী'
              : '🔒 OFFICE COPY • Internal Accounts & Supplier SL (FIFO) Record'}
          </span>
        </div>
        <span className="text-slate-300 text-[10px]">
          {language === 'bn' ? 'শুধুমাত্র অফিস ও হিসাবরক্ষকের জন্য' : 'Confidential / Store Audit'}
        </span>
      </div>

      {/* Header 3-Column Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-4 pb-4 border-b border-slate-300">
        {/* Left Column: Customer details */}
        <div className="space-y-1">
          <div className="text-[13px] font-bold text-slate-900">
            {language === 'bn' ? 'গ্রাহক:' : 'CUSTOMER:'}{' '}
            <span className="font-extrabold">{invoice.customerName}</span>
          </div>
          <div className="text-slate-700">
            <span className="font-semibold">{language === 'bn' ? 'মোবাইল:' : 'Mobile:'}</span>{' '}
            {invoice.customerMobile || '01758069547'}
          </div>
          <div className="text-slate-700">
            <span className="font-semibold">{language === 'bn' ? 'ঠিকানা:' : 'Address:'}</span>{' '}
            {invoice.customerAddress || 'uddaypur rasta matha'}
          </div>
          <div className="text-[11px] text-slate-600">
            <span className="font-semibold">{language === 'bn' ? 'বিক্রয় কর্মী:' : 'Sales Rep / SR:'}</span>{' '}
            {invoice.sr || 'Counter Admin'}
          </div>
        </div>

        {/* Center Column: Shop Logo & Information */}
        <div className="text-center space-y-0.5">
          {shopSettings.logoUrl ? (
            <div className="flex justify-center mb-1">
              <img
                src={shopSettings.logoUrl}
                alt="Logo"
                className="h-10 max-w-[150px] object-contain"
              />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center bg-slate-900 text-white font-extrabold text-base tracking-wider px-5 py-1 rounded-full shadow-2xs mb-1">
              {shopSettings.logoText || 'OKY'}
            </div>
          )}

          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
            {shopSettings.shopName || 'Supper Shop'}
          </h2>
          <p className="text-[11px] text-slate-600 font-medium">
            {shopSettings.address || 'Chuadanga'}
          </p>
          <p className="text-[11px] text-slate-600 font-medium font-mono">
            {shopSettings.mobile || '01401371860'}
          </p>
        </div>

        {/* Right Column: Office Badge & Metadata */}
        <div className="sm:text-right space-y-1">
          <div className="sm:flex sm:justify-end">
            <span className="inline-block px-3 py-0.5 bg-slate-800 text-white font-black text-[11px] rounded uppercase tracking-wider">
              {language === 'bn' ? 'অফিস কপি (Office Copy)' : 'Office Copy'}
            </span>
          </div>
          <div className="text-slate-900 font-bold text-[11px]">
            INVOICE No: <span className="font-mono">{invoice.invoiceNo}</span>
          </div>

          {/* Barcode SVG */}
          <div className="sm:flex sm:justify-end my-1">
            <svg ref={barcodeSvgRef} className="max-h-8" />
          </div>

          <div className="text-[11px] text-slate-600">
            <span className="font-semibold">{language === 'bn' ? 'তারিখ:' : 'Date:'}</span>{' '}
            {invoice.date}
          </div>
        </div>
      </div>

      {/* Supplier SL Wise Breakdown Table (FIFO Deduction per user instruction) */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              {language === 'bn'
                ? 'পণ্য ও সরবরাহকারী ব্যাচ (Supplier SL Wise Deduction)'
                : 'Products & Supplier SL Breakdown (FIFO Allocation)'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 italic">
            {language === 'bn'
              ? '*একই পণ্যের ক্ষেত্রে পূর্বে প্রাপ্ত সরবরাহকারীর SL থেকে স্টক সমন্বয় করা হয়েছে'
              : '*First Supplier SL fulfilled before allocating to next Supplier SL'}
          </span>
        </div>

        <div className="border border-slate-700 rounded-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white font-bold text-[11px]">
                <th className="py-2 px-2.5 w-10 text-center border-r border-slate-600">SL</th>
                <th className="py-2 px-3 border-r border-slate-600">
                  {language === 'bn' ? 'পণ্য / কোড' : 'PRODUCT / ITEM'}
                </th>
                <th className="py-2 px-3 border-r border-slate-600">
                  {language === 'bn' ? 'সরবরাহকারী ও চালান (Supplier SL)' : 'SUPPLIER LOT / SL'}
                </th>
                <th className="py-2 px-2 w-14 text-center border-r border-slate-600">
                  {language === 'bn' ? 'পরিমাণ' : 'QTY'}
                </th>
                <th className="py-2 px-2.5 w-20 text-right border-r border-slate-600">
                  {language === 'bn' ? 'কেনা (৳)' : 'COST'}
                </th>
                <th className="py-2 px-2.5 w-20 text-right border-r border-slate-600">
                  {language === 'bn' ? 'বিক্রি (৳)' : 'SELL'}
                </th>
                <th className="py-2 px-2.5 w-24 text-right border-r border-slate-600">
                  {language === 'bn' ? 'মোট কেনা' : 'TOT COST'}
                </th>
                <th className="py-2 px-2.5 w-24 text-right border-r border-slate-600">
                  {language === 'bn' ? 'মোট বিক্রি' : 'TOT SELL'}
                </th>
                <th className="py-2 px-3 w-28 text-right bg-slate-900 text-emerald-400">
                  {language === 'bn' ? 'মুনাফা (লাভ)' : 'PROFIT'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {profitSummary.items.map((itemAlloc) => {
                const hasMultipleBatches = itemAlloc.batches.length > 1;

                return itemAlloc.batches.map((batch, batchIdx) => {
                  const isFirstBatch = batchIdx === 0;

                  return (
                    <tr
                      key={`${itemAlloc.productId}-${batchIdx}`}
                      className={`hover:bg-slate-50/60 ${
                        hasMultipleBatches ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      {/* SL Column (only shown on first batch or merged visually) */}
                      <td className="py-2 px-2.5 text-center font-bold text-slate-700 border-r border-slate-200">
                        {isFirstBatch ? itemAlloc.itemIndex : ''}
                      </td>

                      {/* Product Name Column */}
                      <td className="py-2 px-3 border-r border-slate-200">
                        {isFirstBatch ? (
                          <div>
                            <div className="font-bold text-slate-900">{itemAlloc.productName}</div>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                              <span>#{itemAlloc.barcode}</span>
                              {hasMultipleBatches && (
                                <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-sans font-semibold text-[9px]">
                                  {language === 'bn' ? 'একাধিক সরবরাহকারী' : 'Multi-Supplier'}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic pl-3">
                            ↳ {language === 'bn' ? 'একই পণ্য (পরবর্তী সরবরাহকারী ব্যাচ)' : 'Same Product (Next Batch)'}
                          </div>
                        )}
                      </td>

                      {/* Supplier & Batch SL Column */}
                      <td className="py-2 px-3 border-r border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-800 text-[11px]">
                              {batch.supplierName}
                            </span>
                            <div className="text-[10px] font-mono font-semibold text-indigo-700">
                              {batch.supplierSl}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Qty Fulfilled */}
                      <td className="py-2 px-2 text-center font-mono font-bold text-slate-900 border-r border-slate-200">
                        {batch.quantity}
                      </td>

                      {/* Unit Cost */}
                      <td className="py-2 px-2.5 text-right font-mono text-slate-600 border-r border-slate-200">
                        {batch.unitCost.toFixed(2)}
                      </td>

                      {/* Unit Sale Price */}
                      <td className="py-2 px-2.5 text-right font-mono text-slate-900 font-semibold border-r border-slate-200">
                        {batch.unitPrice.toFixed(2)}
                      </td>

                      {/* Total Cost */}
                      <td className="py-2 px-2.5 text-right font-mono text-slate-700 border-r border-slate-200">
                        {batch.totalCost.toFixed(2)}
                      </td>

                      {/* Total Sell */}
                      <td className="py-2 px-2.5 text-right font-mono font-semibold text-slate-900 border-r border-slate-200">
                        {batch.totalSale.toFixed(2)}
                      </td>

                      {/* Batch Profit */}
                      <td className="py-2 px-3 text-right font-mono font-bold bg-slate-50/50">
                        <span
                          className={
                            batch.profit >= 0 ? 'text-emerald-700' : 'text-red-600'
                          }
                        >
                          {batch.profit >= 0 ? '+' : ''}
                          {batch.profit.toFixed(2)}
                        </span>
                        <div className="text-[9px] text-slate-400">
                          ({batch.profitPercent.toFixed(1)}%)
                        </div>
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
            {/* Table Footer Totals */}
            <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-[11px]">
              <tr>
                <td colSpan={3} className="py-2 px-3 text-right uppercase text-slate-700">
                  {language === 'bn' ? 'মোট যোগফল:' : 'Total Item Totals:'}
                </td>
                <td className="py-2 px-2 text-center font-mono text-slate-900">
                  {totalQuantity}
                </td>
                <td className="py-2 px-2.5 border-r border-slate-300"></td>
                <td className="py-2 px-2.5 border-r border-slate-300"></td>
                <td className="py-2 px-2.5 text-right font-mono text-slate-900 border-r border-slate-300">
                  {profitSummary.totalCostAmount.toFixed(2)}
                </td>
                <td className="py-2 px-2.5 text-right font-mono text-slate-900 border-r border-slate-300">
                  {profitSummary.totalSaleAmount.toFixed(2)}
                </td>
                <td className="py-2 px-3 text-right font-mono text-emerald-800 bg-emerald-50">
                  +{profitSummary.grossProfit.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Office Accounting & Profit Summary Matrix */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        {/* Left: 4-Grid Profit Overview Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>
                {language === 'bn' ? 'চালানের মোট লাভ বিবরণী' : 'Invoice Net Profit Breakdown'}
              </span>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full">
              {profitSummary.netProfit >= 0
                ? `Net Margin: +${profitSummary.profitMarginPercent.toFixed(1)}%`
                : 'Loss'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-white p-2 rounded border border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium">
                {language === 'bn' ? 'মোট বিক্রয় মূল্য' : 'Total Sales'}
              </div>
              <div className="font-bold text-slate-900 font-mono text-xs">
                ৳{invoice.grandTotal.toFixed(2)}
              </div>
            </div>

            <div className="bg-white p-2 rounded border border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium">
                {language === 'bn' ? 'মোট ক্রয় খরচ (COGS)' : 'Total Cost (COGS)'}
              </div>
              <div className="font-bold text-slate-700 font-mono text-xs">
                ৳{profitSummary.totalCostAmount.toFixed(2)}
              </div>
            </div>

            <div className="bg-white p-2 rounded border border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium">
                {language === 'bn' ? 'প্রদত্ত মোট ছাড়' : 'Discount Given'}
              </div>
              <div className="font-bold text-slate-600 font-mono text-xs">
                -৳{profitSummary.discountAmount.toFixed(2)}
              </div>
            </div>

            <div className="bg-emerald-50/80 p-2 rounded border border-emerald-300">
              <div className="text-[10px] text-emerald-800 font-bold">
                {language === 'bn' ? 'প্রকৃত নিট মুনাফা (Net Profit)' : 'Net Profit'}
              </div>
              <div className="font-extrabold text-emerald-700 font-mono text-sm">
                +৳{profitSummary.netProfit.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-200">
            <span>{language === 'bn' ? 'পরিশোধ মাধ্যম:' : 'Payment:'} {invoice.paymentMethod}</span>
            <span>
              {language === 'bn' ? 'পরিশোধিত:' : 'Paid:'}{' '}
              <strong className="text-slate-800 font-mono">৳{invoice.paidAmount.toFixed(2)}</strong>
            </span>
          </div>
        </div>

        {/* Right side: Final Calculation Details */}
        <div className="space-y-1.5 text-xs text-slate-700 font-medium sm:text-right">
          <div className="flex justify-between sm:justify-end gap-6 py-0.5">
            <span className="text-slate-600">{language === 'bn' ? 'পণ্য বিক্রয় উপ-মোট:' : 'Gross Subtotal:'}</span>
            <span className="font-bold font-mono text-slate-900 min-w-[90px]">
              {invoice.subtotal.toFixed(2)} Tk
            </span>
          </div>

          <div className="flex justify-between sm:justify-end gap-6 py-0.5 text-slate-600">
            <span>{language === 'bn' ? 'পণ্য ক্রয় খরচ (COGS):' : 'Cost of Goods (COGS):'}</span>
            <span className="font-bold font-mono min-w-[90px]">
              -{profitSummary.totalCostAmount.toFixed(2)} Tk
            </span>
          </div>

          <div className="flex justify-between sm:justify-end gap-6 py-0.5 text-indigo-700">
            <span>{language === 'bn' ? 'মোট গ্রস লাভ (Gross Profit):' : 'Gross Profit:'}</span>
            <span className="font-bold font-mono min-w-[90px]">
              +{profitSummary.grossProfit.toFixed(2)} Tk
            </span>
          </div>

          {invoice.discountAmount > 0 && (
            <div className="flex justify-between sm:justify-end gap-6 py-0.5 text-red-600">
              <span>{language === 'bn' ? 'ছাড় বিয়োগ:' : 'Less Discount:'}</span>
              <span className="font-bold font-mono min-w-[90px]">
                -{invoice.discountAmount.toFixed(2)} Tk
              </span>
            </div>
          )}

          {/* Net Profit Highlight Row */}
          <div className="flex justify-between sm:justify-end gap-6 py-1.5 border-t-2 border-slate-400 bg-emerald-50 px-2 rounded font-bold text-emerald-900 text-xs">
            <span>{language === 'bn' ? 'চালানের নিট লাভ (Net Profit):' : 'INVOICE NET PROFIT:'}</span>
            <span className="font-black font-mono text-sm min-w-[90px]">
              +{profitSummary.netProfit.toFixed(2)} Tk
            </span>
          </div>

          <div className="flex justify-between sm:justify-end gap-6 py-1 border-t border-slate-300 font-bold text-slate-900">
            <span>{language === 'bn' ? 'গ্রাহকের নিকট মোট বিল:' : 'Invoice Bill to Customer:'}</span>
            <span className="font-extrabold font-mono min-w-[90px]">
              {invoice.grandTotal.toFixed(2)} Tk
            </span>
          </div>

          <div className="flex justify-between sm:justify-end gap-6 py-0.5 text-emerald-700">
            <span>{language === 'bn' ? 'আদায়কৃত ক্যাশ/পেমেন্ট:' : 'Cash Received:'}</span>
            <span className="font-bold font-mono min-w-[90px]">
              {invoice.paidAmount.toFixed(2)} Tk
            </span>
          </div>

          {invoice.dueAmount > 0 && (
            <div className="flex justify-between sm:justify-end gap-6 py-1 border-t border-slate-300 font-bold text-red-600">
              <span>{language === 'bn' ? 'অবশিষ্ট বকেয়া (Due):' : 'Remaining Due:'}</span>
              <span className="font-extrabold font-mono text-sm min-w-[90px]">
                {invoice.dueAmount.toFixed(2)} Tk
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Internal Audit / Office Verification Signatures */}
      <div className="mt-14 pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
        <div className="text-center">
          <div className="w-36 border-t border-dashed border-slate-400 mb-1"></div>
          <span className="text-slate-600 font-semibold text-[10px]">
            {language === 'bn' ? 'বিল প্রস্তুতকারী (Cashier)' : 'Prepared By (Cashier)'}
          </span>
        </div>

        <div className="text-center">
          <div className="w-40 border-t border-dashed border-slate-400 mb-1"></div>
          <span className="text-slate-600 font-semibold text-[10px]">
            {language === 'bn' ? 'গোডাউন ডেলিভারি (Store Keeper)' : 'Store Keeper / Dispatch'}
          </span>
        </div>

        <div className="text-center">
          <div className="w-40 border-t border-dashed border-slate-400 mb-1"></div>
          <span className="text-slate-600 font-semibold text-[10px]">
            {language === 'bn' ? 'হিসাব নিরীক্ষা (Accounts Approved)' : 'Accounts & Audit Approved'}
          </span>
        </div>
      </div>
    </div>
  );
};
