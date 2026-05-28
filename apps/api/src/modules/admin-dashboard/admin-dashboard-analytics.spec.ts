import {
  buildDistribution,
  calculateTrendPercent,
  riskLevelFromTrustScore,
} from './admin-dashboard-analytics';

describe('admin dashboard analytics', () => {
  it('classifies low trust scores as higher operational risk', () => {
    expect(riskLevelFromTrustScore(12)).toBe('critical');
    expect(riskLevelFromTrustScore(39)).toBe('high');
    expect(riskLevelFromTrustScore(56)).toBe('medium');
    expect(riskLevelFromTrustScore(92)).toBe('low');
  });

  it('calculates stable percentage trends for metric cards', () => {
    expect(calculateTrendPercent(125, 100)).toBe(25);
    expect(calculateTrendPercent(100, 125)).toBe(-20);
    expect(calculateTrendPercent(0, 0)).toBe(0);
    expect(calculateTrendPercent(24, 0)).toBe(100);
  });

  it('builds distribution segments with counts and percentages', () => {
    const distribution = buildDistribution([
      'critical',
      'high',
      'medium',
      'medium',
      'low',
      'unknown',
    ]);

    expect(distribution).toEqual([
      expect.objectContaining({ label: 'Critical', count: 1, percent: 16.7 }),
      expect.objectContaining({ label: 'High', count: 1, percent: 16.7 }),
      expect.objectContaining({ label: 'Medium', count: 2, percent: 33.3 }),
      expect.objectContaining({ label: 'Low', count: 1, percent: 16.7 }),
      expect.objectContaining({ label: 'Unknown', count: 1, percent: 16.7 }),
    ]);
  });
});
