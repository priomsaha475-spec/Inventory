import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { ShopSettings } from '../../types';
import { GoogleDriveBackup } from './GoogleDriveBackup';
import {
  Store,
  Save,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Eye,
  Sparkles
} from 'lucide-react';

export const ShopSettingsView: React.FC = () => {
  const { shopSettings, updateShopSettings, language, setActiveView } = useInventory();

  const [formData, setFormData] = useState<ShopSettings>({
    shopName: shopSettings.shopName || '',
    shopNameBn: shopSettings.shopNameBn || '',
    tagline: shopSettings.tagline || '',
    logoText: shopSettings.logoText || 'OKY',
    logoUrl: shopSettings.logoUrl || '',
    address: shopSettings.address || '',
    mobile: shopSettings.mobile || '',
    email: shopSettings.email || '',
    supportPhone: shopSettings.supportPhone || '',
    termsAndConditions: shopSettings.termsAndConditions || '',
  });

  const [logoMode, setLogoMode] = useState<'text' | 'image'>(
    shopSettings.logoUrl ? 'image' : 'text'
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData((prev) => ({ ...prev, logoUrl: result }));
        setLogoMode('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateShopSettings({
      ...formData,
      logoUrl: logoMode === 'image' ? formData.logoUrl : '',
    });
  };

  const handleResetDefaults = () => {
    const defaults: ShopSettings = {
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
    setFormData(defaults);
    setLogoMode('text');
    updateShopSettings(defaults);
  };

  return (
    <div id="shop-settings-view" className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Store className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {language === 'bn' ? 'দোকান ও চালান সেটিংস' : 'Shop & Invoice Settings'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'bn'
                  ? 'দোকানের নাম, লোগো, ঠিকানা, ফোন ও চালানের বিবরণ এখান থেকে পরিবর্তন করুন।'
                  : 'Customize your shop name, logo, address, contact information, and invoice footer.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('invoice_view')}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'চালান প্রিভিউ' : 'View Invoice'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Settings (7 cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSave} className="space-y-5">
            {/* Shop Identity Section */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'দোকানের পরিচিতি ও লোগো' : 'Shop Identity & Logo'}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {language === 'bn' ? 'দোকানের নাম (English)' : 'Shop Name (English)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    placeholder="e.g. Supper Shop"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {language === 'bn' ? 'দোকানের নাম (বাংলা)' : 'Shop Name (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.shopNameBn || ''}
                    onChange={(e) => setFormData({ ...formData, shopNameBn: e.target.value })}
                    placeholder="যেমনঃ সুপার শপ"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Logo Settings */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  {language === 'bn' ? 'লোগোর ধরন (Logo Style)' : 'Logo Style'}
                </label>
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setLogoMode('text')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      logoMode === 'text'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'টেক্সট লোগো ব্যাজ (যেমন OKY)' : 'Text Badge Logo (e.g. OKY)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoMode('image')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      logoMode === 'image'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ইমেজ / ছবি লোগো' : 'Custom Image / Photo'}</span>
                  </button>
                </div>

                {logoMode === 'text' ? (
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      {language === 'bn' ? 'লোগোর টেক্সট' : 'Logo Text / Initials'}
                    </label>
                    <input
                      type="text"
                      value={formData.logoText}
                      onChange={(e) => setFormData({ ...formData, logoText: e.target.value })}
                      placeholder="e.g. OKY"
                      className="w-full sm:w-1/2 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-600">
                        {language === 'bn' ? 'লোগো ইমেজ লিঙ্ক (URL)' : 'Logo Image URL'}
                      </label>
                      <input
                        type="url"
                        value={formData.logoUrl || ''}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        {language === 'bn' ? 'অথবা কম্পিউটার থেকে লোগো আপলোড করুন' : 'Or upload image from device'}
                      </label>
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'ফাইল বাছাই করুন' : 'Choose File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact & Location Section */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'যোগাযোগ ও ঠিকানা' : 'Contact & Address'}</span>
              </h2>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {language === 'bn' ? 'দোকানের ঠিকানা' : 'Shop Address'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Chuadanga, Bangladesh"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="e.g. 01401371860"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{language === 'bn' ? 'ইমেইল' : 'Email Address'}</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. hamidbd2310@gmail.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {language === 'bn' ? 'কাস্টমার সাপোর্ট হটলাইন' : 'Customer Support Hotline'}
                </label>
                <input
                  type="text"
                  value={formData.supportPhone || ''}
                  onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                  placeholder="e.g. 096 3838 0101"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Terms & Footer Note Section */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'চালানের ফুটনোট ও শর্তাবলী' : 'Invoice Footer Note & Terms'}</span>
              </h2>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {language === 'bn' ? 'চালানের নিচের বিশেষ দ্রষ্টব্য / শর্ত' : 'Terms & Conditions Note'}
                </label>
                <textarea
                  rows={3}
                  value={formData.termsAndConditions || ''}
                  onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                  placeholder="যেমনঃ বিঃ দ্রঃ বিক্রিত পণ্য ফেরতযোগ্য নহে। যেকোনো প্রয়োজনে ক্যাশ মেমো সাথে রাখুন।"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-400">
                  {language === 'bn'
                    ? 'এই লেখাটি চালানের রশিদের নিচে পরিচ্ছন্নভাবে মুদ্রিত হবে।'
                    : 'This note will appear cleanly at the bottom of customer invoices.'}
                </p>
              </div>
            </div>

            {/* Submit & Reset buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ডিফল্ট রিসেট' : 'Reset Defaults'}</span>
              </button>

              <button
                type="submit"
                id="btn-save-shop-settings"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {language === 'bn' ? 'চালানের লাইভ প্রিভিউ' : 'Live Invoice Header Preview'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Real-time</span>
            </div>

            {/* Mini Invoice Header Preview Sheet */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-2">
              {/* Logo Rendering */}
              {logoMode === 'image' && formData.logoUrl ? (
                <div className="flex justify-center mb-2">
                  <img
                    src={formData.logoUrl}
                    alt="Shop Logo"
                    className="h-12 max-w-[150px] object-contain"
                  />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center bg-red-600 text-white font-extrabold text-sm tracking-wider px-5 py-1 rounded-full shadow-2xs mb-1">
                  {formData.logoText || 'OKY'}
                </div>
              )}

              {/* Shop Title */}
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
                {formData.shopName || 'Supper Shop'}
              </h3>
              {formData.shopNameBn && (
                <p className="text-xs font-medium text-slate-600">{formData.shopNameBn}</p>
              )}

              {/* Address & Contact Details */}
              <div className="text-xs text-slate-600 space-y-0.5 font-medium pt-1">
                <p>{formData.address || 'Chuadanga'}</p>
                <p className="font-mono">{formData.mobile || '01401371860'}</p>
                {formData.email && <p className="text-[11px]">{formData.email}</p>}
                {formData.supportPhone && (
                  <p className="text-[11px] text-emerald-700">
                    Hotline: <strong className="font-mono">{formData.supportPhone}</strong>
                  </p>
                )}
              </div>

              {/* Mini Sample Terms */}
              {formData.termsAndConditions && (
                <div className="mt-4 pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500 italic">
                  "{formData.termsAndConditions}"
                </div>
              )}
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'bn' ? 'স্বয়ংক্রিয় আপডেট' : 'Instant Synchronization'}</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                {language === 'bn'
                  ? 'এখানে পরিবর্তন সেভ করলে সকল বিক্রয় চালান (Print & Download) এ নতুন নাম, লোগো এবং ঠিকানা স্বয়ংক্রিয়ভাবে কার্যকর হবে।'
                  : 'Updating here immediately applies to all invoice prints and PDF downloads across the entire system.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Drive Integration Section */}
      <GoogleDriveBackup />
    </div>
  );
};
