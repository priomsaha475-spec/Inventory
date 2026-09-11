import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { ActiveView } from '../types';
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  ShoppingBag,
  Barcode,
  ChevronDown,
  ChevronRight,
  Plus,
  Upload,
  Building,
  Tag,
  Scale,
  List,
  FileText,
  Printer,
  Sparkles,
  Store,
  Percent,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { activeView, setActiveView, language } = useInventory();

  // Accordion open states
  const [openProductSubmenu, setOpenProductSubmenu] = useState(true);
  const [openPurchaseSubmenu, setOpenPurchaseSubmenu] = useState(true);
  const [openSaleSubmenu, setOpenSaleSubmenu] = useState(true);
  const [openContactSubmenu, setOpenContactSubmenu] = useState(false);

  const navigate = (view: ActiveView) => {
    setActiveView(view);
    onCloseMobile();
  };

  const isProductActive = [
    'products',
    'new_product',
    'bulk_upload',
    'brands',
    'categories',
    'units',
  ].includes(activeView);

  const isPurchaseActive = ['purchases', 'create_purchase'].includes(activeView);
  const isSaleActive = ['sales', 'new_sale', 'sale_with_vat', 'pos_sale', 'invoice_view'].includes(activeView);
  const isContactActive = ['customers', 'suppliers'].includes(activeView);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 shadow-lg lg:shadow-none transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Baeba Inventory</div>
              <div className="text-[10px] text-emerald-600 font-medium">Enterprise Edition</div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-slate-700 p-1 text-xs"
          >
            ✕
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
          {/* Dashboard */}
          <button
            onClick={() => navigate('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
              activeView === 'dashboard'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
          </button>

          {/* POS Sale Quick Link */}
          <button
            onClick={() => navigate('pos_sale')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all ${
              activeView === 'pos_sale'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4" />
              <span>{language === 'bn' ? 'পিওএস বিক্রয়' : 'Point of Sale (POS)'}</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-700/30 text-white">
              F4
            </span>
          </button>

          <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {language === 'bn' ? 'ম্যানেজমেন্ট মেনু' : 'Inventory Modules'}
          </div>

          {/* Products Group */}
          <div>
            <button
              onClick={() => setOpenProductSubmenu(!openProductSubmenu)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                isProductActive ? 'text-emerald-700 bg-emerald-50/50' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'প্রোডাক্ট (পণ্য)' : 'Products & Catalog'}</span>
              </div>
              {openProductSubmenu ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {openProductSubmenu && (
              <div className="pl-9 pr-2 py-1 space-y-1">
                <button
                  onClick={() => navigate('products')}
                  className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeView === 'products'
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'পণ্য তালিকা' : 'Product List'}</span>
                </button>
                <button
                  onClick={() => navigate('new_product')}
                  className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeView === 'new_product'
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'নতুন পণ্য যোগ' : 'Add Product'}</span>
                </button>
                <button
                  onClick={() => navigate('bulk_upload')}
                  className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeView === 'bulk_upload'
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'বাল্ক প্রোডাক্ট আপলোড' : 'Bulk CSV Upload'}</span>
                </button>
                <button
                  onClick={() => navigate('brands')}
                  className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeView === 'brands'
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ব্র্যান্ড' : 'Brands'}</span>
                </button>
                <button
                  onClick={() => navigate('categories')}
                  className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeView === 'categories'
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ক্যাটাগরি' : 'Categories'}</span>
                </button>
                <button
                  onClick={() => navigate('units')}
                  className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeView === 'units'
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'একক (Units)' : 'Units'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Purchases Group */}
          <div>
            <button
              onClick={() => setOpenPurchaseSubmenu(!openPurchaseSubmenu)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                isPurchaseActive ? 'text-emerald-700 bg-emerald-50/50' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'ক্রয় (Purchases)' : 'Stock Purchases'}</span>
              </div>
              {openPurchaseSubmenu ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {openPurchaseSubmenu && (
              <div className="pl-9 pr-2 py-1 space-y-1">
                <button
                  onClick={() => navigate('create_purchase')}
                  className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeView === 'create_purchase'
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ক্রয় তৈরি' : 'Create Purchase'}</span>
                </button>
                <button
                  onClick={() => navigate('purchases')}
                  className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeView === 'purchases'
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ক্রয় তালিকা' : 'Purchase List'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Sales Group */}
          <div>
            <button
              onClick={() => setOpenSaleSubmenu(!openSaleSubmenu)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                isSaleActive ? 'text-emerald-700 bg-emerald-50/50' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'বিক্রয় (Sales)' : 'Sales & Invoicing'}</span>
              </div>
              {openSaleSubmenu ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {openSaleSubmenu && (
              <div className="pl-9 pr-2 py-1 space-y-1">
                <button
                  onClick={() => navigate('new_sale')}
                  className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                    activeView === 'new_sale'
                      ? 'bg-emerald-500 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Sale</span>
                </button>
                <button
                  onClick={() => navigate('new_sale')}
                  className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                    activeView === 'sale_with_vat'
                      ? 'bg-emerald-500 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>Sale With Vat</span>
                </button>
                <button
                  onClick={() => navigate('pos_sale')}
                  className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                    activeView === 'pos_sale'
                      ? 'bg-emerald-500 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>POS Sale</span>
                </button>
                <button
                  onClick={() => navigate('sales')}
                  className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                    activeView === 'sales'
                      ? 'bg-emerald-500 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Sale List</span>
                </button>
                <button
                  onClick={() => navigate('sales')}
                  className="w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium flex items-center gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Sale Return List</span>
                </button>
              </div>
            )}
          </div>

          {/* Customers & Suppliers */}
          <div>
            <button
              onClick={() => setOpenContactSubmenu(!openContactSubmenu)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                isContactActive ? 'text-emerald-700 bg-emerald-50/50' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'কাস্টমার ও সরবরাহক' : 'Contacts'}</span>
              </div>
              {openContactSubmenu ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {openContactSubmenu && (
              <div className="pl-9 pr-2 py-1 space-y-1">
                <button
                  onClick={() => navigate('customers')}
                  className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeView === 'customers'
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'গ্রাহকের তালিকা' : 'Customers'}</span>
                </button>
                <button
                  onClick={() => navigate('suppliers')}
                  className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeView === 'suppliers'
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সরবরাহকারীর তালিকা' : 'Suppliers'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Barcode Generator & Print */}
          <button
            onClick={() => navigate('barcode_generator')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeView === 'barcode_generator'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'বারকোড লেবেল তৈরি' : 'Print Barcode Labels'}</span>
          </button>

          {/* Shop & Invoice Settings */}
          <button
            onClick={() => navigate('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeView === 'settings'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'দোকান ও চালান সেটিংস' : 'Shop & Invoice Settings'}</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
              AD
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-800 truncate">Admin Cashier</div>
              <div className="text-[10px] text-emerald-600 font-mono">Terminal #01 Active</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
