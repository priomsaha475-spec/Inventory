import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Product } from '../../types';
import {
  Package,
  Plus,
  Search,
  Scan,
  Printer,
  Edit2,
  Trash2,
  AlertTriangle,
  Barcode,
  ArrowUpDown,
  Filter,
  Eye,
} from 'lucide-react';

interface ProductListProps {
  onEditProduct?: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ onEditProduct }) => {
  const {
    products,
    brands,
    categories,
    deleteProduct,
    adjustStock,
    language,
    openScanner,
    setActiveView,
  } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [sortField, setSortField] = useState<keyof Product>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);

  // Quick adjust modal state
  const [quickAdjustProduct, setQuickAdjustProduct] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<'ADD' | 'REMOVE'>('ADD');
  const [adjustReason, setAdjustReason] = useState('Manual Stock Adjustment');

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.nameBn && p.nameBn.includes(searchTerm));

        const matchesBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;
        const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

        const matchesStock =
          stockFilter === 'ALL' ||
          (stockFilter === 'LOW' && p.stockQty > 0 && p.stockQty <= p.alertQty) ||
          (stockFilter === 'OUT' && p.stockQty <= 0);

        return matchesSearch && matchesBrand && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [products, searchTerm, selectedBrand, selectedCategory, stockFilter, sortField, sortAsc]);

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAdjustProduct) return;
    const delta = adjustType === 'ADD' ? adjustQty : -adjustQty;
    adjustStock(quickAdjustProduct.id, delta, adjustReason);
    setQuickAdjustProduct(null);
    setAdjustQty(1);
  };

  return (
    <div id="product-list-view" className="space-y-5">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-800">
              {language === 'bn' ? 'পণ্য তালিকা (Product List)' : 'Product Inventory List'}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {filteredProducts.length} {language === 'bn' ? 'টি পণ্য' : 'products'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'bn'
              ? 'সকল পণ্য, বারকোড এবং বর্তমান স্টক পরিমাণের সম্পূর্ণ তালিকা'
              : 'Complete repository of warehouse and super-shop inventory items with live barcodes'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Scanner for quick lookup */}
          <button
            onClick={() => openScanner('lookup')}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors border border-slate-200"
          >
            <Scan className="w-4 h-4 text-emerald-600" />
            {language === 'bn' ? 'স্ক্যান করে খুঁজুন' : 'Live Camera Scanner'}
          </button>

          <button
            onClick={() => setActiveView('new_product')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            {language === 'bn' ? 'নতুন পণ্য যোগ করুন' : 'Add New Product'}
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 text-xs">
          {/* Search box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'bn' ? 'নাম বা বারকোড দিয়ে সার্চ...' : 'Search by name or barcode...'}
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Brand Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full py-2.5 px-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="ALL">All Brands (সকল ব্র্যান্ড)</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2.5 px-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="ALL">All Categories (সকল ক্যাটাগরি)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="md:col-span-2">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="ALL">All Stocks</option>
              <option value="LOW">⚠️ Low Stock</option>
              <option value="OUT">🚫 Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table (matching the video "পণ্য তালিকা" columns) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">SL</th>
                <th className="py-3 px-4">{language === 'bn' ? 'পণ্য ও ছবি' : 'Product & Image'}</th>
                <th className="py-3 px-4 w-32">{language === 'bn' ? 'বারকোড' : 'Barcode'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'ব্র্যান্ড' : 'Brand'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                <th className="py-3 px-4 text-center">{language === 'bn' ? 'স্টক' : 'Stock Qty'}</th>
                <th className="py-3 px-4 text-right">{language === 'bn' ? 'ক্রয় মূল্য' : 'Cost Price'}</th>
                <th className="py-3 px-4 text-right">{language === 'bn' ? 'বিক্রয় মূল্য' : 'Sell Price'}</th>
                <th className="py-3 px-4 text-center w-36">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No products match the filter</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different keyword</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod, index) => {
                  const isLow = prod.stockQty > 0 && prod.stockQty <= prod.alertQty;
                  const isOut = prod.stockQty <= 0;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=80&q=80'}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-800 line-clamp-1">{prod.name}</div>
                            {prod.nameBn && (
                              <div className="text-[11px] text-slate-400 line-clamp-1">{prod.nameBn}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-200">
                            {prod.barcode}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{prod.brand}</td>
                      <td className="py-3 px-4">
                        <div className="text-slate-700 font-medium">{prod.category}</div>
                        {prod.subCategory && (
                          <div className="text-[10px] text-slate-400">{prod.subCategory}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                            isOut
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : isLow
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {prod.stockQty} {prod.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        ৳{prod.unitCost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ৳{prod.sellPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Quick Adjust stock */}
                          <button
                            onClick={() => setQuickAdjustProduct(prod)}
                            title="Adjust Stock Qty"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                          {/* Print Barcode Sticker */}
                          <button
                            onClick={() => setActiveView('barcode_generator')}
                            title="Print Barcode Label"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
                          >
                            <Barcode className="w-3.5 h-3.5" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${prod.name}?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            title="Delete Product"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stock Adjustment Modal */}
      {quickAdjustProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                {language === 'bn' ? 'স্টক পরিবর্তন করুন' : 'Stock Adjustment'}
              </h3>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {quickAdjustProduct.barcode}
              </span>
            </div>

            <div>
              <p className="font-semibold text-slate-800 text-xs">{quickAdjustProduct.name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Current Stock:{' '}
                <strong className="text-emerald-600 font-mono">
                  {quickAdjustProduct.stockQty} {quickAdjustProduct.unit}
                </strong>
              </p>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('ADD')}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    adjustType === 'ADD'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  + Increase Stock
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('REMOVE')}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    adjustType === 'REMOVE'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  - Decrease Stock
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 1)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Note</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                >
                  <option value="Manual Stock Adjustment">Manual Inventory Count</option>
                  <option value="Damaged / Expired">Damaged or Expired Goods</option>
                  <option value="New Shipment Received">New Shipment Unpacking</option>
                  <option value="Customer Return">Customer Return</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickAdjustProduct(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
