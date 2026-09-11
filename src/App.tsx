/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PosSaleView } from './components/pos/PosSaleView';
import { ProductList } from './components/products/ProductList';
import { AddProductModal } from './components/products/AddProductModal';
import { BulkUploadModal } from './components/products/BulkUploadModal';
import { BrandCategoryManager } from './components/products/BrandCategoryManager';
import { CreatePurchaseView } from './components/purchases/CreatePurchaseView';
import { PurchaseListView } from './components/purchases/PurchaseListView';
import { SaleListView } from './components/sales/SaleListView';
import { CreateSaleView } from './components/sales/CreateSaleView';
import { InvoiceView } from './components/sales/InvoiceView';
import { CustomerSupplierView } from './components/contacts/CustomerSupplierView';
import { BarcodeGeneratorView } from './components/scanner/BarcodeGeneratorView';
import { ShopSettingsView } from './components/settings/ShopSettingsView';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, setActiveView, toasts } = useInventory();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global hotkeys (F4 for POS Sale)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys if user is actively typing in an input or textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      if (e.key === 'F4') {
        e.preventDefault();
        setActiveView('pos_sale');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveView]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'pos_sale':
        return <PosSaleView />;
      case 'products':
        return <ProductList />;
      case 'new_product':
        return <AddProductModal />;
      case 'bulk_upload':
        return <BulkUploadModal />;
      case 'brands':
        return <BrandCategoryManager initialTab="brands" />;
      case 'categories':
        return <BrandCategoryManager initialTab="categories" />;
      case 'units':
        return <BrandCategoryManager initialTab="units" />;
      case 'create_purchase':
        return <CreatePurchaseView />;
      case 'purchases':
        return <PurchaseListView />;
      case 'new_sale':
      case 'sale_with_vat':
        return <CreateSaleView />;
      case 'invoice_view':
        return <InvoiceView />;
      case 'sales':
        return <SaleListView />;
      case 'customers':
        return <CustomerSupplierView initialType="customers" />;
      case 'suppliers':
        return <CustomerSupplierView initialType="suppliers" />;
      case 'barcode_generator':
        return <BarcodeGeneratorView />;
      case 'settings':
        return <ShopSettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <TopNav onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />

        {/* Dynamic View Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-3.5 rounded-2xl shadow-lg border flex items-center gap-3 transition-all transform translate-y-0 backdrop-blur-md ${
                isSuccess
                  ? 'bg-emerald-950/90 text-white border-emerald-700'
                  : isError
                  ? 'bg-red-950/90 text-white border-red-700'
                  : isWarning
                  ? 'bg-amber-950/90 text-white border-amber-700'
                  : 'bg-slate-900/90 text-white border-slate-700'
              }`}
            >
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {isError && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}

              <div className="text-xs font-medium leading-tight flex-1">{t.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <InventoryProvider>
      <MainContent />
    </InventoryProvider>
  );
}
