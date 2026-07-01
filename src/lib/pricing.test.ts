import { describe, it, expect } from 'vitest';
import { calcSessionPackTotal, calcNewMembershipExpiry } from './pricing';

describe('calcSessionPackTotal', () => {
  it('multiplies sessions by price with no tax', () => {
    expect(calcSessionPackTotal(10, 25, null)).toBe(250);
  });

  it('applies a sales-tax rate and rounds to cents', () => {
    expect(calcSessionPackTotal(10, 25, 8.25)).toBe(270.63);
  });

  it('rounds to cents', () => {
    expect(calcSessionPackTotal(3, 33.33, null)).toBe(99.99);
  });

  it('treats null tax the same as zero', () => {
    expect(calcSessionPackTotal(5, 20, null)).toBe(calcSessionPackTotal(5, 20, 0));
  });
});

describe('calcNewMembershipExpiry', () => {
  it('adds one month when no durationDays is given', () => {
    expect(calcNewMembershipExpiry('2026-01-15', null)).toBe('2026-02-15');
  });

  it('adds durationDays when provided', () => {
    expect(calcNewMembershipExpiry('2026-01-01', null, 30)).toBe('2026-01-31');
  });

  it('extends from the current expiry when it is later than the payment date', () => {
    expect(calcNewMembershipExpiry('2026-01-01', '2026-06-01')).toBe('2026-07-01');
  });

  it('extends from the payment date when the expiry is already in the past', () => {
    expect(calcNewMembershipExpiry('2026-03-10', '2025-01-01', 30)).toBe('2026-04-09');
  });

  it('accepts end-of-month drift for +1 month (decision: Jan 31 → Mar 3, not clamped)', () => {
    // "+1 month" on the 31st overflows a short month. This drift is intentional
    // and accepted; renewal dates may creep forward a couple of days.
    expect(calcNewMembershipExpiry('2026-01-31', null)).toBe('2026-03-03');
  });
});
