export function percentageOf(value: number, percent: number): number {
  assertFinite(value, 'Value');
  assertFinite(percent, 'Percentage');
  return round2((value * percent) / 100);
}

export function percentageChange(from: number, to: number): number {
  assertFinite(from, 'Starting value');
  assertFinite(to, 'Ending value');
  if (from === 0) throw new RangeError('Starting value cannot be zero.');
  return round2(((to - from) / Math.abs(from)) * 100);
}

export function whatPercentIs(part: number, whole: number): number {
  assertFinite(part, 'Part');
  assertFinite(whole, 'Whole');
  if (whole === 0) throw new RangeError('Whole cannot be zero.');
  return round2((part / whole) * 100);
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new RangeError(`${label} must be a valid number.`);
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
