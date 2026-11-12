export const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export const NUMBER_FORMATTER = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
});

export function formatINR(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return INR_FORMATTER.format(value);
}

export function formatIndianNumber(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return NUMBER_FORMATTER.format(value);
}
