import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { generateRandomBarcode } from '../../utils/barcode';
import {
  PackagePlus,
  Barcode,
  Scan,
  Sparkles,
  Upload,
  Plus,
  X,
  Check,
  Building,
  Tag,
  Boxes,
} from 'lucide-react';

export const AddProductModal: React.FC = () => {
  const {
    addProduct,
    brands,
    addBrand,
    categories,
    addCategory,
    units,
    addUnit,
    language,
    openScanner,
    setActiveView,
    showToast,
  } = useInventory();

  // Form state
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [barcode, setBarcode] = useState(() => generateRandomBarcode('01'));
  const [brand, setBrand] = useState(brands[0]?.name || 'Next');
  const [category, setCategory] = useState(categories[0]?.name || 'Chips');
  const [subCategory, setSubCategory] = useState('');
  const [unit, setUnit] = useState(units[0]?.name || 'Pcs');
  const [stockQty, setStockQty] = useState<number>(10);
  const [unitCost, setUnitCost] = useState<number>(100);
  const [alertQty, setAlertQty] = useState<number>(5);
  const [sellPrice, setSellPrice] = useState<number>(130);
  const [dealerPrice, setDealerPrice] = useState<number>(120);
  const [imageUrl, setImageUrl] = useState('');

  // Quick modals for + Brand, + Category, + Unit
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);

  const [newBrandName, setNewBrandName] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitSymbol, setNewUnitSymbol] = useState('');

  // Auto-fill barcode from live camera scanner
  const handleScanBarcodeForProduct = () => {
    openScanner('fill_barcode', (scannedCode) => {
      setBarcode(scannedCode);
      showToast(
        language === 'bn'
          ? `বারকোড স্ক্যান সফল: ${scannedCode}`
          : `Scanned barcode: ${scannedCode} filled into form`
      );
    }, 'Scan Barcode for New Product (পণ্যের গায়ের বারকোড স্ক্যান করুন)');
  };

  const handleGenerateBarcode = () => {
    const code = generateRandomBarcode('02');
    setBarcode(code);
  };

  // Get subcategories for selected category
  const activeCategoryObj = categories.find((c) => c.name === category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter product name', 'warning');
      return;
    }
    if (!barcode.trim()) {
      showToast('Please enter or scan a barcode', 'warning');
      return;
    }

    addProduct({
      name,
      nameBn: nameBn || undefined,
      barcode: barcode.trim(),
      brand,
      category,
      subCategory: subCategory || undefined,
      unit,
      stockQty: Number(stockQty) || 0,
      unitCost: Number(unitCost) || 0,
      alertQty: Number(alertQty) || 5,
      sellPrice: Number(sellPrice) || 0,
      dealerPrice: Number(dealerPrice) || 0,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&q=80',
    });

    setActiveView('products');
  };

  return (
    <div id="add-product-view" className="space-y-5">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <PackagePlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {language === 'bn' ? 'নতুন পণ্য যোগ করুন (Add New Product)' : 'Add New Inventory Product'}
            </h1>
            <p className="text-xs text-slate-500">
              {language === 'bn'
                ? 'পণ্য বিবরণ, বারকোড এবং মূল্য তালিকা পূরণ করুন'
                : 'Register a new item with camera barcode scanning, stock quantities, and cost pricing'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveView('products')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors border border-slate-200"
        >
          {language === 'bn' ? 'তালিকায় ফিরে যান' : 'Back to Product List'}
        </button>
      </div>

      {/* Main Form (matches the video layout) */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Row 1: Product Name, Brand, Category */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Product Name */}
          <div className="md:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {language === 'bn' ? 'পণ্য নাম *' : 'Product Name *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 003 Boys Stripe T-Shirt 2-10Y or Potato Chips"
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Product Brand */}
          <div className="md:col-span-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                {language === 'bn' ? 'পণ্য কোম্পানি (Brand) *' : 'Brand *'}
              </label>
              <button
                type="button"
                onClick={() => setShowBrandModal(true)}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                {language === 'bn' ? 'কোম্পানি' : 'Brand'}
              </button>
            </div>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="md:col-span-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                {language === 'bn' ? 'পণ্য শ্রেণী (Category) *' : 'Category *'}
              </label>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                {language === 'bn' ? 'শ্রেণী' : 'Category'}
              </button>
            </div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubCategory('');
              }}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: SubCategory, Unit, Barcode (with Live Camera Scan button!) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Subcategory */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {language === 'bn' ? 'পণ্য SubCategory (ঐচ্ছিক)' : 'SubCategory (Optional)'}
            </label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="">-- Select SubCategory --</option>
              {activeCategoryObj?.subCategories.map((sub, i) => (
                <option key={i} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Unit */}
          <div className="md:col-span-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                {language === 'bn' ? 'পণ্য ইউনিট (Unit) *' : 'Unit *'}
              </label>
              <button
                type="button"
                onClick={() => setShowUnitModal(true)}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                {language === 'bn' ? 'ইউনিট' : 'Unit'}
              </button>
            </div>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {units.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Barcode with Live Camera Scan trigger */}
          <div className="md:col-span-5 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-emerald-600" />
                {language === 'bn' ? 'বারকোড (Barcode) *' : 'Barcode *'}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateBarcode}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Auto-Gen
                </button>
              </div>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                required
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Enter or scan barcode"
                className="w-full text-xs font-mono font-bold rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-28 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleScanBarcodeForProduct}
                className="absolute right-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Scan barcode with camera"
              >
                <Scan className="w-3.5 h-3.5" />
                Scan Live
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: Stock Qty, Unit Cost, Alert Qty, Sell Price, Dealer Price (as shown in video) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-2">
          {/* Stock Qty */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {language === 'bn' ? 'স্টক পরিমাণ' : 'Opening Stock'}
            </label>
            <input
              type="number"
              min="0"
              value={stockQty}
              onChange={(e) => setStockQty(parseInt(e.target.value) || 0)}
              className="w-full text-xs font-mono font-semibold rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Unit Cost */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {language === 'bn' ? 'ইউনিট ক্রয় (Cost)' : 'Unit Cost (৳)'}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-mono font-semibold rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Alert Qty */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {language === 'bn' ? 'সতর্কতা পরিমাণ' : 'Alert Stock Qty'}
            </label>
            <input
              type="number"
              min="1"
              value={alertQty}
              onChange={(e) => setAlertQty(parseInt(e.target.value) || 1)}
              className="w-full text-xs font-mono font-semibold rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Sell Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-700 block">
              {language === 'bn' ? 'বিক্রয় মূল্য (Sell)' : 'Selling Price (৳)'}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={sellPrice}
              onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-mono font-bold rounded-xl border border-emerald-200 bg-emerald-50/30 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Dealer Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {language === 'bn' ? 'ডিলারের মূল্য' : 'Dealer Price (৳)'}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={dealerPrice}
              onChange={(e) => setDealerPrice(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-mono rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Row 4: Image Drag and Drop */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            {language === 'bn' ? 'পণ্যের ছবি (Product Image)' : 'Product Image'}
          </label>
          <div className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-slate-700">
                Click to upload or drag & drop (Max 5MB)
              </p>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste image URL (e.g. https://...)"
                className="w-full max-w-md text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-800 mt-2"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveView('products')}
            className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            {language === 'bn' ? 'তৈরি করুন (Save Product)' : 'Save Product to Inventory'}
          </button>
        </div>
      </form>

      {/* Quick Add Brand Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Add New Brand (নতুন ব্র্যান্ড)</h3>
            <input
              type="text"
              autoFocus
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="e.g. Pran, Square, Walton"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBrandModal(false)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newBrandName.trim()) {
                    addBrand(newBrandName.trim());
                    setBrand(newBrandName.trim());
                    setNewBrandName('');
                    setShowBrandModal(false);
                  }
                }}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
              >
                Add Brand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Add New Category (নতুন ক্যাটাগরি)</h3>
            <input
              type="text"
              autoFocus
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Electronics, Beverages"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newCatName.trim()) {
                    addCategory(newCatName.trim());
                    setCategory(newCatName.trim());
                    setNewCatName('');
                    setShowCategoryModal(false);
                  }
                }}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Unit Modal */}
      {showUnitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Add New Unit (একক)</h3>
            <div className="space-y-2 text-xs">
              <input
                type="text"
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                placeholder="Unit Name (e.g. Dozen, Roll)"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
              <input
                type="text"
                value={newUnitSymbol}
                onChange={(e) => setNewUnitSymbol(e.target.value)}
                placeholder="Symbol (e.g. dzn, rl)"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUnitModal(false)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newUnitName.trim()) {
                    addUnit(newUnitName.trim(), newUnitSymbol.trim() || newUnitName.toLowerCase());
                    setUnit(newUnitName.trim());
                    setNewUnitName('');
                    setNewUnitSymbol('');
                    setShowUnitModal(false);
                  }
                }}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
              >
                Save Unit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
