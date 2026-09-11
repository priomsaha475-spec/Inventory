import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { InvoiceCopyType } from '../../types';
import { CustomerInvoiceSheet } from './CustomerInvoiceSheet';
import { OfficeInvoiceSheet } from './OfficeInvoiceSheet';
import {
  Printer,
  Download,
  ArrowLeft,
  FileText,
  Settings,
  Loader2,
  User,
  ShieldAlert,
  Copy,
  Layers,
  Sparkles,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export const InvoiceView: React.FC = () => {
  const {
    currentInvoice,
    sales,
    setActiveView,
    shopSettings,
    language,
    showToast,
    purchases,
    products,
    suppliers,
  } = useInventory();

  const [copyType, setCopyType] = useState<InvoiceCopyType>('customer');
  const [isDownloading, setIsDownloading] = useState(false);

  // If no current invoice is set, fallback to the latest sale or a demo one
  const invoice = currentInvoice || sales[0];

  if (!invoice) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 max-w-md mx-auto my-12">
        <p className="text-slate-500 text-sm">
          {language === 'bn' ? 'কোনো চালান নির্বাচিত হয়নি।' : 'No invoice selected.'}
        </p>
        <button
          onClick={() => setActiveView('new_sale')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
        >
          {language === 'bn' ? 'নতুন বিক্রয় করুন' : 'Create New Sale'}
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('invoice-printable-sheet');
    if (!element) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const totalImgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = totalImgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight);
      heightLeft -= pageHeight;

      // Handle multi-page (e.g. if 'both' copies are selected and exceed 1 page)
      while (heightLeft > 0) {
        position = heightLeft - totalImgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight);
        heightLeft -= pageHeight;
      }

      const copyLabel =
        copyType === 'customer'
          ? 'Customer'
          : copyType === 'office'
          ? 'Office'
          : 'BothCopies';

      const fileName = `Invoice_${copyLabel}_${invoice.invoiceNo}.pdf`;
      pdf.save(fileName);

      showToast(
        language === 'bn'
          ? `চালান ${invoice.invoiceNo} (${copyType === 'customer' ? 'গ্রাহক কপি' : copyType === 'office' ? 'অফিস কপি' : 'উভয় কপি'}) ডাউনলোড সম্পন্ন হয়েছে!`
          : `Invoice ${invoice.invoiceNo} (${copyLabel} Copy) downloaded successfully!`
      );
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast(
        language === 'bn'
          ? 'PDF প্রস্তুত করতে প্রিন্ট উইন্ডো খোলা হচ্ছে...'
          : 'Opening Print dialog to save as PDF...',
        'info'
      );
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div id="invoice-page-container" className="space-y-4 pb-12">
      {/* Top Action & Copy Type Controls (hidden in print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {/* Row 1: Back links & Print/Download */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView('new_sale')}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নতুন বিক্রয়' : 'New Sale'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('sales')}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'চালান তালিকা' : 'Sale List'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('settings')}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Update Shop Name, Logo & Contact Info"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'bn' ? 'দোকানের সেটিংস' : 'Shop Settings'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Download PDF Button */}
            <button
              type="button"
              id="btn-download-pdf-top"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-4 py-2 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <Download className="w-4 h-4 text-emerald-600" />
              )}
              <span>
                {language === 'bn'
                  ? `ডাউনলোড (${copyType === 'customer' ? 'গ্রাহক' : copyType === 'office' ? 'অফিস' : 'উভয়'} PDF)`
                  : `Download PDF (${copyType})`}
              </span>
            </button>

            {/* Print Invoice Button */}
            <button
              type="button"
              id="btn-print-invoice"
              onClick={handlePrint}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>
                {language === 'bn'
                  ? `প্রিন্ট করুন (${copyType === 'customer' ? 'গ্রাহক' : copyType === 'office' ? 'অফিস' : 'উভয়'})`
                  : `Print (${copyType})`}
              </span>
            </button>
          </div>
        </div>

        {/* Row 2: Segmented Copy Type Selector (Customer Copy vs Office Copy vs Both) */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Copy className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'চালানের কপি নির্বাচন করুন:' : 'Select Invoice Copy Type:'}</span>
          </div>

          {/* Copy Selector Tabs */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            {/* Customer Copy Tab */}
            <button
              type="button"
              onClick={() => setCopyType('customer')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                copyType === 'customer'
                  ? 'bg-white text-emerald-800 shadow-xs border border-emerald-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'bn' ? 'গ্রাহক কপি (Customer Copy)' : 'Customer Copy'}</span>
            </button>

            {/* Office Copy Tab */}
            <button
              type="button"
              onClick={() => setCopyType('office')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                copyType === 'office'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {language === 'bn'
                  ? 'অফিস কপি (Office Copy / প্রফিট ও সাপ্লায়ার SL)'
                  : 'Office Copy (Supplier SL & Profit)'}
              </span>
            </button>

            {/* Both Copies Tab */}
            <button
              type="button"
              onClick={() => setCopyType('both')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                copyType === 'both'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'উভয় কপি (Both Copies)' : 'Both Copies'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Paper Canvas (Captured for PDF and Printed) */}
      <div className="flex justify-center">
        <div
          id="invoice-printable-sheet"
          className="bg-white w-full max-w-[850px] p-8 sm:p-10 border border-slate-200 shadow-md text-slate-800 font-sans text-xs print:p-0 print:border-none print:shadow-none"
        >
          {/* Render based on copyType */}
          {copyType === 'customer' && (
            <CustomerInvoiceSheet
              invoice={invoice}
              shopSettings={shopSettings}
              language={language}
            />
          )}

          {copyType === 'office' && (
            <OfficeInvoiceSheet
              invoice={invoice}
              shopSettings={shopSettings}
              language={language}
              purchases={purchases}
              products={products}
              suppliers={suppliers}
            />
          )}

          {copyType === 'both' && (
            <div className="space-y-10">
              {/* Customer Copy Section */}
              <div>
                <CustomerInvoiceSheet
                  invoice={invoice}
                  shopSettings={shopSettings}
                  language={language}
                />
              </div>

              {/* Page Break / Boundary between copies */}
              <div className="page-break my-8 border-t-2 border-dashed border-slate-300 print:my-0 print:border-none">
                <div className="no-print py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                  <span>--- {language === 'bn' ? 'পরবর্তী পাতা: অফিস কপি' : 'Next Page: Office Copy'} ---</span>
                </div>
              </div>

              {/* Office Copy Section */}
              <div>
                <OfficeInvoiceSheet
                  invoice={invoice}
                  shopSettings={shopSettings}
                  language={language}
                  purchases={purchases}
                  products={products}
                  suppliers={suppliers}
                />
              </div>
            </div>
          )}

          {/* Bottom Action Controls (hidden in print) */}
          <div className="no-print mt-8 pt-4 border-t border-slate-100 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              id="btn-download-pdf-bottom"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-5 py-2.5 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <Download className="w-4 h-4 text-emerald-600" />
              )}
              <span>
                {language === 'bn'
                  ? `ডাউনলোড (${copyType === 'customer' ? 'গ্রাহক কপি' : copyType === 'office' ? 'অফিস কপি' : 'উভয় কপি'})`
                  : `Download PDF (${copyType})`}
              </span>
            </button>

            <button
              type="button"
              id="btn-print-invoice-bottom"
              onClick={handlePrint}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>
                {language === 'bn'
                  ? `প্রিন্ট করুন (${copyType === 'customer' ? 'গ্রাহক কপি' : copyType === 'office' ? 'অফিস কপি' : 'উভয় কপি'})`
                  : `Print (${copyType})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
