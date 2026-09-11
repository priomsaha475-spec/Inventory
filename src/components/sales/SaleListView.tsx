import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { SaleInvoice } from '../../types';
import {
  ShoppingBag,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Printer,
  AlertTriangle
} from 'lucide-react';

export const SaleListView: React.FC = () => {
  const {
    sales,
    language,
    setActiveView,
    viewInvoice,
    startEditSale,
    deleteSale,
    shopSettings
  } = useInventory();
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<SaleInvoice | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<SaleInvoice | null>(null);

  const filtered = sales.filter(
    (s) =>
      s.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="sale-list-view" className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-800">
              {language === 'bn' ? 'বিক্রয় চালান তালিকা' : 'Sales Invoices & Transactions'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete billing records, customer invoices, and retail receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('new_sale')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            {language === 'bn' ? 'নতুন বিক্রয় (Create Sale)' : 'Create Sale'}
          </button>
          <button
            onClick={() => setActiveView('pos_sale')}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            POS Sale
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative max-w-sm w-full text-xs">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name or invoice number..."
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} invoices
        </span>
      </div>

      {/* Table matching video 00:06 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">{language === 'bn' ? 'চালান নং' : 'Invoice No'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'গ্রাহক' : 'Customer'}</th>
                <th className="py-3 px-4 text-right">{language === 'bn' ? 'মোট টাকা' : 'Grand Total'}</th>
                <th className="py-3 px-4 text-right">{language === 'bn' ? 'পরিশোধিত' : 'Paid'}</th>
                <th className="py-3 px-4 text-right">{language === 'bn' ? 'বকেয়া' : 'Due'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="py-3 px-4 text-center">{language === 'bn' ? 'পেমেন্ট' : 'Method'}</th>
                <th className="py-3 px-4 text-center w-36">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">{s.invoiceNo}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{s.customerName}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ৳{s.grandTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-600">
                    ৳{s.paidAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-red-600">
                    ৳{s.dueAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{s.date}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => viewInvoice(s)}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-lg border border-slate-200 hover:border-emerald-200 transition-colors cursor-pointer"
                        title={language === 'bn' ? 'চালান রশিদ দেখুন' : 'View Invoice'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEditSale(s)}
                        className="p-1.5 text-slate-600 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 rounded-lg border border-slate-200 hover:border-amber-200 transition-colors cursor-pointer"
                        title={language === 'bn' ? 'চালান এডিট করুন' : 'Edit Sale'}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSaleToDelete(s)}
                        className="p-1.5 text-slate-600 hover:text-red-700 bg-slate-100 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
                        title={language === 'bn' ? 'চালান মুছে ফেলুন' : 'Delete Sale'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {saleToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'bn' ? 'চালান মুছে ফেলতে চান?' : 'Delete Sale Invoice?'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'bn'
                    ? `চালান নং ${saleToDelete.invoiceNo} (${saleToDelete.customerName}) মুছে ফেলা হবে। সংশ্লিষ্ট পণ্যের স্টক স্বয়ংক্রিয়ভাবে ইনভেন্টরিতে ফেরত দেওয়া হবে।`
                    : `Are you sure you want to delete invoice ${saleToDelete.invoiceNo}? Sold product quantities will automatically be returned to stock.`}
                </p>
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Invoice:</span>
                    <span className="font-bold text-slate-800">{saleToDelete.invoiceNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total:</span>
                    <span className="font-bold text-slate-900">৳{saleToDelete.grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Stock Reversal:</span>
                    <span className="font-bold text-emerald-600">{saleToDelete.items.length} items will be restored</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSaleToDelete(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSale(saleToDelete.id);
                  setSaleToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-700">{selectedInvoice.invoiceNo}</span>
                <h3 className="font-bold text-slate-800 text-sm">Sale Details</h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Thermal Print Slip View */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs space-y-2">
              <div className="text-center pb-2 border-b border-slate-200">
                <div className="font-bold text-slate-900 text-sm">{shopSettings.shopName}</div>
                <div className="text-[10px] text-slate-500">{shopSettings.address} • Support: {shopSettings.supportPhone || shopSettings.mobile}</div>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-semibold">{selectedInvoice.customerName}</span>
              </div>

              <div className="border-t border-b border-slate-200 py-2 space-y-1 my-2">
                {selectedInvoice.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[180px]">{it.productName} ({it.quantity}x)</span>
                    <span>৳{it.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>৳{selectedInvoice.subtotal.toFixed(2)}</span>
              </div>
              {selectedInvoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>-৳{selectedInvoice.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-300">
                <span>TOTAL:</span>
                <span>৳{selectedInvoice.grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Paid ({selectedInvoice.paymentMethod}):</span>
                <span>৳{selectedInvoice.paidAmount.toFixed(2)}</span>
              </div>
              {selectedInvoice.dueAmount > 0 && (
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Due:</span>
                  <span>৳{selectedInvoice.dueAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Slip
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
