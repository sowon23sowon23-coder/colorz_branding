export type PageKey =
  | "dashboard"
  | "participants"
  | "events"
  | "referrals"
  | "rewards"
  | "imports"
  | "settings";

export type ReferralStatus = "Pending" | "Approved" | "Reward issued" | "Reward used";
export type RewardStatus = "Available" | "Issued" | "Used" | "Expired";
export type AttendanceStatus = "Applied" | "Attended" | "No-show";
export type ImportType = "participants" | "participations" | "referrals";

export interface Participant {
  id: string;
  name: string;
  phone: string;
  school: string;
  grade: string;
  firstJoinedAt: string;
  referralCode: string;
  notes: string;
  joinedByReferral: boolean;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  topic: string;
  entryFee: number;
  discountPolicy: string;
  description: string;
}

export interface Participation {
  id: string;
  participantId: string;
  eventId: string;
  appliedStatus: boolean;
  attendedStatus: AttendanceStatus;
  satisfactionScore?: number;
  feedback?: string;
  discountApplied: boolean;
  finalPricePaid: number;
}

export interface Referral {
  id: string;
  referrerParticipantId: string;
  referredParticipantId: string;
  eventId: string;
  referralStatus: ReferralStatus;
  rewardType: string;
  rewardIssued: boolean;
  rewardUsed: boolean;
}

export interface Reward {
  id: string;
  participantId: string;
  referralId?: string;
  rewardType: string;
  rewardStatus: RewardStatus;
  issuedAt?: string;
  usedAt?: string;
  relatedEventId?: string;
}

export interface ImportHistory {
  id: string;
  fileName: string;
  importType: ImportType;
  importedAt: string;
  status: "Completed" | "Completed with warnings" | "Failed";
  rows: number;
  created: number;
  updated: number;
  warnings: number;
}

export interface CRMData {
  participants: Participant[];
  events: Event[];
  participations: Participation[];
  referrals: Referral[];
  rewards: Reward[];
  importHistory: ImportHistory[];
}

export interface ParticipantSummary extends Participant {
  totalParticipationCount: number;
  participatedEventList: string[];
  mostRecentEventDate?: string;
  invitedFriendsCount: number;
  rewardStatus: RewardStatus | "None";
  satisfactionHistory: number[];
}

export interface EventSummary extends Event {
  applicantCount: number;
  actualAttendeeCount: number;
  noShowCount: number;
  firstTimeParticipantCount: number;
  returningParticipantCount: number;
  referralParticipantCount: number;
  discountAppliedCount: number;
  averageSatisfactionScore: number;
}
