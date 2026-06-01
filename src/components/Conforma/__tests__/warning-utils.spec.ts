import { computeWarningFields } from '../warning-utils';

describe('computeWarningFields', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-01T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns expiring-exception when effective_until is in the future', () => {
    const result = computeWarningFields(undefined, '2026-06-21T00:00:00Z');
    expect(result).toEqual({
      daysUntilEvent: 20,
      warningType: 'expiring-exception',
      effectiveUntil: '2026-06-21T00:00:00Z',
    });
  });

  it('returns upcoming-activation when effective_on is in the future', () => {
    const result = computeWarningFields('2026-06-11T00:00:00Z');
    expect(result).toEqual({
      daysUntilEvent: 10,
      warningType: 'upcoming-activation',
    });
  });

  it('returns empty object when effective_until is in the past', () => {
    const result = computeWarningFields(undefined, '2026-05-01T00:00:00Z');
    expect(result).toEqual({});
  });

  it('returns empty object when effective_on is in the past', () => {
    const result = computeWarningFields('2026-05-01T00:00:00Z');
    expect(result).toEqual({});
  });

  it('prioritizes effective_until over effective_on when both are future dates', () => {
    const result = computeWarningFields('2026-06-15T00:00:00Z', '2026-06-21T00:00:00Z');
    expect(result.warningType).toEqual('expiring-exception');
    expect(result.daysUntilEvent).toEqual(20);
  });

  it('falls back to effective_on when effective_until is in the past', () => {
    const result = computeWarningFields('2026-06-11T00:00:00Z', '2026-05-01T00:00:00Z');
    expect(result.warningType).toEqual('upcoming-activation');
    expect(result.daysUntilEvent).toEqual(10);
  });

  it('returns empty object when both are undefined', () => {
    expect(computeWarningFields()).toEqual({});
  });

  it('returns 0 days when event is today', () => {
    const result = computeWarningFields('2026-06-01T23:59:59Z');
    expect(result.daysUntilEvent).toEqual(0);
    expect(result.warningType).toEqual('upcoming-activation');
  });

  it('handles invalid date strings gracefully', () => {
    expect(computeWarningFields('not-a-date')).toEqual({});
    expect(computeWarningFields(undefined, 'invalid')).toEqual({});
  });
});
