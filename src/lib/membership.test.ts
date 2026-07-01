import { describe, it, expect } from 'vitest';
import { isExpiryValid, countClassesBookedThisWeek, classesRemaining, trialDaysRemaining, UNLIMITED_CLASSES_PER_WEEK } from './membership';

describe('isExpiryValid', () => {
  const now = new Date('2026-06-15T12:00:00Z');

  it('is false for empty/null/undefined', () => {
    expect(isExpiryValid('', now)).toBe(false);
    expect(isExpiryValid(null, now)).toBe(false);
    expect(isExpiryValid(undefined, now)).toBe(false);
  });

  it('is true for a future date and false for a past one', () => {
    expect(isExpiryValid('2026-12-31', now)).toBe(true);
    expect(isExpiryValid('2026-01-01', now)).toBe(false);
  });
});

describe('classesRemaining', () => {
  const now = new Date('2026-06-15T12:00:00Z');

  it('is 0 when the membership is expired (credits are handled separately)', () => {
    expect(classesRemaining('2026-01-01', 3, 0, now)).toBe(0);
  });

  it('is 0 when there is no membership type', () => {
    expect(classesRemaining('2026-12-31', null, 0, now)).toBe(0);
  });

  it('subtracts booked classes from the weekly allowance when active', () => {
    expect(classesRemaining('2026-12-31', 3, 1, now)).toBe(2);
    expect(classesRemaining('2026-12-31', 2, 2, now)).toBe(0);
  });

  it('is Infinity for the unlimited tier when active', () => {
    expect(classesRemaining('2026-12-31', UNLIMITED_CLASSES_PER_WEEK, 5, now)).toBe(Infinity);
  });

  it('is still 0 for the unlimited tier when expired', () => {
    expect(classesRemaining('2026-01-01', UNLIMITED_CLASSES_PER_WEEK, 0, now)).toBe(0);
  });
});

describe('trialDaysRemaining', () => {
  const now = new Date('2026-06-15T00:00:00Z');

  it('returns null when the member is not on a trial', () => {
    expect(trialDaysRemaining('2x/week', '2026-06-20', now)).toBeNull();
  });

  it('counts days left on a trial and floors at 0', () => {
    expect(trialDaysRemaining('trial', '2026-06-20T00:00:00Z', now)).toBe(5);
    expect(trialDaysRemaining('trial', '2026-06-10T00:00:00Z', now)).toBe(0);
  });
});

describe('countClassesBookedThisWeek', () => {
  // Wednesday, 2026-06-17 (local noon keeps the weekday stable across zones)
  const now = new Date('2026-06-17T12:00:00');

  it("counts only this member's signups whose next occurrence is in the current week", () => {
    const classes = [
      { day: 'Friday', signups: ['m1'] },   // Fri 6/19 — this week
      { day: 'Monday', signups: ['m1'] },   // next Monday 6/22 — out of window
      { day: 'Thursday', signups: ['m2'] }, // other member
    ];
    expect(countClassesBookedThisWeek(classes, 'm1', now)).toBe(1);
  });

  it('is 0 for a member with no signups', () => {
    expect(countClassesBookedThisWeek([{ day: 'Friday', signups: ['x'] }], 'm1', now)).toBe(0);
  });
});
