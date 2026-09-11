import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Users, Truck, Plus, Search, Phone, Mail, MapPin, FileText, Check } from 'lucide-react';

interface CustomerSupplierViewProps {
  initialType?: 'customers' | 'suppliers';
}

export const CustomerSupplierView: React.FC<CustomerSupplierViewProps> = ({ initialType = 'customers' }) => {
  const {
    customers,
    addCustomer,
    suppliers,
    addSupplier,
    language,
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>(initialType);
  const [search, setSearch] = useState('');

  // Customer form fields (matching video 00:12)
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custBalance, setCustBalance] = useState<number>(0);

  // Supplier form fields (matching video 00:16)
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supMobile, setSupMobile] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supOpening, setSupOpening] = useState<number>(0);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custMobile.trim()) return;

    addCustomer({
      name: custName.trim(),
      mobile: custMobile.trim(),
      email: custEmail.trim() || undefined,
      address: custAddress.trim() || 'General',
      openingBalance: custBalance || 0,
    });

    setCustName('');
    setCustMobile('');
    setCustEmail('');
    setCustAddress('');
    setCustBalance(0);
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim() || !supMobile.trim()) return;

    addSupplier({
      name: supName.trim(),
      contactPerson: supContact.trim() || undefined,
      mobile: supMobile.trim(),
      email: supEmail.trim() || undefined,
      address: supAddress.trim() || 'General',
      openingBalance: supOpening || 0,
    });

    setSupName('');
    setSupContact('');
    setSupMobile('');
    setSupEmail('');
    setSupAddress('');
    setSupOpening(0);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile.includes(search) ||
      s.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="customer-supplier-view" className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {language === 'bn' ? 'কাস্টমার ও সরবরাহক ম্যানেজমেন্ট' : 'Customers & Wholesale Suppliers'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer directories, wholesale suppliers, credit ledgers, and contact accounts
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'customers'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            {language === 'bn' ? 'গ্রাহক (Customers)' : 'Customers'} ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'suppliers'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            {language === 'bn' ? 'সরবরাহক (Suppliers)' : 'Suppliers'} ({suppliers.length})
          </button>
        </div>
      </div>

      {/* Customer Tab Content */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          {/* Customer Add Form matching video 00:12 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 pb-3 mb-4 border-b border-slate-100">
              {language === 'bn' ? 'গ্রাহক যোগ করুন (Add Customer)' : 'Register New Customer'}
            </h2>
            <form onSubmit={handleAddCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'গ্রাহকের নাম *' : 'Customer Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'মোবাইল নং *' : 'Mobile Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={custMobile}
                    onChange={(e) => setCustMobile(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'ইমেইল' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="customer@email.com"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'ঠিকানা' : 'Address'}
                  </label>
                  <input
                    type="text"
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    placeholder="Area / Market"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  {language === 'bn' ? 'তৈরি করুন (Save)' : 'Register Customer'}
                </button>
              </div>
            </form>
          </div>

          {/* Customer Table matching video 00:13 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                {language === 'bn' ? 'গ্রাহকের তালিকা' : 'Customer Directory'} ({filteredCustomers.length})
              </h3>
              <div className="relative max-w-xs w-full text-xs">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customer..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'নাম ও ঠিকানা' : 'Customer Details'}</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'মোবাইল' : 'Mobile'}</th>
                    <th className="py-3 px-4 text-right">{language === 'bn' ? 'লেনদেন / ব্যালেন্স' : 'Balance'}</th>
                    <th className="py-3 px-4 text-center w-36">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{c.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {c.address}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {c.mobile}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        ৳{c.currentBalance.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100">
                            Ledger
                          </button>
                          <button className="px-2 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-200">
                            Report
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Tab Content */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          {/* Supplier Add Form matching video 00:16 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 pb-3 mb-4 border-b border-slate-100">
              {language === 'bn' ? 'নতুন সরবরাহকারী যোগ করুন' : 'Add Wholesale Supplier'}
            </h2>
            <form onSubmit={handleAddSupplier} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'সরবরাহকারীর নাম *' : 'Company / Supplier Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    placeholder="e.g. Radhuni / Akij"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'যোগাযোগকারী ব্যক্তি' : 'Contact Person'}
                  </label>
                  <input
                    type="text"
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    placeholder="e.g. Abdul Hamid"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'মোবাইল নং *' : 'Mobile Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={supMobile}
                    onChange={(e) => setSupMobile(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'ঠিকানা / ডিপো' : 'Address / Depot'}
                  </label>
                  <input
                    type="text"
                    value={supAddress}
                    onChange={(e) => setSupAddress(e.target.value)}
                    placeholder="e.g. Chuadanga Main Depot"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  {language === 'bn' ? 'তৈরি করুন (Save)' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>

          {/* Supplier Table matching video 00:17 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                {language === 'bn' ? 'সরবরাহকারীর তালিকা' : 'Supplier Directory'} ({filteredSuppliers.length})
              </h3>
              <div className="relative max-w-xs w-full text-xs">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search supplier..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'সরবরাহকারী ও ঠিকানা' : 'Supplier Details'}</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'মোবাইল' : 'Mobile'}</th>
                    <th className="py-3 px-4 text-right">{language === 'bn' ? 'প্রদেয় টাকা' : 'Payable'}</th>
                    <th className="py-3 px-4 text-center w-32">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSuppliers.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{s.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {s.address} {s.contactPerson ? `• (${s.contactPerson})` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {s.mobile}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        ৳{s.payable.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button className="px-3 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100">
                          {language === 'bn' ? 'লেনদেন' : 'Ledger'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
