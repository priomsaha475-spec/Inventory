import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ActiveView,
  Brand,
  Category,
  Customer,
  Product,
  PurchaseInvoice,
  SaleInvoice,
  Supplier,
  StockAdjustment,
  ShopSettings,
} from '../types';
import {
  INITIAL_BRANDS,
  INITIAL_CATEGORIES,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_PURCHASES,
  INITIAL_SALES,
  INITIAL_SUPPLIERS,
  INITIAL_UNITS,
} from '../data/mockData';
import { playScannerBeep } from '../utils/audio';

interface ScannerModalConfig {
  isOpen: boolean;
  mode: 'lookup' | 'pos_add' | 'fill_barcode' | 'stock_adjust';
  onScanCallback?: (barcode: string, product?: Product) => void;
  title?: string;
}

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface InventoryContextType {
  // Navigation & Localization
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductByBarcode: (barcode: string) => Product | undefined;
  adjustStock: (productId: string, qtyDelta: number, reason: string) => void;

  // Brands & Categories & Units
  brands: Brand[];
  addBrand: (name: string, nameBn?: string) => Brand;
  categories: Category[];
  addCategory: (name: string, nameBn?: string, subCategories?: string[]) => Category;
  units: { id: string; name: string; symbol: string }[];
  addUnit: (name: string, symbol: string) => void;

  // Customers & Suppliers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'currentBalance'>) => Customer;
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'payable'>) => Supplier;

  // Sales & Purchases
  sales: SaleInvoice[];
  recordSale: (sale: Omit<SaleInvoice, 'id' | 'invoiceNo' | 'date'>) => SaleInvoice;
  editingSaleInvoice: SaleInvoice | null;
  setEditingSaleInvoice: (invoice: SaleInvoice | null) => void;
  startEditSale: (invoice: SaleInvoice) => void;
  updateSale: (id: string, saleData: Omit<SaleInvoice, 'id' | 'invoiceNo' | 'date'>) => SaleInvoice;
  deleteSale: (id: string) => void;
  currentInvoice: SaleInvoice | null;
  setCurrentInvoice: (invoice: SaleInvoice | null) => void;
  viewInvoice: (invoice: SaleInvoice) => void;
  purchases: PurchaseInvoice[];
  recordPurchase: (purchase: Omit<PurchaseInvoice, 'id' | 'purchaseNo'> & { date?: string }) => PurchaseInvoice;
  deletePurchase: (id: string) => void;

  // Shop & Invoice Settings
  shopSettings: ShopSettings;
  updateShopSettings: (settings: Partial<ShopSettings>) => void;

  // Adjustments log
  adjustments: StockAdjustment[];

  // Global Real-time Scanner Modal
  scannerConfig: ScannerModalConfig;
  openScanner: (
    mode?: ScannerModalConfig['mode'],
    onScanCallback?: ScannerModalConfig['onScanCallback'],
    title?: string
  ) => void;
  closeScanner: () => void;

  // Toast
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;

  // Clear all demo data
  clearAllData: () => void;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

const STORAGE_KEYS = {
  PRODUCTS: 'baeba_products_v3',
  BRANDS: 'baeba_brands_v3',
  CATEGORIES: 'baeba_categories_v3',
  CUSTOMERS: 'baeba_customers_v3',
  SUPPLIERS: 'baeba_suppliers_v3',
  SALES: 'baeba_sales_v3',
  PURCHASES: 'baeba_purchases_v3',
  LANG: 'baeba_language_v3',
  SETTINGS: 'baeba_shop_settings_v3',
};

// Automatic cleanup of legacy demo datasets from prior versions
if (typeof window !== 'undefined') {
  if (!localStorage.getItem('baeba_v3_clean_init')) {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('baeba_') && !key.includes('_v3')) {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem('baeba_v3_clean_init', 'true');
  }
}

const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  shopName: 'Supper Shop',
  shopNameBn: 'সুপার শপ',
  tagline: 'Real-Time Barcode & POS',
  logoText: 'OKY',
  logoUrl: '',
  address: 'Chuadanga',
  mobile: '01401371860',
  email: 'hamidbd2310@gmail.com',
  supportPhone: '096 3838 0101',
  termsAndConditions: 'বিঃ দ্রঃ বিক্রিত পণ্য ফেরতযোগ্য নহে। যেকোনো প্রয়োজনে ক্যাশ মেমো সাথে রাখুন।',
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [language, setLanguageState] = useState<'en' | 'bn'>('en');

  // Shop Settings
  const [shopSettings, setShopSettings] = useState<ShopSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        return { ...DEFAULT_SHOP_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
    return DEFAULT_SHOP_SETTINGS;
  });

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Brands
  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BRANDS);
    return saved ? JSON.parse(saved) : INITIAL_BRANDS;
  });

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // Units
  const [units, setUnits] = useState(INITIAL_UNITS);

  // Customers
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  // Suppliers
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  // Sales
  const [sales, setSales] = useState<SaleInvoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [currentInvoice, setCurrentInvoice] = useState<SaleInvoice | null>(null);
  const [editingSaleInvoice, setEditingSaleInvoice] = useState<SaleInvoice | null>(null);

  const viewInvoice = (invoice: SaleInvoice) => {
    setCurrentInvoice(invoice);
    setActiveView('invoice_view');
  };

  const startEditSale = (invoice: SaleInvoice) => {
    setEditingSaleInvoice(invoice);
    setActiveView('new_sale');
  };

  // Purchases
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        return INITIAL_PURCHASES;
      }
    }
    return INITIAL_PURCHASES;
  });

  // Stock adjustments
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);

  // Clear all demo data function
  const clearAllData = () => {
    setProducts([]);
    setSales([]);
    setPurchases([]);
    setSuppliers([]);
    setBrands([]);
    setCategories([]);
    setCustomers(INITIAL_CUSTOMERS);
    setCurrentInvoice(null);
    setEditingSaleInvoice(null);
    setAdjustments([]);

    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.PURCHASES);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
    localStorage.removeItem(STORAGE_KEYS.BRANDS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);

    showToast(
      language === 'bn'
        ? 'সকল ডেমো ডাটা পরিষ্কার করা হয়েছে!'
        : 'All demo data has been wiped clean!',
      'success'
    );
  };

  // Scanner modal state
  const [scannerConfig, setScannerConfig] = useState<ScannerModalConfig>({
    isOpen: false,
    mode: 'lookup',
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(shopSettings));
  }, [shopSettings]);

  const setLanguage = (lang: 'en' | 'bn') => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  };

  const showToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openScanner = (
    mode: ScannerModalConfig['mode'] = 'lookup',
    onScanCallback?: ScannerModalConfig['onScanCallback'],
    title?: string
  ) => {
    setScannerConfig({
      isOpen: true,
      mode,
      onScanCallback,
      title,
    });
  };

  const closeScanner = () => {
    setScannerConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const getProductByBarcode = (barcode: string): Product | undefined => {
    const clean = barcode.trim().toLowerCase();
    return products.find((p) => p.barcode.toLowerCase() === clean);
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(language === 'bn' ? `পণ্য "${newProduct.name}" সফলভাবে যুক্ত হয়েছে` : `Product "${newProduct.name}" added successfully`);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    showToast(language === 'bn' ? 'পণ্য তথ্য আপডেট করা হয়েছে' : 'Product updated successfully');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    showToast(language === 'bn' ? 'পণ্যটি মুছে ফেলা হয়েছে' : 'Product removed from inventory', 'info');
  };

  const adjustStock = (productId: string, qtyDelta: number, reason: string) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const previousStock = target.stockQty;
    const newStock = Math.max(0, target.stockQty + qtyDelta);

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockQty: newStock } : p))
    );

    const adj: StockAdjustment = {
      id: `adj-${Date.now()}`,
      date: new Date().toLocaleString(),
      productId,
      productName: target.name,
      barcode: target.barcode,
      type: qtyDelta >= 0 ? 'ADD' : 'REMOVE',
      quantity: Math.abs(qtyDelta),
      previousStock,
      newStock,
      reason,
    };
    setAdjustments((prev) => [adj, ...prev]);

    playScannerBeep('success');
    showToast(
      language === 'bn'
        ? `স্টক আপডেট: ${target.name} (${previousStock} → ${newStock})`
        : `Stock updated: ${target.name} (${previousStock} → ${newStock})`
    );
  };

  const addBrand = (name: string, nameBn?: string): Brand => {
    const brand: Brand = {
      id: `b-${Date.now()}`,
      name,
      nameBn: nameBn || name,
    };
    setBrands((prev) => [...prev, brand]);
    showToast(language === 'bn' ? `ব্র্যান্ড "${name}" যোগ করা হয়েছে` : `Brand "${name}" added`);
    return brand;
  };

  const addCategory = (name: string, nameBn?: string, subCategories: string[] = []): Category => {
    const cat: Category = {
      id: `c-${Date.now()}`,
      name,
      nameBn: nameBn || name,
      subCategories,
    };
    setCategories((prev) => [...prev, cat]);
    showToast(language === 'bn' ? `ক্যাটাগরি "${name}" যোগ করা হয়েছে` : `Category "${name}" added`);
    return cat;
  };

  const addUnit = (name: string, symbol: string) => {
    setUnits((prev) => [...prev, { id: `u-${Date.now()}`, name, symbol }]);
    showToast(`Unit ${name} added`);
  };

  const addCustomer = (custData: Omit<Customer, 'id' | 'createdAt' | 'currentBalance'>): Customer => {
    const cust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      currentBalance: custData.openingBalance || 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [cust, ...prev]);
    showToast(language === 'bn' ? `কাস্টমার "${cust.name}" তৈরি হয়েছে` : `Customer "${cust.name}" registered`);
    return cust;
  };

  const addSupplier = (supData: Omit<Supplier, 'id' | 'createdAt' | 'payable'>): Supplier => {
    const sup: Supplier = {
      ...supData,
      id: `sup-${Date.now()}`,
      payable: supData.openingBalance || 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSuppliers((prev) => [sup, ...prev]);
    showToast(language === 'bn' ? `সরবরাহকারী "${sup.name}" যোগ করা হয়েছে` : `Supplier "${sup.name}" created`);
    return sup;
  };

  const recordSale = (saleData: Omit<SaleInvoice, 'id' | 'invoiceNo' | 'date'>): SaleInvoice => {
    // Generate invoice number like in the video: e.g. INV-140937
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const invoiceNo = `INV-${randomSuffix}`;
    const dateStr = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const newSale: SaleInvoice = {
      ...saleData,
      id: `sale-${Date.now()}`,
      invoiceNo,
      date: dateStr,
    };

    // Deduct stock for each sold item
    setProducts((prev) =>
      prev.map((prod) => {
        const soldItem = saleData.items.find((i) => i.productId === prod.id);
        if (soldItem) {
          return {
            ...prod,
            stockQty: Math.max(0, prod.stockQty - soldItem.quantity),
          };
        }
        return prod;
      })
    );

    // Update customer current balance if there is a due or customer exists
    if (saleData.customerId && saleData.currentTotalDue !== undefined) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === saleData.customerId
            ? { ...c, currentBalance: saleData.currentTotalDue || 0 }
            : c
        )
      );
    }

    setSales((prev) => [newSale, ...prev]);
    setCurrentInvoice(newSale);

    showToast(
      language === 'bn'
        ? `চালান ${invoiceNo} তৈরি সম্পন্ন হয়েছে! ৳${newSale.grandTotal.toFixed(2)}`
        : `Sale ${invoiceNo} completed! ৳${newSale.grandTotal.toFixed(2)}`
    );

    return newSale;
  };

  const updateSale = (
    id: string,
    saleData: Omit<SaleInvoice, 'id' | 'invoiceNo' | 'date'>
  ): SaleInvoice => {
    const existing = sales.find((s) => s.id === id);
    if (!existing) {
      throw new Error('Sale not found');
    }

    // Adjust product stocks:
    // 1. Add back previous quantities sold in existing.items
    // 2. Subtract new quantities sold in saleData.items
    setProducts((prev) => {
      const stockMap = new Map<string, number>();
      existing.items.forEach((item) => {
        stockMap.set(item.productId, (stockMap.get(item.productId) || 0) + item.quantity);
      });
      saleData.items.forEach((item) => {
        stockMap.set(item.productId, (stockMap.get(item.productId) || 0) - item.quantity);
      });

      return prev.map((prod) => {
        const delta = stockMap.get(prod.id);
        if (delta !== undefined && delta !== 0) {
          return {
            ...prod,
            stockQty: Math.max(0, prod.stockQty + delta),
          };
        }
        return prod;
      });
    });

    // Update customer balance if customer has due
    if (saleData.customerId && saleData.currentTotalDue !== undefined) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === saleData.customerId
            ? { ...c, currentBalance: saleData.currentTotalDue || 0 }
            : c
        )
      );
    }

    const updatedSale: SaleInvoice = {
      ...saleData,
      id: existing.id,
      invoiceNo: existing.invoiceNo,
      date: existing.date,
    };

    setSales((prev) => prev.map((s) => (s.id === id ? updatedSale : s)));
    setEditingSaleInvoice(null);
    setCurrentInvoice(updatedSale);

    showToast(
      language === 'bn'
        ? `চালান ${existing.invoiceNo} সফলভাবে আপডেট হয়েছে!`
        : `Sale ${existing.invoiceNo} updated successfully!`
    );

    return updatedSale;
  };

  const deleteSale = (id: string) => {
    const existing = sales.find((s) => s.id === id);
    if (!existing) return;

    // Restore stock for all sold items
    setProducts((prev) =>
      prev.map((prod) => {
        const soldItem = existing.items.find((i) => i.productId === prod.id);
        if (soldItem) {
          return {
            ...prod,
            stockQty: prod.stockQty + soldItem.quantity,
          };
        }
        return prod;
      })
    );

    // Adjust customer balance if this sale had due
    if (existing.customerId && existing.dueAmount > 0) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === existing.customerId) {
            return {
              ...c,
              currentBalance: Math.max(0, c.currentBalance - existing.dueAmount),
            };
          }
          return c;
        })
      );
    }

    setSales((prev) => prev.filter((s) => s.id !== id));
    if (currentInvoice?.id === id) {
      setCurrentInvoice(null);
    }
    if (editingSaleInvoice?.id === id) {
      setEditingSaleInvoice(null);
    }

    showToast(
      language === 'bn'
        ? `চালান ${existing.invoiceNo} মুছে ফেলা হয়েছে এবং পণ্য স্টক ফেরত এসেছে!`
        : `Sale ${existing.invoiceNo} deleted and stock restored!`,
      'info'
    );
  };

  const updateShopSettings = (settings: Partial<ShopSettings>) => {
    setShopSettings((prev) => ({
      ...prev,
      ...settings,
    }));
    showToast(
      language === 'bn'
        ? 'দোকান ও চালানের তথ্য সফলভাবে সংরক্ষিত হয়েছে!'
        : 'Shop & Invoice settings updated successfully!'
    );
  };

  const recordPurchase = (
    purData: Omit<PurchaseInvoice, 'id' | 'purchaseNo'> & { date?: string }
  ): PurchaseInvoice => {
    const seq = String(purchases.length + 1).padStart(4, '0');
    const purchaseNo = `PUR-${new Date().getFullYear()}-${seq}`;
    const dateStr = purData.date || new Date().toISOString().split('T')[0];

    const newPur: PurchaseInvoice = {
      ...purData,
      id: `pur-${Date.now()}`,
      purchaseNo,
      date: dateStr,
    };

    // Add stock for each purchased item and update cost
    setProducts((prev) =>
      prev.map((prod) => {
        const purItem = purData.items.find((i) => i.productId === prod.id);
        if (purItem) {
          return {
            ...prod,
            stockQty: prod.stockQty + purItem.quantity,
            unitCost: purItem.unitCost > 0 ? purItem.unitCost : prod.unitCost,
          };
        }
        return prod;
      })
    );

    // Update supplier payable if there is due amount
    if (purData.dueAmount > 0 && purData.supplierId) {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === purData.supplierId) {
            return {
              ...s,
              payable: (s.payable || 0) + purData.dueAmount,
            };
          }
          return s;
        })
      );
    }

    setPurchases((prev) => [newPur, ...prev]);
    showToast(
      language === 'bn'
        ? `ক্রয় চালান ${purchaseNo} সংরক্ষণ করা হয়েছে! স্টক সফলভাবে বৃদ্ধি পেয়েছে।`
        : `Purchase ${purchaseNo} recorded! Stock successfully added.`
    );

    return newPur;
  };

  const deletePurchase = (id: string) => {
    const existing = purchases.find((p) => p.id === id);
    if (!existing) return;

    // Rollback stock for all items
    setProducts((prev) =>
      prev.map((prod) => {
        const item = existing.items.find((i) => i.productId === prod.id);
        if (item) {
          return {
            ...prod,
            stockQty: Math.max(0, prod.stockQty - item.quantity),
          };
        }
        return prod;
      })
    );

    // Rollback supplier payable
    if (existing.supplierId && existing.dueAmount > 0) {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === existing.supplierId) {
            return {
              ...s,
              payable: Math.max(0, (s.payable || 0) - existing.dueAmount),
            };
          }
          return s;
        })
      );
    }

    setPurchases((prev) => prev.filter((p) => p.id !== id));
    showToast(
      language === 'bn'
        ? `ক্রয় চালান ${existing.purchaseNo} মুছে ফেলা হয়েছে এবং স্টক সমন্বয় করা হয়েছে!`
        : `Purchase ${existing.purchaseNo} deleted and stock adjusted!`,
      'info'
    );
  };

  return (
    <InventoryContext.Provider
      value={{
        activeView,
        setActiveView,
        language,
        setLanguage,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductByBarcode,
        adjustStock,
        brands,
        addBrand,
        categories,
        addCategory,
        units,
        addUnit,
        customers,
        addCustomer,
        suppliers,
        addSupplier,
        sales,
        recordSale,
        editingSaleInvoice,
        setEditingSaleInvoice,
        startEditSale,
        updateSale,
        deleteSale,
        currentInvoice,
        setCurrentInvoice,
        viewInvoice,
        purchases,
        recordPurchase,
        deletePurchase,
        shopSettings,
        updateShopSettings,
        adjustments,
        scannerConfig,
        openScanner,
        closeScanner,
        toasts,
        showToast,
        dismissToast,
        clearAllData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
