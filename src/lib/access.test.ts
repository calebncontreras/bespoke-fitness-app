import { describe, it, expect } from 'vitest';
import { allDocsApproved, resolveAccessView } from './access';

describe('allDocsApproved', () => {
  it('is true when there are no required docs', () => {
    expect(allDocsApproved([], [1, 2])).toBe(true);
  });

  it('is true when every required doc is approved', () => {
    expect(allDocsApproved([1, 2], [1, 2, 3])).toBe(true);
  });

  it('is false when a required doc is not approved', () => {
    expect(allDocsApproved([1, 2], [1])).toBe(false);
  });
});

describe('resolveAccessView', () => {
  const now = new Date('2026-06-15T12:00:00Z');
  // expired membership, trial used, no credits
  const base = { docsApproved: true, trialUsed: true, membershipExpiry: '2026-01-01', classCredits: 0, now };

  it('gates on documents before anything else', () => {
    expect(resolveAccessView({ ...base, docsApproved: false })).toBe('awaitingApproval');
  });

  it('allows booking with an active membership', () => {
    expect(resolveAccessView({ ...base, membershipExpiry: '2026-12-31' })).toBe('booking');
  });

  it('allows booking when the trial is unused', () => {
    expect(resolveAccessView({ ...base, trialUsed: false })).toBe('booking');
  });

  it('allows booking when credits remain even though the membership expired', () => {
    expect(resolveAccessView({ ...base, classCredits: 3 })).toBe('booking');
  });

  it('requires payment when expired, trial used, and no credits', () => {
    expect(resolveAccessView(base)).toBe('paymentRequired');
  });
});
