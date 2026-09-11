import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Plus } from 'lucide-react';

export const BulkUploadModal: React.FC = () => {
  const { brands, categories, units, addProduct, language, setActiveView, showToast } = useInventory();

  const [selectedBrand, setSelectedBrand] = useState(brands[0]?.name || '');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || '');
  const [selectedUnit, setSelectedUnit] = useState(units[0]?.name || '');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importedCount, setImportedCount] = useState(0);

  const handleDownloadSample = () => {
    const csvHeader = 'Name,Barcode,UnitCost,SellPrice,StockQty,AlertQty\n';
    const sampleRows = [
      'Sample Item A,8901234001,150.00,180.00,50,10',
      'Sample Item B,8901234002,45.00,60.00,100,20',
      'Sample Item C,8901234003,280.00,320.00,30,5',
    ].join('\n');

    const blob = new Blob([csvHeader + sampleRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_bulk_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Sample CSV template downloaded successfully');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      let count = 0;

      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 4) {
          const name = parts[0]?.trim();
          const barcode = parts[1]?.trim();
          const unitCost = parseFloat(parts[2]?.trim()) || 10;
          const sellPrice = parseFloat(parts[3]?.trim()) || 15;
          const stockQty = parseInt(parts[4]?.trim()) || 20;
          const alertQty = parseInt(parts[5]?.trim()) || 5;

          if (name && barcode) {
            addProduct({
              name,
              barcode,
              brand: selectedBrand || 'Generic',
              category: selectedCategory || 'General',
              unit: selectedUnit || 'Pcs',
              unitCost,
              sellPrice,
              stockQty,
              alertQty,
            });
            count++;
          }
        }
      }

      setImportedCount(count);
      setUploadStatus('success');
      showToast(`Successfully imported ${count} items into inventory`);
    };
    reader.readAsText(file);
  };

  return (
    <div id="bulk-upload-view" className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {language === 'bn' ? 'বাল্ক প্রোডাক্ট আপলোড (Bulk Product Upload)' : 'Bulk Product Import (CSV / Excel)'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select brand, category and upload spreadsheet to import hundreds of items with barcodes in seconds
          </p>
        </div>

        <button
          onClick={() => setActiveView('products')}
          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
        >
          Back to Products
        </button>
      </div>

      {/* Form configuration (matching video 00:24) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Brand */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {language === 'bn' ? 'পণ্য কোম্পানি (Select Brand) *' : 'Target Brand *'}
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {language === 'bn' ? 'পণ্য শ্রেণী (Select Category) *' : 'Target Category *'}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {language === 'bn' ? 'পণ্য ইউনিট (Select Unit) *' : 'Default Unit *'}
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {units.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons: Download Sample and Upload File (matching video 00:25) */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadSample}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            {language === 'bn' ? 'নমুনা ফাইল ডাউনলোড (Download Sample CSV)' : 'Download Sample CSV'}
          </button>

          <label className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors">
            <Upload className="w-4 h-4" />
            {language === 'bn' ? 'আপলোড করুন (Upload File)' : 'Upload CSV / Excel File'}
            <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        {uploadStatus === 'success' && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Import Successful!</span> {importedCount} new products imported into inventory.
            </div>
            <button
              onClick={() => setActiveView('products')}
              className="ml-auto underline font-semibold hover:text-emerald-950"
            >
              View in Products →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
