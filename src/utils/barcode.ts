import JsBarcode from 'jsbarcode';

/**
 * Render barcode into an SVG or Canvas element
 */
export function renderBarcode(
  element: SVGSVGElement | HTMLCanvasElement,
  value: string,
  options?: {
    format?: 'CODE128' | 'EAN13' | 'UPC' | 'EAN8';
    width?: number;
    height?: number;
    displayValue?: boolean;
    fontSize?: number;
    textMargin?: number;
    lineColor?: string;
  }
) {
  if (!element || !value) return;

  try {
    JsBarcode(element, value, {
      format: options?.format || 'CODE128',
      width: options?.width || 2,
      height: options?.height || 50,
      displayValue: options?.displayValue ?? true,
      fontSize: options?.fontSize || 14,
      font: 'monospace',
      lineColor: options?.lineColor || '#111827',
      margin: 4,
      valid: () => true,
    });
  } catch (err) {
    // If standard format fails due to invalid characters for strict EAN13, fallback to generic CODE128
    try {
      JsBarcode(element, value, {
        format: 'CODE128',
        width: options?.width || 1.8,
        height: options?.height || 45,
        displayValue: options?.displayValue ?? true,
        fontSize: options?.fontSize || 12,
        margin: 4,
      });
    } catch {
      // Ignored
    }
  }
}

/**
 * Generate a random 6 to 12 digit retail barcode
 */
export function generateRandomBarcode(prefix: string = '01'): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${digits}`;
}
