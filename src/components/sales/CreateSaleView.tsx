import React, { useState, useEffect, useRef } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Customer, Product } from '../../types';
import {
  Plus,
  Trash2,
  Barcode,
  Camera,
  CheckCircle2,
  Calendar,
  UserPlus,
  Search,
  Check,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  ArrowRight,
  Edit3,
  Undo2
} from 'lucide-react';

interface SaleItemRow {
  productId: string;
  productName: string;
  barcode: string;
  brand: string;
  category: string;
  unit: string;
  stockQty: number;
  quantity: number;
  salePrice: number;
  total: number;
}

export const CreateSaleView: React.FC = () => {
  const {
    products,
    customers,
    addCustomer,
    recordSale,
    editingSaleInvoice,
    setEditingSaleInvoice,
    updateSale,
    openScanner,
    showToast,
    language,
    setActiveView
  } = useInventory();

  // Customer Selection State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    editingSaleInvoice?.customerId || (customers.length > 0 ? customers[0].id : '')
  );
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  // Sale Date
  const [saleDate, setSaleDate] = useState<string>(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  });

  // Product Selection & Barcode inputs
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const productDropdownRef = useRef<HTMLDivElement>(null);

  // Items table
  const [items, setItems] = useState<SaleItemRow[]>([]);

  // Simple Payment & Discount
  const [discount, setDiscount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Card' | 'Bank'>('Cash');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');

  // Quick Customer Modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Selected customer object
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Initialize with editing sale or sample products if empty
  useEffect(() => {
    if (editingSaleInvoice) {
      setSelectedCustomerId(editingSaleInvoice.customerId || '');
      setSaleDate(editingSaleInvoice.date || '');
      setDiscount(editingSaleInvoice.discountAmount > 0 ? editingSaleInvoice.discountAmount : '');
      setPaymentMethod((editingSaleInvoice.paymentMethod as any) || 'Cash');
      setPaidAmount(editingSaleInvoice.paidAmount);

      const mappedItems: SaleItemRow[] = editingSaleInvoice.items.map((it) => {
        const prod = products.find((p) => p.id === it.productId);
        return {
          productId: it.productId,
          productName: it.productName,
          barcode: it.barcode,
          brand: prod?.brand || '',
          category: prod?.category || '',
          unit: it.unit || prod?.unit || 'Pcs',
          stockQty: prod ? prod.stockQty + it.quantity : it.quantity,
          quantity: it.quantity,
          salePrice: it.unitPrice,
          total: it.total,
        };
      });
      setItems(mappedItems);
    } else if (items.length === 0 && products.length >= 2) {
      const p1 = products.find((p) => p.barcode === '007035') || products[0];
      const p2 = products.find((p) => p.barcode === '007036') || products[1];

      const initialRows: SaleItemRow[] = [];
      if (p1) {
        initialRows.push({
          productId: p1.id,
          productName: p1.name,
          barcode: p1.barcode,
          brand: p1.brand,
          category: p1.category,
          unit: p1.unit || 'Pcs',
          stockQty: p1.stockQty,
          quantity: 1,
          salePrice: p1.sellPrice,
          total: p1.sellPrice,
        });
      }
      if (p2 && p2.id !== p1?.id) {
        initialRows.push({
          productId: p2.id,
          productName: p2.name,
          barcode: p2.barcode,
          brand: p2.brand,
          category: p2.category,
          unit: p2.unit || 'Pcs',
          stockQty: p2.stockQty,
          quantity: 1,
          salePrice: p2.sellPrice,
          total: p2.sellPrice,
        });
      }
      if (initialRows.length > 0) {
        setItems(initialRows);
      }
    }
  }, [editingSaleInvoice, products]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(e.target as Node)
      ) {
        setIsProductDropdownOpen(false);
      }
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add a product to the items table
  const addProductToSale = (prod: Product) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.productId === prod.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + 1;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          total: Number((newQty * updated[existingIdx].salePrice).toFixed(2)),
        };
        return updated;
      }

      const newRow: SaleItemRow = {
        productId: prod.id,
        productName: prod.name,
        barcode: prod.barcode,
        brand: prod.brand,
        category: prod.category,
        unit: prod.unit || 'Pcs',
        stockQty: prod.stockQty,
        quantity: 1,
        salePrice: prod.sellPrice,
        total: prod.sellPrice,
      };
      return [...prev, newRow];
    });

    setProductSearchQuery('');
    setBarcodeInput('');
    setIsProductDropdownOpen(false);
  };

  // Barcode enter / submit handler
  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    const matched = products.find(
      (p) => p.barcode.toLowerCase() === query.toLowerCase()
    );

    if (matched) {
      addProductToSale(matched);
      showToast(`Added: ${matched.name}`, 'success');
      setBarcodeInput('');
    } else {
      showToast(`No product found with barcode "${query}"`, 'warning');
    }
  };

  // Live Camera Scanner trigger
  const triggerCameraScanner = () => {
    openScanner('lookup', (scannedBarcode) => {
      const matched = products.find((p) => p.barcode === scannedBarcode);
      if (matched) {
        addProductToSale(matched);
        showToast(`Scanned: ${matched.name}`, 'success');
      } else {
        setBarcodeInput(scannedBarcode);
      }
    }, 'Scan Barcode for Sale (বারকোড স্ক্যানার)');
  };

  // Quantity modification
  const updateQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return;
    setItems((prev) => {
      const copy = [...prev];
      copy[index].quantity = newQty;
      copy[index].total = Number((newQty * copy[index].salePrice).toFixed(2));
      return copy;
    });
  };

  // Price modification
  const updatePrice = (index: number, newPrice: number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index].salePrice = Math.max(0, newPrice);
      copy[index].total = Number((copy[index].quantity * Math.max(0, newPrice)).toFixed(2));
      return copy;
    });
  };

  // Remove row
  const removeRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountVal = typeof discount === 'number' ? Math.max(0, discount) : 0;
  const grandTotal = Math.max(0, Number((subtotal - discountVal).toFixed(2)));

  // Current paid amount and due calculation
  const effectivePaid = paidAmount === '' ? grandTotal : paidAmount;
  const dueAmount = Math.max(0, Number((grandTotal - effectivePaid).toFixed(2)));
  const changeAmount = Math.max(0, Number((effectivePaid - grandTotal).toFixed(2)));

  // Quick Customer Creation
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustMobile.trim()) {
      showToast('Name and mobile number are required', 'warning');
      return;
    }
    const created = addCustomer({
      name: newCustName.trim(),
      mobile: newCustMobile.trim(),
      address: newCustAddress.trim(),
      openingBalance: 0,
    });
    setSelectedCustomerId(created.id);
    setIsCustomerModalOpen(false);
    setNewCustName('');
    setNewCustMobile('');
    setNewCustAddress('');
    showToast(`Customer ${created.name} added!`, 'success');
  };

  // Create Sale Action
  const handleCreateSale = () => {
    if (items.length === 0) {
      showToast('Please select at least one product', 'warning');
      return;
    }
    if (!selectedCustomer) {
      showToast('Please select a customer', 'warning');
      return;
    }

    const finalPaid = paidAmount === '' ? grandTotal : Number(paidAmount);
    const finalDue = Math.max(0, grandTotal - finalPaid);

    const saleRecord = {
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerMobile: selectedCustomer.mobile,
      customerAddress: selectedCustomer.address,
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        barcode: i.barcode,
        unit: i.unit,
        stock: i.stockQty,
        quantity: i.quantity,
        unitPrice: i.salePrice,
        total: i.total,
      })),
      subtotal,
      discountPercent: subtotal > 0 ? Number(((discountVal / subtotal) * 100).toFixed(2)) : 0,
      discountAmount: discountVal,
      otherCost: 0,
      grandTotal,
      paidAmount: finalPaid,
      dueAmount: finalDue,
      currentTotalDue: finalDue,
      paymentMethod,
      status: (finalDue === 0 ? 'PAID' : finalPaid > 0 ? 'PARTIAL' : 'DUE') as 'PAID' | 'PARTIAL' | 'DUE',
    };

    if (editingSaleInvoice) {
      updateSale(editingSaleInvoice.id, saleRecord);
    } else {
      recordSale(saleRecord);
    }
    setActiveView('invoice_view');
  };

  const handleCancelEdit = () => {
    setEditingSaleInvoice(null);
    setItems([]);
    setDiscount('');
    setPaidAmount('');
    showToast(language === 'bn' ? 'এডিট বাতিল করা হয়েছে' : 'Sale editing cancelled', 'info');
  };

  // Filtered product suggestions
  const filteredProducts = products.filter((p) => {
    if (!productSearchQuery.trim()) return true;
    const q = productSearchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div id="create-sale-view" className="space-y-4 pb-12 font-sans max-w-6xl mx-auto">
      {/* Edit Mode Alert Banner */}
      {editingSaleInvoice && (
        <div id="sale-edit-mode-banner" className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-amber-950 text-sm flex items-center gap-2">
                <span>{language === 'bn' ? 'চালান এডিট মোড' : 'Editing Sale Invoice'}</span>
                <span className="font-mono bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md text-xs font-extrabold">
                  {editingSaleInvoice.invoiceNo}
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                {language === 'bn'
                  ? 'পণ্য, সংখ্যা বা মূল্য পরিবর্তন করে সংরক্ষণ করুন। স্টক ও বকেয়া হিসাব স্বয়ংক্রিয়ভাবে সমন্বয় হবে।'
                  : 'Modify items, quantities or payment. Product inventory and customer balance will reconcile automatically.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-cancel-sale-edit"
            onClick={handleCancelEdit}
            className="px-3.5 py-1.5 bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-900 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'এডিট বাতিল করুন' : 'Cancel Edit'}</span>
          </button>
        </div>
      )}

      {/* Top Header Card: Simple, Clean Customer & Date Selection */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Customer Selection */}
          <div className="md:col-span-8 space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Customer <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  id="sale-customer-select"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs bg-slate-50 hover:bg-slate-100/70 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition-colors"
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.mobile ? `(${c.mobile})` : ''} {c.address ? `- ${c.address}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                id="btn-add-customer-quick"
                onClick={() => setIsCustomerModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Customer</span>
              </button>
            </div>
          </div>

          {/* Sale Date */}
          <div className="md:col-span-4 space-y-1">
            <label className="block text-xs font-bold text-slate-700">Date</label>
            <div className="relative">
              <input
                type="text"
                id="sale-select-date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full text-xs bg-slate-50 hover:bg-slate-100/70 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition-colors"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Product Search & Barcode Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-4 pt-4 border-t border-slate-100">
          {/* Select Product Dropdown */}
          <div className="md:col-span-7 relative" ref={productDropdownRef}>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Product <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                id="sale-product-search-input"
                value={productSearchQuery}
                onFocus={() => setIsProductDropdownOpen(true)}
                onChange={(e) => {
                  setProductSearchQuery(e.target.value);
                  setIsProductDropdownOpen(true);
                }}
                placeholder="Search product by name, brand, category..."
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition-colors"
              />
            </div>

            {/* Custom Dropdown List */}
            {isProductDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto z-50 divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">No products found</div>
                ) : (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProductToSale(p)}
                      className="w-full text-left p-2.5 hover:bg-emerald-50/70 transition-colors text-xs text-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{p.name}</span>
                        <span className="text-slate-500 ml-1.5 text-[11px]">
                          ({p.brand} - {p.category})
                        </span>
                        <span className="text-slate-400 font-mono ml-2 text-[11px]">
                          [{p.barcode}]
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900">৳{p.sellPrice}</span>
                        <span className="text-emerald-600 font-medium ml-2 text-[11px]">
                          Stock: {p.stockQty}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Barcode Scanner Input */}
          <div className="md:col-span-5">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Product With Barcode
            </label>
            <form onSubmit={handleBarcodeSubmit} className="flex gap-1.5">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  id="sale-barcode-input"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan or type barcode + Enter"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Camera Scanner Button */}
              <button
                type="button"
                id="btn-scan-camera-sale"
                onClick={triggerCameraScanner}
                title="Open Camera Scanner"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Scan</span>
              </button>
            </form>
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-5 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 w-12 text-center">SL</th>
                  <th className="py-2.5 px-4">PRODUCT NAME</th>
                  <th className="py-2.5 px-3 w-24 text-center">STOCK</th>
                  <th className="py-2.5 px-3 w-36 text-center">QTY</th>
                  <th className="py-2.5 px-3 w-28 text-right">PRICE (৳)</th>
                  <th className="py-2.5 px-4 w-28 text-right">TOTAL (৳)</th>
                  <th className="py-2.5 px-3 w-20 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      No products added yet. Select a product or scan barcode above to begin.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      {/* SL */}
                      <td className="py-2.5 px-3 text-center text-slate-500 font-semibold">
                        {idx + 1}
                      </td>

                      {/* PRODUCT NAME */}
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Barcode: {item.barcode}
                        </div>
                      </td>

                      {/* STOCK */}
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-full border border-emerald-100 font-mono">
                          {item.stockQty}
                        </span>
                      </td>

                      {/* QTY WITH - and + BUTTONS */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(idx, item.quantity - 1)}
                            className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(idx, parseInt(e.target.value) || 1)
                            }
                            className="w-14 text-center py-1 px-1 border border-slate-300 rounded-lg font-bold text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(idx, item.quantity + 1)}
                            className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* SALE PRICE (EDITABLE) */}
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.salePrice}
                          onChange={(e) =>
                            updatePrice(idx, parseFloat(e.target.value) || 0)
                          }
                          className="w-24 text-right py-1 px-2 border border-slate-300 rounded-lg font-semibold text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>

                      {/* TOTAL */}
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900 font-mono">
                        {item.total.toFixed(2)}
                      </td>

                      {/* ACTION - Delete button */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors inline-flex items-center justify-center cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clean Checkout / Calculation Section */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col lg:flex-row justify-between items-start gap-6">
          {/* Left: Payment Method Selection */}
          <div className="w-full lg:w-1/2 space-y-3">
            <label className="block text-xs font-bold text-slate-700">Payment Method</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'Cash', label: 'Cash', icon: Banknote },
                { key: 'bKash', label: 'bKash', icon: Smartphone },
                { key: 'Card', label: 'Card', icon: CreditCard },
                { key: 'Bank', label: 'Bank', icon: Building2 },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setPaymentMethod(m.key as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-500'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Clean, Natural Financial Breakdown */}
          <div className="w-full lg:w-96 bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-2.5">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Subtotal:</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                ৳{subtotal.toFixed(2)}
              </span>
            </div>

            {/* Discount */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Discount (৳):</span>
              <div className="w-36">
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full text-right px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex items-center justify-between text-xs py-2 border-t border-slate-200">
              <span className="font-bold text-slate-800 text-sm">Grand Total:</span>
              <span className="font-extrabold text-emerald-700 font-mono text-lg">
                ৳{grandTotal.toFixed(2)}
              </span>
            </div>

            {/* Paid Amount */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-bold text-slate-700">Paid Amount (৳):</span>
              <div className="w-36 flex gap-1">
                <input
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                  placeholder={grandTotal.toFixed(2)}
                  className="w-full text-right px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setPaidAmount(grandTotal)}
                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold shrink-0 transition-colors"
                  title="Mark Full Paid"
                >
                  Full
                </button>
              </div>
            </div>

            {/* Due or Change */}
            {dueAmount > 0 ? (
              <div className="flex items-center justify-between text-xs py-1 text-amber-700 bg-amber-50/60 px-2 rounded-lg border border-amber-200">
                <span className="font-bold">Due Amount:</span>
                <span className="font-extrabold font-mono text-sm">৳{dueAmount.toFixed(2)}</span>
              </div>
            ) : changeAmount > 0 ? (
              <div className="flex items-center justify-between text-xs py-1 text-emerald-700 bg-emerald-50/60 px-2 rounded-lg border border-emerald-200">
                <span className="font-bold">Change (ফেরত):</span>
                <span className="font-extrabold font-mono text-sm">৳{changeAmount.toFixed(2)}</span>
              </div>
            ) : (
              <div className="text-right text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Paid in Full</span>
              </div>
            )}

            {/* Create / Update Sale Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                id="btn-create-sale-submit"
                onClick={handleCreateSale}
                className={`w-full py-3 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                  editingSaleInvoice
                    ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                }`}
              >
                {editingSaleInvoice ? <Edit3 className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>
                  {editingSaleInvoice
                    ? language === 'bn'
                      ? 'চালান আপডেট করুন (Update Sale)'
                      : 'Update Sale'
                    : language === 'bn'
                    ? 'বিক্রয় সম্পন্ন করুন'
                    : 'Complete Sale'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                Add New Customer
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. সাদিন মোকাররম"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={newCustMobile}
                  onChange={(e) => setNewCustMobile(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="e.g. Chuadanga"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 shadow-xs cursor-pointer"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
