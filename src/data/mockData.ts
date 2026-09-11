import { Brand, Category, Customer, Product, PurchaseInvoice, SaleInvoice, Supplier } from '../types';

export const INITIAL_BRANDS: Brand[] = [];

export const INITIAL_CATEGORIES: Category[] = [];

export const INITIAL_UNITS = [
  { id: 'u1', name: 'Pcs', symbol: 'pcs' },
  { id: 'u2', name: 'Blister', symbol: 'blister' },
  { id: 'u3', name: 'Packet', symbol: 'pkt' },
  { id: 'u4', name: 'Kg', symbol: 'kg' },
  { id: 'u5', name: 'Bottle', symbol: 'btl' },
  { id: 'u6', name: 'Box', symbol: 'box' },
  { id: 'u7', name: 'Feet', symbol: 'ft' },
];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c-walk',
    name: 'Walking Customer',
    nameBn: 'সাধারণ ক্রেতা (ক্যাশ)',
    mobile: '01700000000',
    address: 'Counter / Cash',
    openingBalance: 0,
    currentBalance: 0,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_SUPPLIERS: Supplier[] = [];

export const INITIAL_SALES: SaleInvoice[] = [];

export const INITIAL_PURCHASES: PurchaseInvoice[] = [];
