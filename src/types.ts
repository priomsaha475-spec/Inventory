export interface Product {
  id: string;
  name: string;
  nameBn?: string;
  barcode: string;
  brand: string;
  category: string;
  subCategory?: string;
  unit: string;
  stockQty: number;
  alertQty: number;
  unitCost: number;
  sellPrice: number;
  dealerPrice?: number;
  imageUrl?: string;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  nameBn?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  nameBn?: string;
  subCategories: string[];
}

export interface Customer {
  id: string;
  name: string;
  nameBn?: string;
  mobile: string;
  email?: string;
  address: string;
  openingBalance: number;
  currentBalance: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  mobile: string;
  email?: string;
  address: string;
  openingBalance: number;
  payable: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SaleInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  customerId: string;
  customerName: string;
  customerMobile?: string;
  customerAddress?: string;
  note?: string;
  sr?: string;
  createdBy?: string;
  items: {
    productId: string;
    productName: string;
    barcode: string;
    unit?: string;
    stock?: number;
    expiryDate?: string;
    quantity: number;
    unitPrice: number;
    dealerPrice?: number;
    total: number;
  }[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  vatPercent?: number;
  vatAmount?: number;
  otherCostName?: string;
  otherCost: number;
  grandTotal: number;
  previousDue?: number;
  paidAmount: number;
  dueAmount: number;
  currentTotalDue?: number;
  paymentMethod: string;
  sendSms?: boolean;
  status: 'PAID' | 'PARTIAL' | 'DUE';
}

export type InvoiceCopyType = 'customer' | 'office' | 'both';

export interface SupplierBatchAllocation {
  productId: string;
  productName: string;
  barcode: string;
  unit?: string;
  supplierId: string;
  supplierName: string;
  supplierSl: string;
  purchaseNo?: string;
  purchaseDate?: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  totalCost: number;
  totalSale: number;
  profit: number;
  profitPercent: number;
}

export interface PurchaseInvoice {
  id: string;
  purchaseNo: string;
  date: string;
  supplierId: string;
  supplierName: string;
  supplierChallanNo?: string;
  note?: string;
  items: {
    productId: string;
    productName: string;
    barcode: string;
    quantity: number;
    unitCost: number;
    total: number;
  }[];
  subtotal: number;
  otherCost?: number;
  discountAmount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: 'Cash' | 'Bank' | 'Cheque' | 'Mobile Banking';
  status: 'PAID' | 'PARTIAL' | 'DUE';
}

export interface StockAdjustment {
  id: string;
  date: string;
  productId: string;
  productName: string;
  barcode: string;
  type: 'ADD' | 'REMOVE' | 'SET';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
}

export interface ShopSettings {
  shopName: string;
  shopNameBn?: string;
  tagline?: string;
  logoText: string;
  logoUrl?: string;
  address: string;
  mobile: string;
  email: string;
  supportPhone?: string;
  termsAndConditions?: string;
}

export type ActiveView = 
  | 'dashboard'
  | 'products'
  | 'new_product'
  | 'brands'
  | 'categories'
  | 'units'
  | 'bulk_upload'
  | 'purchases'
  | 'create_purchase'
  | 'purchase_returns'
  | 'sales'
  | 'new_sale'
  | 'sale_with_vat'
  | 'pos_sale'
  | 'invoice_view'
  | 'customers'
  | 'suppliers'
  | 'barcode_scanner'
  | 'barcode_generator'
  | 'reports'
  | 'settings';
