export interface Member {
  id: number;
  name: string;
  email: string;
  membershipExpiry: string;
  membershipType: string;
  classCredits: number;
  googleCalendarEnabled: boolean;
}

export interface AdminUser {
  id: 'admin';
  name: string;
  role: 'admin';
}

export type CurrentUser = Member | AdminUser;

export interface Class {
  id: number;
  name: string;
  day: string;
  time: string;
  instructor: string;
  location: string;
  capacity: number;
  signups: number[];
}

export interface MembershipType {
  id: string;
  name: string;
  price: number;
  classesPerWeek: number;
  durationDays?: number;
}

export interface NewClassForm {
  name: string;
  day: string;
  time: string;
  instructor: string;
  location: string;
  capacity: number | string;
}

export interface NewMemberForm {
  name: string;
  email: string;
  membershipExpiry: string;
  membershipType: string;
  classCredits: number | string;
}

export interface NewMembershipTypeForm {
  name: string;
  price: string;
  classesPerWeek: string;
  durationDays: string;
}

export interface SignupForm {
  name: string;
  email: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  membershipType: string;
}

export type PaymentMethodType = 'Cash' | 'Zelle' | 'Stripe';

export interface PaymentTransaction {
  id: number;
  memberId: number;
  memberName: string;
  amount: number;
  method: PaymentMethodType;
  reference: string;
  date: string;
  membershipTypeId: string;
}

export interface Trainer {
  id: number;
  name: string;
  specialty: string;
}

export type SessionStatus = 'pending' | 'confirmed' | 'cancelled';

export interface PersonalSession {
  id: number;
  trainerId: number;
  memberId: number;
  memberName: string;
  date: string;
  time: string;
  duration: number;
  status: SessionStatus;
  notes: string;
}
