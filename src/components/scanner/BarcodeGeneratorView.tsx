import React, { useState, useEffect, useRef } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { renderBarcode, generateRandomBarcode } from '../../utils/barcode';
import { Barcode, Printer, Plus, RefreshCw, Eye, Check, Layers, Scan } from 'lucide-react';

export const BarcodeGeneratorView: React.FC = () => {
  const { products, language, openScanner } = useInventory();

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [customBarcode, setCustomBarcode] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [stickerCount, setStickerCount] = useState<number>(12);
  const [includePrice, setIncludePrice] = useState<boolean>(true);
  const [includeShopName, setIncludeShopName] = useState<boolean>(true);
  const [shopName, setShopName] = useState<string>('OKY Super Shop');

  const previewSvgRef = useRef<SVGSVGElement | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const activeBarcode = selectedProduct ? selectedProduct.barcode : (customBarcode || '022137');
  const activeTitle = selectedProduct ? selectedProduct.name : (customName || 'Product Barcode');
  const activePrice = selectedProduct ? selectedProduct.sellPrice : parseFloat(customPrice) || 0;

  useEffect(() => {
    if (previewSvgRef.current && activeBarcode) {
      renderBarcode(previewSvgRef.current, activeBarcode, {
        width: 1.8,
        height: 45,
        fontSize: 12,
        displayValue: true,
      });
    }
  }, [activeBarcode]);

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateRandom = () => {
    const random = generateRandomBarcode();
    setCustomBarcode(random);
    setSelectedProductId('');
  };

  return (
    <div id="barcode-generator-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Barcode className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {language === 'bn' ? 'বারকোড জেনারেটর ও লেবেল প্রিন্টার' : 'Barcode Generator & Label Printing'}
            </h1>
            <p className="text-xs text-slate-500">
              {language === 'bn'
                ? 'পণ্যের জন্য স্ট্যান্ডার্ড কোড-১২৮ বারকোড লেবেল তৈরি করুন এবং প্রিন্ট করুন'
                : 'Generate Code-128 retail barcode labels ready for thermal sticker rolls or A4 label sheets'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openScanner('lookup')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors border border-slate-200"
          >
            <Scan className="w-4 h-4 text-emerald-600" />
            {language === 'bn' ? 'ক্যামেরা দিয়ে স্ক্যান' : 'Live Camera Scanner'}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            {language === 'bn' ? 'লেবেল প্রিন্ট করুন' : 'Print Barcode Sheet'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              {language === 'bn' ? 'বারকোড তথ্য কনফিগারেশন' : 'Label Configuration'}
            </h2>

            {/* Select from Inventory */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {language === 'bn' ? 'ইনভেন্টরি থেকে পণ্য সিলেক্ট করুন' : 'Select From Inventory'}
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  if (e.target.value) {
                    setCustomBarcode('');
                  }
                }}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="">-- Or enter custom barcode below --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.barcode}] {p.name} (৳{p.sellPrice})
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Barcode field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  {language === 'bn' ? 'বারকোড নাম্বার' : 'Barcode Number'}
                </label>
                <button
                  onClick={handleGenerateRandom}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  Auto-Generate
                </button>
              </div>
              <input
                type="text"
                value={customBarcode || (selectedProduct ? selectedProduct.barcode : '')}
                onChange={(e) => {
                  setCustomBarcode(e.target.value);
                  setSelectedProductId('');
                }}
                placeholder="e.g. 022137 or 89012345678"
                className="w-full text-xs font-mono font-bold rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Custom Name / Price */}
            {!selectedProduct && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Product Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Product name on sticker"
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Price (৳)
                  </label>
                  <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="350.00"
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </>
            )}

            {/* Shop Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Shop / Brand Header
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Number of Labels to Print: <span className="text-emerald-600 font-bold">{stickerCount}</span>
              </label>
              <input
                type="range"
                min="1"
                max="36"
                value={stickerCount}
                onChange={(e) => setStickerCount(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex gap-2 mt-2">
                {[4, 8, 12, 16, 24].map((count) => (
                  <button
                    key={count}
                    onClick={() => setStickerCount(count)}
                    className={`flex-1 py-1 rounded-lg text-xs font-medium border ${
                      stickerCount === count
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeShopName}
                  onChange={(e) => setIncludeShopName(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                Show Shop Name on Sticker
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePrice}
                  onChange={(e) => setIncludePrice(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                Show Selling Price (৳)
              </label>
            </div>
          </div>

          {/* Single Sticker Big Preview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Single Sticker Preview (50mm x 30mm)
            </h3>
            <div className="mx-auto inline-block p-4 border-2 border-dashed border-slate-300 rounded-xl bg-white shadow-xs">
              {includeShopName && (
                <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wide truncate max-w-[200px]">
                  {shopName}
                </div>
              )}
              <div className="text-[12px] font-medium text-slate-800 line-clamp-1 max-w-[200px] mt-0.5">
                {activeTitle}
              </div>
              <div className="flex justify-center py-1">
                <svg ref={previewSvgRef} className="max-w-[220px]" />
              </div>
              {includePrice && (
                <div className="text-xs font-bold text-slate-900 mt-0.5">
                  PRICE: ৳{activePrice.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Printable Grid Preview Column */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Print Sheet Preview ({stickerCount} Stickers)
                </h3>
                <p className="text-xs text-slate-500">
                  Ready for direct A4 sheet or continuous thermal barcode sticker roll printing
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-full border border-emerald-200">
                Code-128 Compliant
              </span>
            </div>

            {/* Sticker Grid (Printable Area) */}
            <div
              id="printable-barcode-sheet"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200 print:bg-white print:p-0 print:border-none print:grid-cols-4"
            >
              {Array.from({ length: stickerCount }).map((_, idx) => (
                <StickerCard
                  key={idx}
                  barcode={activeBarcode}
                  title={activeTitle}
                  price={activePrice}
                  shopName={shopName}
                  includePrice={includePrice}
                  includeShopName={includeShopName}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StickerCardProps {
  barcode: string;
  title: string;
  price: number;
  shopName: string;
  includePrice: boolean;
  includeShopName: boolean;
}

const StickerCard: React.FC<StickerCardProps> = ({
  barcode,
  title,
  price,
  shopName,
  includePrice,
  includeShopName,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && barcode) {
      renderBarcode(svgRef.current, barcode, {
        width: 1.4,
        height: 38,
        fontSize: 10,
        displayValue: true,
      });
    }
  }, [barcode]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-center shadow-2xs hover:shadow-xs transition-shadow flex flex-col items-center justify-between min-h-[140px] print:shadow-none print:border-slate-300">
      {includeShopName && (
        <span className="text-[10px] font-bold text-slate-800 uppercase tracking-tight truncate w-full">
          {shopName}
        </span>
      )}
      <span className="text-[11px] font-medium text-slate-700 line-clamp-1 w-full mt-0.5">
        {title}
      </span>
      <div className="w-full flex justify-center py-1">
        <svg ref={svgRef} className="w-full max-w-[150px]" />
      </div>
      {includePrice && (
        <span className="text-[11px] font-bold text-slate-900 border-t border-slate-100 pt-1 w-full">
          MRP: ৳{price.toFixed(2)}
        </span>
      )}
    </div>
  );
};
