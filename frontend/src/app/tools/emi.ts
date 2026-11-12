export interface EmiResult {
  monthlyEmi: number;
  totalPayment: number;
  totalInterest: number;
}

/** Monthly reducing-balance EMI using an annual nominal interest rate. */
export function calculateEmi(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number,
): EmiResult {
  if (!Number.isFinite(principal) || principal <= 0)
    throw new RangeError('Loan amount must be greater than zero.');
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0)
    throw new RangeError('Interest rate cannot be negative.');
  if (!Number.isInteger(tenureMonths) || tenureMonths <= 0)
    throw new RangeError('Tenure must be a positive whole number of months.');

  const monthlyRate = annualRatePercent / 12 / 100;
  const monthlyEmi =
    monthlyRate === 0
      ? principal / tenureMonths
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  const totalPayment = monthlyEmi * tenureMonths;
  return {
    monthlyEmi: round2(monthlyEmi),
    totalPayment: round2(totalPayment),
    totalInterest: round2(totalPayment - principal),
  };
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
