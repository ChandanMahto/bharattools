import { calculateEmi } from './emi';

describe('calculateEmi', () => {
  it('calculates a reducing-balance EMI', () => {
    const result = calculateEmi(100000, 12, 12);
    expect(result.monthlyEmi).toBe(8884.88);
    expect(result.totalPayment).toBe(106618.55);
  });

  it('handles zero interest', () => {
    expect(calculateEmi(12000, 0, 12).monthlyEmi).toBe(1000);
  });

  it('rejects invalid tenure', () => {
    expect(() => calculateEmi(10000, 8, 0)).toThrow();
  });
});
