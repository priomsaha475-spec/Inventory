import React, { useState, useRef, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Product } from '../../types';
import { playScannerBeep } from '../../utils/audio';
import { generateRandomBarcode } from '../../utils/barcode';
import {
  Truck,
  Plus,
  Minus,
  Trash2,
  Scan,
  Check,
  Building,
  Search,
  Printer,
  Calendar,
  DollarSign,
  FileText,
  Phone,
  MapPin,
  X,
  Package,
  Boxes,
  ArrowRight,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

interface PurchaseRow {
  product: Product;
  quantity: number;
  unitCost: number;
  total: number;
}

export const CreatePurchaseView: React.FC = () => {
  const {
    products,
    addProduct,
    brands,
    categories,
    units,
    suppliers,
    addSupplier,
    recordPurchase,
    language,
    showToast,
    setActiveView,
    shopSettings,
  } = useInventory();

  // Primary form state
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [purchaseDate, setPurchaseDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [supplierChallanNo, setSupplierChallanNo] = useState<string>('');
  const [purchaseNote, setPurchaseNote] = useState<string>('');

  // Barcode & Product search inputs
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [productSearch, setProductSearch] = useState<string>('');
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Rows & calculation state
  const [rows, setRows] = useState<PurchaseRow[]>([]);
  const [otherCost, setOtherCost] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank' | 'Cheque' | 'Mobile Banking'>('Cash');

  // Modals
  const [showSupplierModal, setShowSupplierModal] = useState<boolean>(false);
  const [showNewProductModal, setShowNewProductModal] = useState<boolean>(false);
  const [showCatalogModal, setShowCatalogModal] = useState<boolean>(false);
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogCategory, setCatalogCategory] = useState<string>('ALL');

  // Completed purchase state for invoice popup
  const [completedPurchase, setCompletedPurchase] = useState<any | null>(null);

  // Quick Supplier form
  const [newSupName, setNewSupName] = useState('');
  const [newSupMobile, setNewSupMobile] = useState('');
  const [newSupAddress, setNewSupAddress] = useState('');
  const [newSupOpening, setNewSupOpening] = useState<number>(0);

  // Quick Product form
  const [newProdName, setNewProdName] = useState('');
  const [newProdNameBn, setNewProdNameBn] = useState('');
  const [newProdBarcode, setNewProdBarcode] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('Pcs');
  const [newProdCost, setNewProdCost] = useState<number>(100);
  const [newProdSell, setNewProdSell] = useState<number>(130);
  const [newProdInwardQty, setNewProdInwardQty] = useState<number>(10);

  // Auto-select supplier if none selected
  useEffect(() => {
    if (!selectedSupplierId && suppliers.length > 0) {
      setSelectedSupplierId(suppliers[0].id);
    }
  }, [suppliers, selectedSupplierId]);

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  // Calculations
  const subtotal = rows.reduce((sum, r) => sum + r.total, 0);
  const totalItemsCount = rows.length;
  const totalQuantityCount = rows.reduce((sum, r) => sum + r.quantity, 0);
  const grandTotal = Math.max(0, subtotal + (otherCost || 0) - (discountAmount || 0));
  const dueAmount = Math.max(0, grandTotal - (paidAmount || 0));

  // Add a product to purchase list
  const addProductToPurchase = (product: Product, qty = 1, customCost?: number) => {
    const cost = customCost !== undefined ? customCost : product.unitCost;
    setRows((prev) => {
      const existingIdx = prev.findIndex((r) => r.product.id === product.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + qty;
        const finalCost = customCost !== undefined ? customCost : updated[existingIdx].unitCost;
        updated[existingIdx] = {
          ...updated[existingIdx],
          unitCost: finalCost,
          quantity: newQty,
          total: newQty * finalCost,
        };
        return updated;
      }
      return [
        ...prev,
        {
          product,
          quantity: Math.max(1, qty),
          unitCost: cost,
          total: Math.max(1, qty) * cost,
        },
      ];
    });

    try {
      playScannerBeep('success');
    } catch {
      // ignore
    }
    showToast(
      language === 'bn' ? `তালিকায় যুক্ত হয়েছে: ${product.name}` : `Added to purchase: ${product.name}`
    );
  };

  // Barcode submit handler
  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = barcodeInput.trim();
    if (!clean) return;

    const matched = products.find(
      (p) => p.barcode.toLowerCase() === clean.toLowerCase()
    );

    if (matched) {
      addProductToPurchase(matched, 1);
      setBarcodeInput('');
    } else {
      try {
        playScannerBeep('error');
      } catch {
        // ignore
      }
      // Offer to create product with this barcode
      setNewProdBarcode(clean);
      setNewProdName('');
      setNewProdNameBn('');
      setNewProdBrand(brands[0]?.name || 'General');
      setNewProdCategory(categories[0]?.name || 'General');
      setNewProdUnit(units[0]?.name || 'Pcs');
      setNewProdCost(100);
      setNewProdSell(130);
      setNewProdInwardQty(10);
      setShowNewProductModal(true);
      showToast(
        language === 'bn'
          ? `বারকোড '${clean}' ইনভেন্টরিতে নেই। নতুন পণ্য তৈরি করুন।`
          : `Barcode '${clean}' not found. Please create this product.`,
        'warning'
      );
    }
  };

  // Update quantity
  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      setRows((prev) => prev.filter((r) => r.product.id !== productId));
      return;
    }
    setRows((prev) =>
      prev.map((r) =>
        r.product.id === productId ? { ...r, quantity: qty, total: qty * r.unitCost } : r
      )
    );
  };

  // Update unit cost
  const updateCost = (productId: string, cost: number) => {
    const validCost = Math.max(0, cost);
    setRows((prev) =>
      prev.map((r) =>
        r.product.id === productId ? { ...r, unitCost: validCost, total: r.quantity * validCost } : r
      )
    );
  };

  // Complete purchase
  const handleCompletePurchase = () => {
    if (rows.length === 0) {
      showToast(
        language === 'bn' ? 'অনুগ্রহ করে ক্রয়ের জন্য পণ্য যুক্ত করুন' : 'Please add items to purchase',
        'warning'
      );
      return;
    }

    const recorded = recordPurchase({
      date: purchaseDate,
      supplierId: selectedSupplier?.id || 'sup-general',
      supplierName: selectedSupplier ? selectedSupplier.name : 'General Wholesale Depot',
      supplierChallanNo: supplierChallanNo.trim() || undefined,
      note: purchaseNote.trim() || undefined,
      items: rows.map((r) => ({
        productId: r.product.id,
        productName: r.product.name,
        barcode: r.product.barcode,
        quantity: r.quantity,
        unitCost: r.unitCost,
        total: r.total,
      })),
      subtotal,
      otherCost: otherCost || 0,
      discountAmount: discountAmount || 0,
      grandTotal,
      paidAmount: paidAmount || 0,
      dueAmount,
      paymentMethod,
      status: dueAmount === 0 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'DUE',
    });

    try {
      playScannerBeep('success');
    } catch {
      // ignore
    }

    setCompletedPurchase(recorded);
  };

  // Reset form for next purchase
  const handleResetForm = () => {
    setRows([]);
    setOtherCost(0);
    setDiscountAmount(0);
    setPaidAmount(0);
    setSupplierChallanNo('');
    setPurchaseNote('');
    setBarcodeInput('');
    setProductSearch('');
    setCompletedPurchase(null);
  };

  // Filtered products for live search dropdown
  const filteredSearchProducts = productSearch.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            (p.nameBn && p.nameBn.includes(productSearch)) ||
            p.barcode.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.category.toLowerCase().includes(productSearch.toLowerCase())
        )
        .slice(0, 8)
    : [];

  // Filtered products for catalog modal
  const filteredCatalogProducts = products.filter((p) => {
    const matchesCat = catalogCategory === 'ALL' || p.category === catalogCategory;
    const matchesSearch =
      !catalogSearch.trim() ||
      p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.barcode.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div id="create-purchase-view" className="space-y-5 pb-12">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Truck className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {language === 'bn' ? 'ক্রয় চালান তৈরি (Create Purchase)' : 'New Stock Purchase (Inward)'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'bn'
                  ? 'সরবরাহকারী থেকে নতুন পণ্য ইনভেন্টরি স্টকে যুক্ত করুন ও চালান তৈরি করুন'
                  : 'Replenish stock from wholesale suppliers, manage inward bills & update purchase costs'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setNewProdBarcode(generateRandomBarcode('01'));
              setNewProdName('');
              setNewProdNameBn('');
              setNewProdBrand(brands[0]?.name || 'General');
              setNewProdCategory(categories[0]?.name || 'General');
              setNewProdUnit(units[0]?.name || 'Pcs');
              setNewProdCost(100);
              setNewProdSell(130);
              setNewProdInwardQty(10);
              setShowNewProductModal(true);
            }}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {language === 'bn' ? '+ নতুন পণ্য তৈরি' : '+ New Product'}
          </button>
          <button
            type="button"
            onClick={() => setShowCatalogModal(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors"
          >
            <Boxes className="w-4 h-4 text-slate-500" />
            {language === 'bn' ? 'ক্যাটালগ থেকে নির্বাচন' : 'Browse Catalog'}
          </button>
          <button
            type="button"
            onClick={() => setActiveView('purchases')}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FileText className="w-4 h-4" />
            {language === 'bn' ? 'ক্রয় ইতিহাস' : 'Purchase Orders'}
          </button>
        </div>
      </div>

      {/* Supplier & Purchase Meta Row */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Supplier */}
          <div className="md:col-span-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {language === 'bn' ? 'সরবরাহকারী (Supplier) *' : 'Supplier / Vendor *'}
              </label>
              <button
                type="button"
                onClick={() => setShowSupplierModal(true)}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                {language === 'bn' ? 'নতুন সরবরাহকারী' : '+ Add Supplier'}
              </button>
            </div>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              {suppliers.length === 0 && (
                <option value="">No suppliers found. Click '+ Add Supplier'</option>
              )}
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.mobile} ({s.address || 'Local'})
                </option>
              ))}
            </select>

            {selectedSupplier && (
              <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> {selectedSupplier.mobile}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> {selectedSupplier.address}
                </span>
                {selectedSupplier.payable > 0 && (
                  <span className="font-bold text-red-600 font-mono">
                    Due: ৳{selectedSupplier.payable.toFixed(2)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {language === 'bn' ? 'ক্রয়ের তারিখ (Date) *' : 'Purchase Date *'}
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full text-xs font-mono font-semibold rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* Supplier Challan / Memo No */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              {language === 'bn' ? 'চালান / মেমো নম্বর' : 'Challan / Memo No.'}
            </label>
            <input
              type="text"
              placeholder="e.g. CH-9821 / Memo-45"
              value={supplierChallanNo}
              onChange={(e) => setSupplierChallanNo(e.target.value)}
              className="w-full text-xs font-mono rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* Payment Method */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              {language === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Mode'}
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="Cash">Cash (নগদ)</option>
              <option value="Bank">Bank (ব্যাংক)</option>
              <option value="Mobile Banking">bKash / Nagad</option>
              <option value="Cheque">Cheque (চেক)</option>
            </select>
          </div>
        </div>

        {/* Dual Adding Bar: Search by Name/Category OR Barcode Scanner */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Product by Name/Code with Autocomplete Dropdown */}
          <div className="md:col-span-7 relative">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={productSearch}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setShowSearchDropdown(true);
                }}
                placeholder={
                  language === 'bn'
                    ? 'পণ্যের নাম বা ক্যাটাগরি লিখে খুঁজুন...'
                    : 'Search products by name, code or category to add...'
                }
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              {productSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setProductSearch('');
                    setShowSearchDropdown(false);
                  }}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Floating Dropdown Results */}
            {showSearchDropdown && productSearch.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-72 overflow-y-auto divide-y divide-slate-100">
                {filteredSearchProducts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    <p>No products matching "{productSearch}"</p>
                    <button
                      type="button"
                      onClick={() => {
                        setNewProdName(productSearch);
                        setNewProdBarcode(generateRandomBarcode('01'));
                        setNewProdCost(100);
                        setNewProdSell(130);
                        setShowSearchDropdown(false);
                        setShowNewProductModal(true);
                      }}
                      className="mt-2 text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create "{productSearch}" as new product
                    </button>
                  </div>
                ) : (
                  filteredSearchProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        addProductToPurchase(p, 1);
                        setProductSearch('');
                        setShowSearchDropdown(false);
                      }}
                      className="p-3 hover:bg-emerald-50/60 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-xs">{p.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                            <span>Code: {p.barcode}</span>
                            <span>•</span>
                            <span>Stock: {p.stockQty} {p.unit}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-emerald-700">Cost: ৳{p.unitCost}</div>
                        <div className="text-[10px] text-slate-400">Sell: ৳{p.sellPrice}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Quick Barcode Scanner Input */}
          <div className="md:col-span-5">
            <form onSubmit={handleBarcodeSubmit} className="relative flex items-center">
              <Scan className="w-4 h-4 absolute left-3 text-emerald-600" />
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder={
                  language === 'bn' ? 'বারকোড স্ক্যান বা কোড লিখে এন্টার দিন...' : 'Scan / type barcode & hit Enter...'
                }
                className="w-full text-xs rounded-xl border border-emerald-300 bg-emerald-50/30 pl-9 pr-20 py-2.5 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              <button
                type="submit"
                className="absolute right-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                + Add
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Items Table & Billing Settlement Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Purchased Items Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-slate-800">
                {language === 'bn' ? 'ক্রয়কৃত পণ্যের তালিকা' : 'Inward Purchase Items'} ({totalItemsCount})
              </h2>
              {totalQuantityCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                  Total Qty: {totalQuantityCount}
                </span>
              )}
            </div>

            {rows.length > 0 && (
              <button
                type="button"
                onClick={() => setRows([])}
                className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {language === 'bn' ? 'সব মুছুন' : 'Clear All'}
              </button>
            )}
          </div>

          <div className="overflow-x-auto flex-1 min-h-[300px]">
            {rows.length === 0 ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3 border border-emerald-100">
                  <Truck className="w-7 h-7" />
                </div>
                <p className="font-bold text-slate-700 text-sm">
                  {language === 'bn' ? 'কোনো পণ্য যুক্ত করা হয়নি' : 'No items added to this purchase yet'}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  {language === 'bn'
                    ? 'উপরের সার্চ বার অথবা বারকোড স্ক্যানার ব্যবহার করে পণ্য যুক্ত করুন, অথবা ক্যাটালগ থেকে নির্বাচন করুন।'
                    : 'Search products by name above, scan a barcode, or browse the wholesale catalog to begin.'}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowCatalogModal(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    {language === 'bn' ? 'ক্যাটালগ ব্রাউজ করুন' : 'Browse Product Catalog'}
                  </button>
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4 w-10 text-center">#</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'পণ্যের বিবরণ' : 'Product Details'}</th>
                    <th className="py-3 px-3 text-center">{language === 'bn' ? 'বর্তমান স্টক' : 'Cur Stock'}</th>
                    <th className="py-3 px-3 w-28">{language === 'bn' ? 'ক্রয় মূল্য (৳)' : 'Unit Cost (৳)'}</th>
                    <th className="py-3 px-3 w-36 text-center">{language === 'bn' ? 'পরিমাণ' : 'Inward Qty'}</th>
                    <th className="py-3 px-3 text-center">{language === 'bn' ? 'পরবর্তী স্টক' : 'After Stock'}</th>
                    <th className="py-3 px-4 w-28 text-right">{language === 'bn' ? 'মোট (৳)' : 'Total (৳)'}</th>
                    <th className="py-3 px-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, idx) => {
                    const newEstimatedStock = row.product.stockQty + row.quantity;
                    return (
                      <tr key={row.product.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-mono text-center">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{row.product.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                            <span>Code: {row.product.barcode}</span>
                            <span>•</span>
                            <span className="text-emerald-700 bg-emerald-50 px-1 rounded">{row.product.category}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-600 font-semibold">
                          {row.product.stockQty} {row.product.unit}
                        </td>
                        <td className="py-3 px-3">
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.unitCost}
                              onChange={(e) => updateCost(row.product.id, parseFloat(e.target.value) || 0)}
                              className="w-24 px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-800 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(row.product.id, row.quantity - 1)}
                              className="w-6 h-6 rounded-md border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={row.quantity}
                              onChange={(e) => updateQuantity(row.product.id, parseInt(e.target.value) || 1)}
                              className="w-14 text-center py-1 text-xs border border-slate-200 rounded-lg font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => updateQuantity(row.product.id, row.quantity + 1)}
                              className="w-6 h-6 rounded-md border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700 bg-emerald-50/40">
                          {newEstimatedStock} {row.product.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          ৳{row.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => setRows((prev) => prev.filter((r) => r.product.id !== row.product.id))}
                            className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Calculation & Settlement Panel */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {language === 'bn' ? 'ক্রয় বিল হিসাব' : 'Purchase Settlement'}
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Items: {totalItemsCount} | Qty: {totalQuantityCount}
            </span>
          </div>

          <div className="space-y-3">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>{language === 'bn' ? 'পণ্য মূল্য (Subtotal):' : 'Subtotal:'}</span>
              <span className="font-mono font-bold text-slate-800 text-sm">৳{subtotal.toFixed(2)}</span>
            </div>

            {/* Carrying / Other Cost */}
            <div className="flex items-center justify-between text-xs gap-3">
              <span className="text-slate-600">{language === 'bn' ? 'পরিবহন/অন্যান্য খরচ:' : 'Transport / Other Cost:'}</span>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={otherCost || ''}
                  placeholder="0"
                  onChange={(e) => setOtherCost(parseFloat(e.target.value) || 0)}
                  className="w-24 text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 font-mono text-right text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Discount */}
            <div className="flex items-center justify-between text-xs gap-3">
              <span className="text-slate-600">{language === 'bn' ? 'ছাড় (Discount):' : 'Discount:'}</span>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={discountAmount || ''}
                  placeholder="0"
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="w-24 text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 font-mono text-right text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Grand Total */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-900 block">
                  {language === 'bn' ? 'সর্বমোট প্রদেয়:' : 'Net Grand Total:'}
                </span>
                <span className="text-[10px] text-emerald-700">All taxes & costs included</span>
              </div>
              <span className="text-2xl font-bold font-mono text-emerald-700">৳{grandTotal.toFixed(2)}</span>
            </div>

            {/* Paid & Due Breakdown */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  {language === 'bn' ? 'পরিশোধিত টাকা (Paid Amount):' : 'Paid Amount:'}
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaidAmount(grandTotal)}
                    className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-md transition-colors"
                  >
                    Full Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaidAmount(0)}
                    className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                  >
                    Full Due
                  </button>
                </div>
              </div>
              <input
                type="number"
                min="0"
                value={paidAmount || ''}
                placeholder="0"
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Remaining Due */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                {language === 'bn' ? 'অবশিষ্ট বকেয়া (Remaining Due):' : 'Remaining Due:'}
              </span>
              <span
                className={`font-mono text-base font-bold ${
                  dueAmount > 0 ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                ৳{dueAmount.toFixed(2)}
              </span>
            </div>

            {/* Optional Note / Remarks */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {language === 'bn' ? 'মন্তব্য / নোট (Note)' : 'Remarks / Note'}
              </label>
              <textarea
                rows={2}
                value={purchaseNote}
                onChange={(e) => setPurchaseNote(e.target.value)}
                placeholder="Optional supplier memo notes, driver info or condition..."
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Confirm Purchase Action */}
          <button
            type="button"
            onClick={handleCompletePurchase}
            disabled={rows.length === 0}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            {language === 'bn'
              ? 'ক্রয় সম্পন্ন ও স্টক আপডেট করুন (Confirm Purchase)'
              : 'Record Purchase & Update Inventory Stock'}
          </button>
        </div>
      </div>

      {/* Catalog Browser Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  {language === 'bn' ? 'পণ্য ক্যাটালগ ব্রাউজ করুন' : 'Browse Wholesale Catalog'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Filter by product name or barcode..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800"
                />
              </div>
              <select
                value={catalogCategory}
                onChange={(e) => setCatalogCategory(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 font-semibold"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl min-h-[260px] max-h-[400px]">
              {filteredCatalogProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No products found matching criteria.
                </div>
              ) : (
                filteredCatalogProducts.map((p) => {
                  const alreadyInRow = rows.find((r) => r.product.id === p.id);
                  return (
                    <div
                      key={p.id}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{p.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                          <span>Barcode: {p.barcode}</span>
                          <span>•</span>
                          <span>Category: {p.category}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-600">Stock: {p.stockQty} {p.unit}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-emerald-700">৳{p.unitCost}</div>
                          <div className="text-[10px] text-slate-400">Cost Rate</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addProductToPurchase(p, 1)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                            alreadyInRow
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {alreadyInRow ? `In List (${alreadyInRow.quantity})` : 'Add'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                {rows.length} items currently in inward order
              </span>
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
              >
                Done Selecting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                {language === 'bn' ? 'নতুন সরবরাহকারী যোগ করুন' : 'Add Wholesale Supplier'}
              </h3>
              <button
                type="button"
                onClick={() => setShowSupplierModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Supplier Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Meghna Wholesale Depot"
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Mobile Number *</label>
                <input
                  type="text"
                  placeholder="e.g. 01711000000"
                  value={newSupMobile}
                  onChange={(e) => setNewSupMobile(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Depot / Warehouse Address</label>
                <input
                  type="text"
                  placeholder="e.g. Khatungonj, Chattogram"
                  value={newSupAddress}
                  onChange={(e) => setNewSupAddress(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Opening Balance (Due) ৳</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={newSupOpening || ''}
                  onChange={(e) => setNewSupOpening(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSupplierModal(false)}
                className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newSupName.trim()) {
                    showToast('Please enter supplier name', 'warning');
                    return;
                  }
                  const created = addSupplier({
                    name: newSupName.trim(),
                    mobile: newSupMobile.trim() || '01700000000',
                    address: newSupAddress.trim() || 'Local Depot',
                    openingBalance: newSupOpening || 0,
                  });
                  setSelectedSupplierId(created.id);
                  setShowSupplierModal(false);
                  setNewSupName('');
                  setNewSupMobile('');
                  setNewSupAddress('');
                  setNewSupOpening(0);
                  showToast(`Supplier ${created.name} added and selected!`);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Save Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Product Modal */}
      {showNewProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  {language === 'bn' ? 'নতুন পণ্য নিবন্ধন ও স্টকে যোগ' : 'Register New Product for Purchase'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewProductModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Product Name (পণ্যের নাম) *</label>
                <input
                  type="text"
                  placeholder="e.g. Pran Frooto 250ml"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Barcode *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProdBarcode}
                    onChange={(e) => setNewProdBarcode(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setNewProdBarcode(generateRandomBarcode('01'))}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800 bg-slate-50"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Unit</label>
                  <select
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800 bg-slate-50"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Purchase Cost ৳ *</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Selling Price ৳ *</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdSell}
                    onChange={(e) => setNewProdSell(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <label className="font-bold text-emerald-900 mb-1 block">
                  Initial Inward Quantity to Purchase *
                </label>
                <input
                  type="number"
                  min="1"
                  value={newProdInwardQty}
                  onChange={(e) => setNewProdInwardQty(parseInt(e.target.value) || 1)}
                  className="w-full border border-emerald-300 bg-white rounded-xl px-3 py-2 font-mono font-bold text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewProductModal(false)}
                className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newProdName.trim()) {
                    showToast('Please enter product name', 'warning');
                    return;
                  }
                  const created = addProduct({
                    name: newProdName.trim(),
                    nameBn: newProdNameBn.trim() || undefined,
                    barcode: newProdBarcode.trim() || generateRandomBarcode('01'),
                    brand: newProdBrand || brands[0]?.name || 'General',
                    category: newProdCategory || categories[0]?.name || 'General',
                    unit: newProdUnit || 'Pcs',
                    stockQty: 0, // Inward purchase will add the stock!
                    alertQty: 5,
                    unitCost: newProdCost || 100,
                    sellPrice: newProdSell || 130,
                    dealerPrice: newProdSell || 130,
                  });

                  // Add directly to current purchase invoice table
                  addProductToPurchase(created, newProdInwardQty || 1, newProdCost);
                  setShowNewProductModal(false);
                  showToast(`Created & added ${created.name} to purchase!`);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Save & Add to Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Purchase Invoice Modal */}
      {completedPurchase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {language === 'bn' ? 'ক্রয় চালান সফলভাবে সংরক্ষিত!' : 'Purchase Invoice Saved!'}
                  </h3>
                  <p className="text-xs text-emerald-600 font-semibold">
                    Stock quantity updated across inventory
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompletedPurchase(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Bill Area */}
            <div id="printable-purchase-bill" className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {shopSettings?.shopName || 'BAEBA Inventory & POS'}
                  </h4>
                  <p className="text-[11px] text-slate-500">{shopSettings?.address || 'Dhaka, Bangladesh'}</p>
                  <p className="text-[11px] text-slate-500">Phone: {shopSettings?.mobile || '01700000000'}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg uppercase">
                    Purchase Challan
                  </span>
                  <div className="font-mono font-bold text-slate-800 text-xs mt-1">
                    {completedPurchase.purchaseNo}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{completedPurchase.date}</div>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">SUPPLIER:</span>
                  <span className="font-bold text-slate-800">{completedPurchase.supplierName}</span>
                </div>
                {completedPurchase.supplierChallanNo && (
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">CHALLAN NO:</span>
                    <span className="font-mono font-bold text-slate-800">{completedPurchase.supplierChallanNo}</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Unit Rate</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {completedPurchase.items.map((it: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-slate-800">{it.productName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{it.barcode}</div>
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                          {it.quantity}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600">
                          ৳{it.unitCost.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          ৳{it.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary */}
              <div className="space-y-1.5 text-xs pt-1 border-t border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">৳{completedPurchase.subtotal.toFixed(2)}</span>
                </div>
                {completedPurchase.otherCost > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Transport / Carrying:</span>
                    <span className="font-mono">৳{completedPurchase.otherCost.toFixed(2)}</span>
                  </div>
                )}
                {completedPurchase.discountAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Discount:</span>
                    <span className="font-mono text-red-600">-৳{completedPurchase.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200 text-sm">
                  <span>Grand Total:</span>
                  <span className="font-mono text-emerald-700">৳{completedPurchase.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Paid ({completedPurchase.paymentMethod}):</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    ৳{completedPurchase.paidAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700 font-bold">
                  <span>Remaining Due:</span>
                  <span
                    className={`font-mono ${
                      completedPurchase.dueAmount > 0 ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    ৳{completedPurchase.dueAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                {language === 'bn' ? 'প্রিন্ট করুন' : 'Print Receipt'}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleResetForm();
                  setActiveView('purchases');
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                {language === 'bn' ? 'ক্রয় তালিকা দেখুন' : 'View Purchase Orders'}
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                {language === 'bn' ? 'নতুন ক্রয় তৈরি করুন' : 'Create Another Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
