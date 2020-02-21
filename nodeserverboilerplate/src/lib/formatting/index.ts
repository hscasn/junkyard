/**
 * Miscellaneous functions for formatting
 */

export function toFormattedNumber(v: number, decimals?: number): string {
  if (!decimals) {
    if (v % 1 === 0) {
      decimals = 0;
    } else {
      decimals = 2;
    }
  }
  return v.toLocaleString('en', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
