// Pure pricing/date math extracted from AppState so it can be unit-tested.

/**
 * Total price of a session pack from its breakdown.
 * total = sessions × pricePerSession, plus an optional sales-tax rate (%),
 * rounded to cents.
 */
export function calcSessionPackTotal(
  sessions: number,
  pricePerSession: number,
  taxRate: number | null,
): number {
  const subtotal = sessions * pricePerSession;
  const total = taxRate != null ? subtotal * (1 + taxRate / 100) : subtotal;
  return Math.round(total * 100) / 100;
}

/**
 * New membership expiry (YYYY-MM-DD) when a payment is recorded. Extends from
 * the later of the payment date and the current expiry, by durationDays if the
 * tier defines one, otherwise by one calendar month. Uses noon to avoid DST/
 * timezone edge cases shifting the date.
 */
export function calcNewMembershipExpiry(
  paymentDate: string,
  currentExpiry: string | null | undefined,
  durationDays?: number,
): string {
  const base = new Date(Math.max(
    new Date(paymentDate + 'T12:00:00').getTime(),
    new Date((currentExpiry || paymentDate) + 'T12:00:00').getTime(),
  ));
  if (durationDays) base.setDate(base.getDate() + durationDays);
  else base.setMonth(base.getMonth() + 1);
  return base.toISOString().split('T')[0];
}
