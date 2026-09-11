import React from 'react';
import { useInventory } from '../context/InventoryContext';
import {
  TrendingUp,
  ShoppingBag,
  Truck,
  DollarSign,
  Package,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Barcode,
  Eye,
  Calendar,
  Layers,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    products,
    sales,
    purchases,
    customers,
    suppliers,
    language,
    setActiveView,
  } = useInventory();

  // Aggregate Calculations
  const totalSalesAmount = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + p.grandTotal, 0);
  const totalProfit = Math.max(0, totalSalesAmount - totalPurchasesAmount * 0.7);
  const cashBalance = 60474.0 + totalSalesAmount - totalPurchasesAmount;

  const lowStockCount = products.filter((p) => p.stockQty > 0 && p.stockQty <= p.alertQty).length;
  const outOfStockCount = products.filter((p) => p.stockQty <= 0).length;

  const recentSales = sales.slice(0, 6);

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Quick Action Buttons Row (as seen at top in video 00:01) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <button
          onClick={() => setActiveView('pos_sale')}
          className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{language === 'bn' ? '+ নতুন বিক্রয়' : '+ POS Sale'}</span>
        </button>

        <button
          onClick={() => setActiveView('create_purchase')}
          className="p-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Truck className="w-4 h-4" />
          <span>{language === 'bn' ? '+ নতুন ক্রয়' : '+ New Purchase'}</span>
        </button>

        <button
          onClick={() => setActiveView('barcode_gen')}
          className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Barcode className="w-4 h-4" />
          <span>{language === 'bn' ? 'বারকোড প্রিন্টার' : 'Barcode Print'}</span>
        </button>

        <button
          onClick={() => setActiveView('new_product')}
          className="p-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Package className="w-4 h-4" />
          <span>{language === 'bn' ? '+ পণ্য যোগ' : '+ Add Product'}</span>
        </button>

        <button
          onClick={() => setActiveView('customers')}
          className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Users className="w-4 h-4" />
          <span>{language === 'bn' ? '+ কাস্টমার' : '+ Customer'}</span>
        </button>

        <button
          onClick={() => setActiveView('suppliers')}
          className="p-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Truck className="w-4 h-4" />
          <span>{language === 'bn' ? '+ সরবরাহক' : '+ Supplier'}</span>
        </button>

        <button
          onClick={() => setActiveView('barcode_generator')}
          className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Barcode className="w-4 h-4" />
          <span>{language === 'bn' ? 'বারকোড লেবেল' : 'Barcode Labels'}</span>
        </button>
      </div>

      {/* 4 Main Stat Cards (matching video 00:03) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Card */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'বিক্রয় (Total Sales)' : 'Total Sales'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800 font-mono">
              ৳{totalSalesAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <span>{sales.length} Invoices</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +12.4%
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* Purchase Card */}
        <div className="bg-white p-5 rounded-2xl border border-cyan-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'ক্রয় (Total Purchases)' : 'Total Purchases'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800 font-mono">
              ৳{totalPurchasesAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <span>{purchases.length} Shipments</span>
              <span>•</span>
              <span className="text-cyan-600 font-semibold flex items-center gap-0.5">
                <ArrowDownRight className="w-3.5 h-3.5" /> Normal
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500" />
        </div>

        {/* Gross Profit / Net Income */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'লাভ / আয় (Gross Margin)' : 'Gross Profit'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800 font-mono">
              ৳{totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <span className="text-emerald-600 font-semibold">+18.2% margin</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
        </div>

        {/* Account / Cash In Hand */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'ব্যালেন্স / ক্যাশ (Cash / Balance)' : 'Total Liquid Balance'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800 font-mono">
              ৳{cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <span className="text-purple-600 font-semibold">Active Drawer</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" />
        </div>
      </div>

      {/* Stock Health Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Total Products</div>
            <div className="text-base font-bold font-mono text-slate-800">{products.length} SKUs</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Low Stock Alert</div>
            <div className="text-base font-bold font-mono text-amber-600">{lowStockCount} items</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Out of Stock</div>
            <div className="text-base font-bold font-mono text-red-600">{outOfStockCount} items</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Registered Customers</div>
            <div className="text-base font-bold font-mono text-slate-800">{customers.length} clients</div>
          </div>
        </div>
      </div>

      {/* Recent Sales Table (সর্বশেষ চালান - matching video 00:06) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-sm">
              {language === 'bn' ? 'সর্বশেষ চালান (Recent Invoices)' : 'Recent Sales Invoices'}
            </h3>
          </div>
          <button
            onClick={() => setActiveView('sales')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            {language === 'bn' ? 'সব দেখুন →' : 'View All Invoices →'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">{language === 'bn' ? 'গ্রাহক' : 'Customer'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="py-3 px-4 text-right">{language === 'bn' ? 'মোট টাকা' : 'Grand Total'}</th>
                <th className="py-3 px-4 text-right">{language === 'bn' ? 'পরিশোধ' : 'Paid Amount'}</th>
                <th className="py-3 px-4 text-right">{language === 'bn' ? 'বকেয়া' : 'Due Amount'}</th>
                <th className="py-3 px-4 text-center w-24">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentSales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    <div>{s.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{s.invoiceNo}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{s.date}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ৳{s.grandTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-600 font-semibold">
                    ৳{s.paidAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-red-600 font-semibold">
                    ৳{s.dueAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setActiveView('sales')}
                      className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                    >
                      {language === 'bn' ? 'দেখুন' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
