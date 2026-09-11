/**
 * Helper to convert numeric monetary amounts to English words
 * e.g., 860 => "Eight Hundred Sixty Taka Only"
 */
const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertGroup(num: number): string {
  let s = '';
  if (num >= 100) {
    s += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num >= 20) {
    s += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  if (num > 0) {
    s += ones[num] + ' ';
  }
  return s.trim();
}

export function numberToWords(amount: number): string {
  const integerPart = Math.floor(Math.abs(amount));
  if (integerPart === 0) return 'Zero Taka Only';

  let remaining = integerPart;
  let words = '';

  // Billions / Crores (South Asian / International hybrid)
  if (remaining >= 10000000) {
    const crore = Math.floor(remaining / 10000000);
    words += convertGroup(crore) + ' Crore ';
    remaining %= 10000000;
  }

  // Lakhs (100,000)
  if (remaining >= 100000) {
    const lakh = Math.floor(remaining / 100000);
    words += convertGroup(lakh) + ' Lakh ';
    remaining %= 100000;
  }

  // Thousands
  if (remaining >= 1000) {
    const thousand = Math.floor(remaining / 1000);
    words += convertGroup(thousand) + ' Thousand ';
    remaining %= 1000;
  }

  // Hundreds & units
  if (remaining > 0) {
    words += convertGroup(remaining) + ' ';
  }

  return `${words.trim()} Taka Only`;
}
