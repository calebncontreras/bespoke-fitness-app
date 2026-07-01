// Pure membership/booking logic extracted from AppState for unit testing.

/** A membership is valid while its expiry date is strictly in the future. */
export function isExpiryValid(expiry: string | null | undefined, now: Date = new Date()): boolean {
  if (!expiry) return false;
  return new Date(expiry) > now;
}

const DAY_MAP: Record<string, number> = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0,
};

/** The next calendar date on which a weekly class (by day name) occurs. */
export function getNextClassDate(dayName: string, now: Date = new Date()): Date {
  const targetDay = DAY_MAP[dayName];
  const daysAhead = targetDay - now.getDay();
  const date = new Date(now);
  date.setDate(now.getDate() + (daysAhead > 0 ? daysAhead : daysAhead + 7));
  return date;
}

/** How many of the member's booked classes fall in the current (Mon–Sun) week. */
export function countClassesBookedThisWeek(
  classes: { day: string; signups: string[] }[],
  memberId: string,
  now: Date = new Date(),
): number {
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  const weekEnd = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
  return classes.filter(c => {
    if (!c.signups.includes(memberId)) return false;
    const classDate = getNextClassDate(c.day, now);
    return classDate >= startOfWeek && classDate < weekEnd;
  }).length;
}

/**
 * Free weekly classes remaining. An expired/unset membership grants none
 * (class credits are a separate currency handled at signup).
 */
export function classesRemaining(
  membershipExpiry: string | null | undefined,
  classesPerWeek: number | null,
  bookedThisWeek: number,
  now: Date = new Date(),
): number {
  if (!isExpiryValid(membershipExpiry, now)) return 0;
  if (classesPerWeek == null) return 0;
  return classesPerWeek - bookedThisWeek;
}

/** Days left on a trial membership, or null if the member isn't on a trial. */
export function trialDaysRemaining(
  membershipType: string,
  membershipExpiry: string,
  now: Date = new Date(),
): number | null {
  if (membershipType !== 'trial') return null;
  const daysLeft = Math.ceil((new Date(membershipExpiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return daysLeft > 0 ? daysLeft : 0;
}
