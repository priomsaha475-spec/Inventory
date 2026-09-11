import React, { useState, useRef, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Customer, Product } from '../../types';
import { playScannerBeep } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  ShoppingCart,
  Scan,
  Plus,
  Minus,
  Trash2,
  Search,
  CheckCircle,
  Printer,
  UserPlus,
  RotateCcw,
  Sparkles,
  CreditCard,
  Banknote,
  Smartphone,
  Check,
} from 'lucide-react';

interface CartRow {
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export const PosSaleView: React.FC = () => {
  const {
    products,
    customers,
    addCustomer,
    recordSale,
    language,
    openScanner,
    showToast,
    setActiveView,
  } = useInventory();

  // Cart state
  const [cart, setCart] = useState<CartRow[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [otherCost, setOtherCost] = useState<number>(0);
  const [otherCostName, setOtherCostName] = useState<string>('');
  const [vatPercent, setVatPercent] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Card' | 'Nagad' | 'Bank'>('Cash');
  const [showNewCustomerModal, setShowNewCustomerModal] = useState<boolean>(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<any | null>(null);

  // New customer quick form
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  const barcodeInputRef = useRef<HTMLInputElement | null>(null);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Totals calculations
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const vatAmount = (taxableAmount * vatPercent) / 100;
  const grandTotal = Math.max(0, taxableAmount + vatAmount + otherCost);
  const dueAmount = Math.max(0, grandTotal - paidAmount);
  const changeAmount = paidAmount > grandTotal ? paidAmount - grandTotal : 0;

  // Auto set paidAmount equal to grandTotal when cart updates if it was full paid
  useEffect(() => {
    setPaidAmount(grandTotal);
  }, [grandTotal]);

  // Add product to cart helper
  const addProductToCart = (product: Product, qty: number = 1) => {
    if (product.stockQty <= 0) {
      playScannerBeep('warning');
      showToast(
        language === 'bn'
          ? `পণ্যটি স্টকে নেই (${product.name})`
          : `Item is out of stock (${product.name})`,
        'warning'
      );
    }

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((i) => i.product.id === product.id);
      if (existingIdx >= 0) {
        const updated = [...prevCart];
        const newQty = updated[existingIdx].quantity + qty;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          total: newQty * updated[existingIdx].unitPrice,
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            product,
            quantity: qty,
            unitPrice: product.sellPrice,
            total: qty * product.sellPrice,
          },
        ];
      }
    });

    playScannerBeep('success');
  };

  // Handle manual or scanned barcode submission
  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = barcodeInput.trim().toLowerCase();
    if (!clean) return;

    const matched = products.find(
      (p) => p.barcode.toLowerCase() === clean || p.name.toLowerCase().includes(clean)
    );

    if (matched) {
      addProductToCart(matched, 1);
      setBarcodeInput('');
    } else {
      playScannerBeep('error');
      showToast(
        language === 'bn'
          ? `বারকোড "${barcodeInput}" মেলেনি`
          : `No product found matching barcode "${barcodeInput}"`,
        'error'
      );
    }
  };

  // Update item quantity
  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQty, total: newQty * item.unitPrice }
          : item
      )
    );
  };

  // Update item unit price (override in POS)
  const updateUnitPrice = (productId: string, newPrice: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, unitPrice: newPrice, total: item.quantity * newPrice }
          : item
      )
    );
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Clear cart
  const handleResetCart = () => {
    if (cart.length === 0) return;
    if (confirm('Clear the current cart?')) {
      setCart([]);
      setDiscountPercent(0);
      setOtherCost(0);
    }
  };

  // Complete Sale
  const handleCompleteSale = () => {
    if (cart.length === 0) {
      showToast('Please add at least one item to the cart', 'warning');
      return;
    }

    const sale = recordSale({
      customerId: selectedCustomer?.id || 'walk-in',
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer (খুচরা গ্রাহক)',
      items: cart.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        barcode: i.product.barcode,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.total,
      })),
      subtotal,
      discountPercent,
      discountAmount,
      vatPercent,
      vatAmount,
      otherCost,
      grandTotal,
      paidAmount,
      dueAmount,
      paymentMethod,
      status: dueAmount === 0 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'DUE',
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    setLastCompletedSale(sale);
    setCart([]);
    setDiscountPercent(0);
    setOtherCost(0);
  };

  // Trigger camera scanner connected directly to POS cart
  const openLivePosScanner = () => {
    openScanner('pos_add', (barcode, product) => {
      if (product) {
        addProductToCart(product, 1);
        showToast(`Scanned & Added: ${product.name} (৳${product.sellPrice})`);
      } else {
        playScannerBeep('error');
        showToast(`Unregistered barcode: ${barcode}`, 'warning');
      }
    }, 'POS Real-time Barcode Scanner (স্ক্যান করলেই কার্ডে যোগ হবে)');
  };

  // Handle Quick Add Customer
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const created = addCustomer({
      name: newCustName,
      mobile: newCustMobile || '01700000000',
      address: newCustAddress || 'Local',
      openingBalance: 0,
    });

    setSelectedCustomerId(created.id);
    setShowNewCustomerModal(false);
    setNewCustName('');
    setNewCustMobile('');
    setNewCustAddress('');
  };

  return (
    <div id="pos-sale-view" className="space-y-5">
      {/* Top Header matching the video layout */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-800">
              {language === 'bn' ? 'বিক্রয় চালান / পিওএস (New Sale / POS)' : 'Point of Sale (POS Billing)'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'bn'
              ? 'বারকোড স্ক্যানার বা ক্যামেরা দিয়ে সাথে সাথে বিক্রয় করুন'
              : 'Scan barcodes with camera or USB scanner for instant, real-time checkout'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Camera Scanner trigger */}
          <button
            id="pos-open-camera-scanner-btn"
            onClick={openLivePosScanner}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Scan className="w-4 h-4" />
            {language === 'bn' ? 'ক্যামেরা দিয়ে স্ক্যান' : 'Live Camera Scanner'}
          </button>

          <button
            onClick={handleResetCart}
            disabled={cart.length === 0}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Top Input Strip: Customer, Bill To, Date, Barcode Search (as seen in video) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Customer select */}
          <div className="md:col-span-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                {language === 'bn' ? 'গ্রাহক (Customer)' : 'Customer'}
              </label>
              <button
                onClick={() => setShowNewCustomerModal(true)}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                + {language === 'bn' ? 'গ্রাহক' : 'Customer'}
              </button>
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Walk-in Customer (খুচরা ক্রেতা)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.mobile})
                </option>
              ))}
            </select>
          </div>

          {/* Bill To Address info */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              {language === 'bn' ? 'বিল ঠিকানা (Bill To)' : 'Bill To / Phone'}
            </label>
            <input
              type="text"
              readOnly
              value={selectedCustomer ? `${selectedCustomer.address} • ${selectedCustomer.mobile}` : 'Walk-in Cash Sale'}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-100/70 px-3 py-2.5 text-slate-600 font-medium"
            />
          </div>

          {/* Date */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              {language === 'bn' ? 'তারিখ (Date)' : 'Sale Date'}
            </label>
            <input
              type="text"
              readOnly
              value={new Date().toISOString().split('T')[0]}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-100/70 px-3 py-2.5 text-slate-600 font-mono font-medium"
            />
          </div>

          {/* Barcode / Product Search Box */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>{language === 'bn' ? 'বারকোড দিয়ে পণ্য খুঁজুন' : 'Search Product / Barcode'}</span>
              <span className="text-[10px] text-emerald-600 font-normal">Auto-Enter</span>
            </label>
            <form onSubmit={handleBarcodeSubmit} className="relative flex items-center">
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder={language === 'bn' ? 'বারকোড স্ক্যান বা নাম লিখুন...' : 'Scan barcode or type name...'}
                className="w-full text-xs rounded-xl border border-emerald-300 bg-emerald-50/20 pl-3 pr-16 py-2.5 text-slate-800 font-mono focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:outline-none"
              />
              <div className="absolute right-1 flex items-center gap-1">
                <button
                  type="submit"
                  title="Add item"
                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 1-Click Quick Scan Chips for Instant Testing */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 text-[11px] font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick Barcodes:
          </span>
          {products.slice(0, 6).map((prod) => (
            <button
              key={prod.id}
              onClick={() => addProductToCart(prod, 1)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-[11px] text-slate-700 font-mono transition-colors flex items-center gap-1"
            >
              <span>{prod.barcode}</span>
              <span className="text-slate-400 font-sans">({prod.name.split(' ')[0]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Cart Table (Left) and Billing Calculation Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Cart Table Section */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              {language === 'bn' ? 'নির্বাচিত পণ্যের তালিকা' : 'Cart Items'} ({cart.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Subtotal: <strong className="text-slate-800 font-mono">৳{subtotal.toFixed(2)}</strong>
            </span>
          </div>

          <div className="overflow-x-auto flex-1 min-h-[300px]">
            {cart.length === 0 ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <ShoppingCart className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-700 text-sm">Cart is currently empty</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Scan product barcodes via camera or pick from the list to add items to invoice.
                </p>
                <button
                  onClick={openLivePosScanner}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <Scan className="w-3.5 h-3.5" />
                  Launch Camera Scanner
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-10">#</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'পণ্যের নাম' : 'Product Name'}</th>
                    <th className="py-3 px-4 w-28">{language === 'bn' ? 'মূল্য (৳)' : 'Unit Price'}</th>
                    <th className="py-3 px-4 w-32 text-center">{language === 'bn' ? 'পরিমাণ' : 'Quantity'}</th>
                    <th className="py-3 px-4 w-28 text-right">{language === 'bn' ? 'মোট (৳)' : 'Total'}</th>
                    <th className="py-3 px-4 w-12 text-center">{language === 'bn' ? 'অ্যাকশন' : ''}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.map((row, idx) => (
                    <tr key={row.product.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono text-center">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={row.product.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=80&q=80'}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-slate-800 line-clamp-1">{row.product.name}</div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                {row.product.barcode}
                              </span>
                              <span>• In Stock: {row.product.stockQty} {row.product.unit}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={row.unitPrice}
                          onChange={(e) => updateUnitPrice(row.product.id, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-xs border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => updateQuantity(row.product.id, row.quantity - 1)}
                            className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(e) => updateQuantity(row.product.id, parseInt(e.target.value) || 1)}
                            className="w-12 text-center py-1 text-xs border border-slate-200 rounded-lg font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            onClick={() => updateQuantity(row.product.id, row.quantity + 1)}
                            className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        ৳{row.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => removeFromCart(row.product.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Calculation & Checkout Summary Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100">
              {language === 'bn' ? 'চালান হিসাব (Billing Summary)' : 'Billing Calculation'}
            </h2>

            {/* Subtotal */}
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>{language === 'bn' ? 'মোট মূল্য (Subtotal)' : 'Subtotal'}:</span>
              <span className="font-mono font-semibold text-slate-800 text-sm">৳{subtotal.toFixed(2)}</span>
            </div>

            {/* Discount */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">{language === 'bn' ? 'ডিসকাউন্ট %' : 'Discount %'}</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">{language === 'bn' ? 'ডিসকাউন্ট পরিমাণ' : 'Discount Amt'}</label>
                <input
                  type="text"
                  readOnly
                  value={`৳${discountAmount.toFixed(2)}`}
                  className="w-full text-xs border border-slate-200 bg-slate-50 rounded-xl px-3 py-1.5 font-mono text-slate-600"
                />
              </div>
            </div>

            {/* VAT */}
            <div className="flex items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span>{language === 'bn' ? 'ভ্যাট % (VAT)' : 'Tax / VAT %'}:</span>
              </div>
              <input
                type="number"
                min="0"
                max="50"
                value={vatPercent}
                onChange={(e) => setVatPercent(parseFloat(e.target.value) || 0)}
                className="w-20 text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 font-mono text-right text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Other Cost */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                value={otherCostName}
                onChange={(e) => setOtherCostName(e.target.value)}
                placeholder="Other Cost (e.g. Delivery)"
                className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800"
              />
              <input
                type="number"
                min="0"
                value={otherCost}
                onChange={(e) => setOtherCost(parseFloat(e.target.value) || 0)}
                placeholder="Amount ৳"
                className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-slate-800"
              />
            </div>

            {/* Grand Total */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 block">
                  {language === 'bn' ? 'সর্বমোট প্রদেয় বিল' : 'Grand Total'}
                </span>
                <span className="text-2xl font-black text-emerald-700 font-mono">
                  ৳{grandTotal.toFixed(2)}
                </span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-600 text-white font-medium">
                {cart.length} items
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                {language === 'bn' ? 'পরিশোধের মাধ্যম (Payment Method)' : 'Payment Method'}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Cash', 'bKash', 'Card', 'Nagad'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      paymentMethod === method
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Receive Amount & Change / Due */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'প্রাপ্ত টাকা (Paid)' : 'Paid Amount'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm font-bold font-mono border border-emerald-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {changeAmount > 0 ? 'Change (ফেরত)' : 'Due (বকেয়া)'}
                </label>
                <div
                  className={`w-full text-sm font-bold font-mono border rounded-xl px-3 py-2 ${
                    changeAmount > 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : dueAmount > 0
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  ৳{changeAmount > 0 ? changeAmount.toFixed(2) : dueAmount.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="pos-submit-sale-btn"
              onClick={handleCompleteSale}
              disabled={cart.length === 0}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {language === 'bn' ? 'চালান তৈরি করুন (Complete Sale)' : 'Complete Sale & Print Receipt'}
            </button>
          </div>
        </div>
      </div>

      {/* New Customer Quick Modal */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800">
              {language === 'bn' ? 'নতুন গ্রাহক যোগ করুন' : 'Register New Customer'}
            </h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Sabbir Rahman"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={newCustMobile}
                  onChange={(e) => setNewCustMobile(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="e.g. Chuadanga Sadar"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Completed Modal */}
      {lastCompletedSale && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Sale Completed!</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{lastCompletedSale.invoiceNo}</p>
            </div>

            {/* Thermal Slip Simulation */}
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-left font-mono text-[11px] space-y-2">
              <div className="text-center pb-2 border-b border-slate-200">
                <div className="font-bold text-slate-900 text-xs">OKY SUPER SHOP</div>
                <div className="text-[10px] text-slate-500">Chuadanga, Bangladesh • 096 3838 0101</div>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-semibold text-slate-800">{lastCompletedSale.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Items:</span>
                <span>{lastCompletedSale.items.length} pcs</span>
              </div>
              <div className="border-t border-dashed border-slate-300 pt-1.5 flex justify-between font-bold text-slate-900 text-xs">
                <span>GRAND TOTAL:</span>
                <span>৳{lastCompletedSale.grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[10px]">
                <span>Paid via {lastCompletedSale.paymentMethod}:</span>
                <span>৳{lastCompletedSale.paidAmount.toFixed(2)}</span>
              </div>
              {lastCompletedSale.dueAmount > 0 && (
                <div className="flex justify-between text-red-600 font-bold text-[10px]">
                  <span>Due Balance:</span>
                  <span>৳{lastCompletedSale.dueAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Slip
              </button>
              <button
                onClick={() => setLastCompletedSale(null)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
