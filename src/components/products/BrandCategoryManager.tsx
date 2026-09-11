import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Building, Tag, Scale, Plus, Trash2, Edit3, Check } from 'lucide-react';

interface BrandCategoryManagerProps {
  initialTab?: 'brands' | 'categories' | 'units';
}

export const BrandCategoryManager: React.FC<BrandCategoryManagerProps> = ({ initialTab = 'brands' }) => {
  const {
    brands,
    addBrand,
    categories,
    addCategory,
    units,
    addUnit,
    products,
    language,
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'brands' | 'categories' | 'units'>(initialTab);

  // New Brand form
  const [brandName, setBrandName] = useState('');
  const [brandSearch, setBrandSearch] = useState('');

  // New Category form
  const [catName, setCatName] = useState('');
  const [catSearch, setCatSearch] = useState('');

  // New Unit form
  const [unitName, setUnitName] = useState('');
  const [unitSymbol, setUnitSymbol] = useState('');

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    addBrand(brandName.trim());
    setBrandName('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    addCategory(catName.trim());
    setCatName('');
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim()) return;
    addUnit(unitName.trim(), unitSymbol.trim() || unitName.toLowerCase());
    setUnitName('');
    setUnitSymbol('');
  };

  return (
    <div id="brand-category-manager" className="space-y-5">
      {/* Top Header & Tab switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {language === 'bn'
              ? 'মাস্টার ডাটা ম্যানেজমেন্ট (ব্র্যান্ড, ক্যাটাগরি ও একক)'
              : 'Master Data Setup (Brands, Categories & Units)'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize inventory taxonomies, manufacturers, and measurement units
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('brands')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'brands' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            {language === 'bn' ? 'ব্র্যান্ড' : 'Brands'} ({brands.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'categories' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            {language === 'bn' ? 'ক্যাটাগরি' : 'Categories'} ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'units' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            {language === 'bn' ? 'একক' : 'Units'} ({units.length})
          </button>
        </div>
      </div>

      {/* Brand Tab Content */}
      {activeTab === 'brands' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <form onSubmit={handleAddBrand} className="flex items-center gap-2 max-w-md w-full">
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Brand Name (e.g. Next, Teer, Casio)"
                className="flex-1 text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {language === 'bn' ? 'তৈরি করুন' : 'Create Brand'}
              </button>
            </form>

            <input
              type="text"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              placeholder="Search brand..."
              className="text-xs border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50 text-slate-800 max-w-xs w-full"
            />
          </div>

          <div className="divide-y divide-slate-100">
            {brands
              .filter((b) => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
              .map((b, idx) => {
                const count = products.filter((p) => p.brand === b.name).length;
                return (
                  <div key={b.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/60 px-3 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono text-xs w-6">{idx + 1}.</span>
                      <span className="font-semibold text-slate-800 text-xs">{b.name}</span>
                      {b.nameBn && <span className="text-[11px] text-slate-400">({b.nameBn})</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                        {count} products
                      </span>
                      <button className="px-2.5 py-1 text-[11px] font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100">
                        {language === 'bn' ? 'সম্পাদনা' : 'Edit'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Category Tab Content */}
      {activeTab === 'categories' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <form onSubmit={handleAddCategory} className="flex items-center gap-2 max-w-md w-full">
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Category Name (e.g. Chips, Tab, Milk)"
                className="flex-1 text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {language === 'bn' ? 'তৈরি করুন' : 'Create Category'}
              </button>
            </form>

            <input
              type="text"
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              placeholder="Search category..."
              className="text-xs border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50 text-slate-800 max-w-xs w-full"
            />
          </div>

          <div className="divide-y divide-slate-100">
            {categories
              .filter((c) => c.name.toLowerCase().includes(catSearch.toLowerCase()))
              .map((c, idx) => {
                const count = products.filter((p) => p.category === c.name).length;
                return (
                  <div key={c.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/60 px-3 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono text-xs w-6">{idx + 1}.</span>
                      <div>
                        <span className="font-semibold text-slate-800 text-xs">{c.name}</span>
                        {c.nameBn && <span className="text-[11px] text-slate-400 ml-1.5">({c.nameBn})</span>}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {c.subCategories.length > 0 ? c.subCategories.join(', ') : '0 subcategories'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                        {count} products
                      </span>
                      <button className="px-2.5 py-1 text-[11px] font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100">
                        {language === 'bn' ? 'সম্পাদনা' : 'Edit'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Unit Tab Content */}
      {activeTab === 'units' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <form onSubmit={handleAddUnit} className="flex items-center gap-2 max-w-md w-full">
              <input
                type="text"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="Unit (e.g. Blister, Bottle)"
                className="flex-1 text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <input
                type="text"
                value={unitSymbol}
                onChange={(e) => setUnitSymbol(e.target.value)}
                placeholder="Symbol (btl)"
                className="w-24 text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 text-slate-800"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Unit
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {units.map((u) => (
              <div key={u.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 text-xs block">{u.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Symbol: {u.symbol}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
