export type GstSupplyType = 'intra-state' | 'inter-state';
export type GstMode = 'exclusive' | 'inclusive';

export interface GstResult {
  taxableValue: number;
  gstAmount: number;
  totalAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
}

/**
 * GST helper for a user-selected rate.
 * Intra-state supplies split the tax equally into CGST and SGST.
 * Inter-state supplies apply the full tax as IGST.
 * This helper does not decide place-of-supply or applicable GST rate.
 */
export function calculateGst(
  amount: number,
  ratePercent: number,
  mode: GstMode,
  supplyType: GstSupplyType,
): GstResult {
  if (!Number.isFinite(amount) || amount < 0)
    throw new RangeError('Amount must be zero or greater.');
  if (!Number.isFinite(ratePercent) || ratePercent < 0 || ratePercent > 100) {
    throw new RangeError('GST rate must be between 0 and 100.');
  }

  const factor = ratePercent / 100;
  const taxableValue = mode === 'inclusive' ? amount / (1 + factor) : amount;
  const gstAmount = mode === 'inclusive' ? amount - taxableValue : amount * factor;
  const roundedTaxable = round2(taxableValue);
  const roundedGst = round2(gstAmount);
  const cgst = supplyType === 'intra-state' ? round2(roundedGst / 2) : 0;
  const sgst = supplyType === 'intra-state' ? round2(roundedGst - cgst) : 0;
  const igst = supplyType === 'inter-state' ? roundedGst : 0;

  return {
    taxableValue: roundedTaxable,
    gstAmount: roundedGst,
    totalAmount: round2(roundedTaxable + roundedGst),
    cgst,
    sgst,
    igst,
  };
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
