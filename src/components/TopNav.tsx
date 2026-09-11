import React from 'react';
import { useInventory } from '../context/InventoryContext';
import {
  Menu,
  ShoppingCart,
  Plus,
  Globe,
  PhoneCall,
  Bell,
  Search,
  Store,
  ExternalLink,
  Settings,
} from 'lucide-react';

interface TopNavProps {
  onToggleSidebar: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onToggleSidebar }) => {
  const {
    language,
    setLanguage,
    setActiveView,
    products,
    shopSettings
  } = useInventory();

  const lowStockCount = products.filter((p) => p.stockQty > 0 && p.stockQty <= p.alertQty).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-2xs">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden transition-colors cursor-pointer"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-base shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-800">
                  {shopSettings.shopName || 'OKY Super Shop'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                  ERP
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                {shopSettings.tagline || 'Real-Time Barcode & POS'}
              </span>
            </div>
          </div>
        </div>

        {/* Center / Hotline from video */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/70 rounded-full text-xs text-slate-600">
          <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {language === 'bn' ? 'সাপোর্টঃ' : 'Support:'}{' '}
            <strong className="text-slate-800 font-mono">
              {shopSettings.supportPhone || shopSettings.mobile || '096 3838 0101'}
            </strong>
          </span>
        </div>

        {/* Right Action buttons (matching video 00:01) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Settings button */}
          <button
            onClick={() => setActiveView('settings')}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-center transition-colors cursor-pointer"
            title={language === 'bn' ? 'দোকান ও চালান সেটিংস' : 'Shop & Invoice Settings'}
          >
            <Settings className="w-4 h-4" />
          </button>
          {/* Language Toggle: বাংলা / English */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            title="Switch Language (বাংলা / English)"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          {/* Sale button matching video */}
          <button
            id="top-nav-sale-btn"
            onClick={() => setActiveView('new_sale')}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Sale</span>
          </button>

          {/* POS Sale Button (Green button in video) */}
          <button
            id="top-nav-pos-sale-btn"
            onClick={() => setActiveView('pos_sale')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Pos Sale</span>
          </button>

          {/* + Add New dropdown button matching video */}
          <button
            onClick={() => setActiveView('new_product')}
            className="hidden sm:flex px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Add New</span>
          </button>
        </div>
      </div>
    </header>
  );
};
