import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { PurchaseInvoice } from '../../types';
import {
  Truck,
  Plus,
  Search,
  Printer,
  Trash2,
  X,
  Building,
  CreditCard,
  FileText,
} from 'lucide-react';

export const PurchaseListView: React.FC = () => {
  const { purchases, deletePurchase, language, setActiveView, shopSettings } = useInventory();
  const [search, setSearch] = useState('');
  const [activePurchase, setActivePurchase] = useState<PurchaseInvoice | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = purchases.filter(
    (p) =>
      p.purchaseNo.toLowerCase().includes(search.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      (p.supplierChallanNo && p.supplierChallanNo.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = (id: string) => {
    deletePurchase(id);
    setConfirmDeleteId(null);
    if (activePurchase?.id === id) {
      setActivePurchase(null);
    }
  };

  return (
    <div id="purchase-list-view" className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Truck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-800">
              {language === 'bn' ? 'ক্রয় তালিকা (Purchase List)' : 'Wholesale Purchase Orders'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            History of inward shipments, supplier invoices, and stock purchase records
          </p>
        </div>

        <button
          onClick={() => setActiveView('create_purchase')}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          {language === 'bn' ? 'নতুন ক্রয় তৈরি' : 'New Stock Purchase'}
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative max-w-sm w-full text-xs">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by supplier, purchase no, or challan..."
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} purchases
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Truck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700 text-sm">No purchase orders found</p>
              <p className="text-xs text-slate-400 mt-1">
                Click 'New Stock Purchase' above to create an inward purchase bill.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">{language === 'bn' ? 'ক্রয় নং' : 'Purchase No'}</th>
                  <th className="py-3 px-4">{language === 'bn' ? 'সরবরাহকারী' : 'Supplier'}</th>
                  <th className="py-3 px-4 text-right">{language === 'bn' ? 'মোট মূল্য' : 'Grand Total'}</th>
                  <th className="py-3 px-4 text-right">{language === 'bn' ? 'পরিশোধ' : 'Paid'}</th>
                  <th className="py-3 px-4 text-right">{language === 'bn' ? 'বকেয়া' : 'Due'}</th>
                  <th className="py-3 px-4">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                  <th className="py-3 px-4 text-center">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="py-3 px-4 text-center w-28">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-emerald-700">{p.purchaseNo}</div>
                      {p.supplierChallanNo && (
                        <div className="text-[10px] text-slate-400 font-mono">Challan: {p.supplierChallanNo}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{p.supplierName}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ৳{p.grandTotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 font-semibold">
                      ৳{p.paidAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-red-600 font-semibold">
                      ৳{p.dueAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{p.date}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setActivePurchase(p)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                        >
                          {language === 'bn' ? 'দেখুন' : 'View'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(p.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete purchase"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">
              {language === 'bn' ? 'ক্রয় চালান মুছে ফেলবেন?' : 'Delete Purchase Invoice?'}
            </h3>
            <p className="text-xs text-slate-600">
              {language === 'bn'
                ? 'এটি মুছে ফেললে যুক্ত হওয়া পণ্যের স্টক সমন্বয় হবে এবং সরবরাহকারীর বকেয়া সমন্বয় করা হবে।'
                : 'Deleting this will roll back the added stock quantities and adjust the supplier balance.'}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {activePurchase && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-700">{activePurchase.purchaseNo}</span>
                <h3 className="font-bold text-slate-800 text-sm">{activePurchase.supplierName}</h3>
                {activePurchase.supplierChallanNo && (
                  <p className="text-[11px] text-slate-400 font-mono">Challan: {activePurchase.supplierChallanNo}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActivePurchase(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700">Inward Items ({activePurchase.items.length}):</h4>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs overflow-hidden">
                {activePurchase.items.map((it, i) => (
                  <div key={i} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{it.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Barcode: {it.barcode}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-slate-800">
                        {it.quantity} × ৳{it.unitCost}
                      </div>
                      <div className="font-mono font-bold text-slate-900">৳{it.total.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">৳{activePurchase.subtotal.toFixed(2)}</span>
              </div>
              {activePurchase.otherCost && activePurchase.otherCost > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Transport / Other:</span>
                  <span className="font-mono">৳{activePurchase.otherCost.toFixed(2)}</span>
                </div>
              )}
              {activePurchase.discountAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Discount:</span>
                  <span className="font-mono text-red-600">-৳{activePurchase.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100 text-sm">
                <span>Grand Total:</span>
                <span className="font-mono text-emerald-700">৳{activePurchase.grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Paid ({activePurchase.paymentMethod}):</span>
                <span className="font-mono font-bold text-emerald-600">৳{activePurchase.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800">
                <span>Remaining Due:</span>
                <span
                  className={`font-mono ${
                    activePurchase.dueAmount > 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  ৳{activePurchase.dueAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Bill
              </button>
              <button
                type="button"
                onClick={() => setActivePurchase(null)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
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
