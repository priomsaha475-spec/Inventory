import React, { useEffect, useRef } from 'react';
import { SaleInvoice, ShopSettings } from '../../types';
import { numberToWords } from '../../utils/numberToWords';
import JsBarcode from 'jsbarcode';

interface CustomerInvoiceSheetProps {
  invoice: SaleInvoice;
  shopSettings: ShopSettings;
  language: 'en' | 'bn';
}

export const CustomerInvoiceSheet: React.FC<CustomerInvoiceSheetProps> = ({
  invoice,
  shopSettings,
  language,
}) => {
  const barcodeSvgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeSvgRef.current && invoice) {
      try {
        JsBarcode(barcodeSvgRef.current, invoice.invoiceNo, {
          format: 'CODE128',
          lineColor: '#1e293b',
          width: 1.3,
          height: 32,
          displayValue: false,
          margin: 0,
        });
      } catch (err) {
        console.error('Customer invoice barcode error:', err);
      }
    }
  }, [invoice]);

  const totalQuantity = invoice.items.reduce((sum, i) => sum + i.quantity, 0);
  const inWords = numberToWords(invoice.grandTotal);
  const prevDue = invoice.previousDue !== undefined ? invoice.previousDue : 0;
  const currentTotalDue =
    invoice.currentTotalDue !== undefined
      ? invoice.currentTotalDue
      : invoice.grandTotal + prevDue - invoice.paidAmount;

  return (
    <div className="w-full bg-white text-slate-800 font-sans text-xs">
      {/* Header 3-Column Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-4 pb-4 border-b border-slate-200">
        {/* Left Column: Customer details */}
        <div className="space-y-1">
          <div className="text-[13px] font-bold text-slate-900">
            {language === 'bn' ? 'গ্রাহকের নাম:' : 'CUSTOMER:'}{' '}
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
          {invoice.note && (
            <div className="text-[11px] text-slate-500 italic">
              <span className="font-semibold">Note:</span> {invoice.note}
            </div>
          )}
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
            <div className="inline-flex items-center justify-center bg-red-600 text-white font-extrabold text-base tracking-wider px-5 py-1 rounded-full shadow-2xs mb-1">
              {shopSettings.logoText || 'OKY'}
            </div>
          )}

          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
            {shopSettings.shopName || 'Supper Shop'}
          </h2>
          {shopSettings.shopNameBn && (
            <p className="text-[11px] text-slate-700 font-semibold">{shopSettings.shopNameBn}</p>
          )}
          <p className="text-[11px] text-slate-600 font-medium">
            {shopSettings.address || 'Chuadanga'}
          </p>
          <p className="text-[11px] text-slate-600 font-medium font-mono">
            {shopSettings.mobile || '01401371860'}
          </p>
          {shopSettings.email && (
            <p className="text-[11px] text-slate-600 font-medium">{shopSettings.email}</p>
          )}
          {shopSettings.supportPhone && (
            <p className="text-[10px] text-emerald-700 font-semibold">
              Support: <span className="font-mono">{shopSettings.supportPhone}</span>
            </p>
          )}
        </div>

        {/* Right Column: Invoice badge & Metadata */}
        <div className="sm:text-right space-y-1">
          <div className="sm:flex sm:justify-end">
            <span className="inline-block px-3.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[11px] rounded-full uppercase tracking-wider border border-emerald-300">
              {language === 'bn' ? 'গ্রাহক কপি (Customer Copy)' : 'Customer Copy'}
            </span>
          </div>
          <div className="text-slate-800 font-semibold text-[11px]">
            INVOICE No:{' '}
            <span className="font-bold text-slate-900 font-mono">{invoice.invoiceNo}</span>
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

      {/* Items Table with Emerald Header */}
      <div className="mt-4 border border-emerald-600 rounded-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-emerald-600 text-white font-bold text-[11px]">
              <th className="py-2 px-3 w-12 text-center border-r border-emerald-500">SL</th>
              <th className="py-2 px-4 border-r border-emerald-500">
                {language === 'bn' ? 'পণ্যের বিবরণ' : 'PRODUCT'}
              </th>
              <th className="py-2 px-3 w-20 text-center border-r border-emerald-500">
                {language === 'bn' ? 'পরিমাণ' : 'QTY'}
              </th>
              <th className="py-2 px-3 w-28 text-right border-r border-emerald-500">
                {language === 'bn' ? 'দর (৳)' : 'PRICE'}
              </th>
              <th className="py-2 px-4 w-28 text-right">
                {language === 'bn' ? 'মোট (৳)' : 'TOTAL'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="py-2 px-3 text-center font-semibold text-slate-600 border-r border-slate-200">
                  {idx + 1}
                </td>
                <td className="py-2 px-4 font-medium text-slate-900 border-r border-slate-200">
                  <div>{item.productName}</div>
                  {item.barcode && (
                    <span className="text-[10px] text-slate-400 font-mono">#{item.barcode}</span>
                  )}
                </td>
                <td className="py-2 px-3 text-center text-slate-700 font-mono border-r border-slate-200">
                  {item.quantity} {item.unit || 'Pcs'}
                </td>
                <td className="py-2 px-3 text-right text-slate-800 font-mono border-r border-slate-200">
                  {item.unitPrice.toFixed(2)}
                </td>
                <td className="py-2 px-4 text-right font-mono font-semibold text-slate-900">
                  {item.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals & Calculations Section */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        {/* Left side: In Words, Quantities */}
        <div className="space-y-2">
          <div className="text-xs text-slate-700">
            <span className="font-bold text-slate-900">
              {language === 'bn' ? 'কথায়:' : 'In Word:'}{' '}
            </span>
            <span className="capitalize font-medium text-slate-800">{inWords} Only.</span>
          </div>
          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-800">
              {language === 'bn' ? 'মোট আইটেম:' : 'Total Items:'}{' '}
            </span>
            <span className="font-mono font-semibold text-slate-800">{invoice.items.length}</span>
            <span className="mx-2 text-slate-300">•</span>
            <span className="font-bold text-slate-800">
              {language === 'bn' ? 'মোট পরিমাণ:' : 'Total Qty:'}{' '}
            </span>
            <span className="font-mono font-semibold text-slate-800">{totalQuantity}</span>
          </div>
          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-800">
              {language === 'bn' ? 'পরিশোধ মাধ্যম:' : 'Payment Method:'}{' '}
            </span>
            <span className="font-semibold text-emerald-700">{invoice.paymentMethod}</span>
          </div>
        </div>

        {/* Right side: Calculation Breakdown */}
        <div className="space-y-1.5 text-xs text-slate-700 font-medium sm:text-right">
          <div className="flex justify-between sm:justify-end gap-6 py-0.5">
            <span className="text-slate-600">{language === 'bn' ? 'উপ-মোট:' : 'Subtotal:'}</span>
            <span className="font-bold font-mono text-slate-900 min-w-[90px]">
              {invoice.subtotal.toFixed(2)} Tk
            </span>
          </div>

          {invoice.discountAmount > 0 && (
            <div className="flex justify-between sm:justify-end gap-6 py-0.5 text-emerald-700">
              <span>{language === 'bn' ? 'ছাড় (Discount):' : 'Discount:'}</span>
              <span className="font-bold font-mono min-w-[90px]">
                -{invoice.discountAmount.toFixed(2)} Tk
              </span>
            </div>
          )}

          {invoice.vatAmount !== undefined && invoice.vatAmount > 0 && (
            <div className="flex justify-between sm:justify-end gap-6 py-0.5">
              <span className="text-slate-600">
                {language === 'bn' ? 'ভ্যাট / ট্যাক্স:' : 'Tax / VAT:'}
              </span>
              <span className="font-bold font-mono min-w-[90px]">
                +{invoice.vatAmount.toFixed(2)} Tk
              </span>
            </div>
          )}

          {invoice.otherCost > 0 && (
            <div className="flex justify-between sm:justify-end gap-6 py-0.5">
              <span className="text-slate-600">
                {invoice.otherCostName || (language === 'bn' ? 'অন্যান্য খরচ:' : 'Other Cost:')}
              </span>
              <span className="font-bold font-mono min-w-[90px]">
                +{invoice.otherCost.toFixed(2)} Tk
              </span>
            </div>
          )}

          <div className="flex justify-between sm:justify-end gap-6 py-1 border-t border-slate-300 font-bold text-slate-900 text-[13px]">
            <span>{language === 'bn' ? 'সর্বমোট প্রদেয়:' : 'Invoice Total:'}</span>
            <span className="font-extrabold font-mono min-w-[90px]">
              {invoice.grandTotal.toFixed(2)} Tk
            </span>
          </div>

          <div className="flex justify-between sm:justify-end gap-6 py-0.5 text-emerald-700">
            <span>{language === 'bn' ? 'পরিশোধ:' : 'Paid Amount:'}</span>
            <span className="font-bold font-mono min-w-[90px]">
              {invoice.paidAmount.toFixed(2)} Tk
            </span>
          </div>

          {invoice.dueAmount > 0 && (
            <div className="flex justify-between sm:justify-end gap-6 py-1 border-t border-slate-300 font-bold text-red-600">
              <span>{language === 'bn' ? 'বর্তমান বকেয়া:' : 'Due:'}</span>
              <span className="font-extrabold font-mono text-sm min-w-[90px]">
                {invoice.dueAmount.toFixed(2)} Tk
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Signatures Row */}
      <div className="mt-16 pt-6 flex justify-between items-end text-xs">
        <div className="text-center">
          <div className="w-40 border-t border-dashed border-slate-400 mb-1"></div>
          <span className="text-slate-600 font-medium text-[11px]">
            {language === 'bn' ? 'গ্রাহকের স্বাক্ষর' : 'Customer Signature'}
          </span>
        </div>

        <div className="text-center">
          <div className="w-44 border-t border-dashed border-slate-400 mb-1"></div>
          <span className="text-slate-600 font-medium text-[11px]">
            {language === 'bn' ? 'অনুমোদিত স্বাক্ষর' : 'Authorization Signature'}
          </span>
        </div>
      </div>

      {/* Footer Note */}
      {shopSettings.termsAndConditions ? (
        <div className="mt-10 pt-3 border-t border-slate-100 text-center text-[10px] text-slate-500 italic">
          {shopSettings.termsAndConditions}
        </div>
      ) : (
        <div className="mt-10 pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400">
          Thank you for shopping with us! Please keep this invoice for future reference.
        </div>
      )}
    </div>
  );
};
