// Pure access-gating logic shared by handleAuthUser and checkAccessStatus.
import { isExpiryValid } from './membership';

export type AccessView = 'awaitingApproval' | 'booking' | 'paymentRequired';

/** True when every required document has an approved submission. */
export function allDocsApproved(requiredDocIds: number[], approvedDocIds: number[]): boolean {
  if (requiredDocIds.length === 0) return true;
  return requiredDocIds.every(id => approvedDocIds.includes(id));
}

/**
 * Which screen a member lands on:
 *  - unapproved docs → awaitingApproval
 *  - active membership, unused trial, OR remaining class credits → booking
 *  - otherwise (expired + trial used + no credits) → paymentRequired
 */
export function resolveAccessView(params: {
  docsApproved: boolean;
  trialUsed: boolean;
  membershipExpiry: string | null | undefined;
  classCredits: number;
  now?: Date;
}): AccessView {
  const { docsApproved, trialUsed, membershipExpiry, classCredits, now = new Date() } = params;
  if (!docsApproved) return 'awaitingApproval';
  if (!trialUsed || isExpiryValid(membershipExpiry, now) || classCredits > 0) return 'booking';
  return 'paymentRequired';
}
