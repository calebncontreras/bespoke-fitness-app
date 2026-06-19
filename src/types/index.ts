export interface Member {
  id: string;
  name: string;
  email: string;
  membershipExpiry: string;
  membershipType: string;
  classCredits: number;
  googleCalendarEnabled: boolean;
  trialUsed?: boolean;
}

export interface TrainerUser {
  id: 'trainer';
  name: string;
  role: 'trainer';
}

export type CurrentUser = Member | TrainerUser;

export interface Class {
  id: number;
  name: string;
  day: string;
  time: string;
  instructor: string;
  location: string;
  capacity: number;
  signups: string[];
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
  memberId: string;
  memberName: string;
  amount: number;
  method: PaymentMethodType;
  reference: string;
  date: string;
  membershipTypeId: string;
}

export type SessionStatus = 'pending' | 'confirmed' | 'cancelled';

export interface PersonalSession {
  id: number;
  memberId: string;
  memberName: string;
  date: string;
  time: string;
  duration: number;
  status: SessionStatus;
  notes: string;
}

export interface FeedComment {
  id: number;
  memberId: string;
  memberName: string;
  text: string;
  createdAt: string;
}

export interface FeedPost {
  id: number;
  content: string;
  createdAt: string;
  likes: string[];
  comments: FeedComment[];
}
