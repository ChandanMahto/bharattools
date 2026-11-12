import { calculateGst } from './gst';

describe('calculateGst', () => {
  it('adds 18% GST and splits intra-state tax equally', () => {
    const result = calculateGst(1000, 18, 'exclusive', 'intra-state');
    expect(result.taxableValue).toBe(1000);
    expect(result.gstAmount).toBe(180);
    expect(result.cgst).toBe(90);
    expect(result.sgst).toBe(90);
    expect(result.totalAmount).toBe(1180);
  });

  it('extracts GST from an inclusive amount', () => {
    const result = calculateGst(1180, 18, 'inclusive', 'inter-state');
    expect(result.taxableValue).toBe(1000);
    expect(result.igst).toBe(180);
  });

  it('rejects negative amounts', () => {
    expect(() => calculateGst(-1, 18, 'exclusive', 'intra-state')).toThrow();
  });
});
