import { CRMData, Event, ImportHistory, Participant, Participation, Referral, Reward } from "../types";
import { supabase, hasSupabaseEnv } from "./supabase";

type ParticipantRow = {
  id: string;
  name: string;
  phone: string;
  school: string | null;
  grade: string | null;
  first_joined_at: string | null;
  referral_code: string | null;
  notes: string | null;
  joined_by_referral: boolean | null;
};

type EventRow = {
  id: string;
  name: string;
  date: string;
  location: string | null;
  topic: string | null;
  entry_fee: number | null;
  discount_policy: string | null;
  description: string | null;
};

type ParticipationRow = {
  id: string;
  participant_id: string;
  event_id: string;
  applied_status: boolean | null;
  attended_status: string | null;
  satisfaction_score: number | null;
  feedback: string | null;
  discount_applied: boolean | null;
  final_price_paid: number | null;
};

type ReferralRow = {
  id: string;
  referrer_participant_id: string;
  referred_participant_id: string;
  event_id: string;
  referral_status: string;
  reward_type: string | null;
  reward_issued: boolean | null;
  reward_used: boolean | null;
};

type RewardRow = {
  id: string;
  participant_id: string;
  referral_id: string | null;
  reward_type: string;
  reward_status: string;
  issued_at: string | null;
  used_at: string | null;
  related_event_id: string | null;
};

type ImportHistoryRow = {
  id: string;
  file_name: string;
  import_type: "participants" | "participations" | "referrals";
  imported_at: string;
  status: "Completed" | "Completed with warnings" | "Failed";
  rows: number;
  created: number;
  updated: number;
  warnings: number;
};

export const isSupabaseConfigured = () => hasSupabaseEnv && Boolean(supabase);

const assertSupabase = () => {
  if (!supabase) {
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  }
  return supabase;
};

const mapParticipant = (row: ParticipantRow): Participant => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  school: row.school ?? "",
  grade: row.grade ?? "",
  firstJoinedAt: row.first_joined_at ?? "",
  referralCode: row.referral_code ?? "",
  notes: row.notes ?? "",
  joinedByReferral: row.joined_by_referral ?? false,
});

const mapEvent = (row: EventRow): Event => ({
  id: row.id,
  name: row.name,
  date: row.date,
  location: row.location ?? "",
  topic: row.topic ?? "",
  entryFee: row.entry_fee ?? 0,
  discountPolicy: row.discount_policy ?? "",
  description: row.description ?? "",
});

const mapParticipation = (row: ParticipationRow): Participation => ({
  id: row.id,
  participantId: row.participant_id,
  eventId: row.event_id,
  appliedStatus: row.applied_status ?? false,
  attendedStatus: (row.attended_status as Participation["attendedStatus"]) ?? "Applied",
  satisfactionScore: row.satisfaction_score ?? undefined,
  feedback: row.feedback ?? undefined,
  discountApplied: row.discount_applied ?? false,
  finalPricePaid: row.final_price_paid ?? 0,
});

const mapReferral = (row: ReferralRow): Referral => ({
  id: row.id,
  referrerParticipantId: row.referrer_participant_id,
  referredParticipantId: row.referred_participant_id,
  eventId: row.event_id,
  referralStatus: row.referral_status as Referral["referralStatus"],
  rewardType: row.reward_type ?? "",
  rewardIssued: row.reward_issued ?? false,
  rewardUsed: row.reward_used ?? false,
});

const mapReward = (row: RewardRow): Reward => ({
  id: row.id,
  participantId: row.participant_id,
  referralId: row.referral_id ?? undefined,
  rewardType: row.reward_type,
  rewardStatus: row.reward_status as Reward["rewardStatus"],
  issuedAt: row.issued_at ?? undefined,
  usedAt: row.used_at ?? undefined,
  relatedEventId: row.related_event_id ?? undefined,
});

const mapImportHistory = (row: ImportHistoryRow): ImportHistory => ({
  id: row.id,
  fileName: row.file_name,
  importType: row.import_type,
  importedAt: row.imported_at,
  status: row.status,
  rows: row.rows,
  created: row.created,
  updated: row.updated,
  warnings: row.warnings,
});

export async function fetchCRMData(): Promise<CRMData> {
  const client = assertSupabase();

  const [participantsResult, eventsResult, participationsResult, referralsResult, rewardsResult, importsResult] =
    await Promise.all([
      client.from("participants").select("*").order("created_at", { ascending: false }),
      client.from("events").select("*").order("date", { ascending: false }),
      client.from("participations").select("*").order("created_at", { ascending: false }),
      client.from("referrals").select("*").order("created_at", { ascending: false }),
      client.from("rewards").select("*").order("created_at", { ascending: false }),
      client.from("import_history").select("*").order("imported_at", { ascending: false }),
    ]);

  const errors = [
    participantsResult.error,
    eventsResult.error,
    participationsResult.error,
    referralsResult.error,
    rewardsResult.error,
    importsResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(errors[0]?.message ?? "Supabase 조회 중 오류가 발생했습니다.");
  }

  return {
    participants: (participantsResult.data as ParticipantRow[] | null)?.map(mapParticipant) ?? [],
    events: (eventsResult.data as EventRow[] | null)?.map(mapEvent) ?? [],
    participations: (participationsResult.data as ParticipationRow[] | null)?.map(mapParticipation) ?? [],
    referrals: (referralsResult.data as ReferralRow[] | null)?.map(mapReferral) ?? [],
    rewards: (rewardsResult.data as RewardRow[] | null)?.map(mapReward) ?? [],
    importHistory: (importsResult.data as ImportHistoryRow[] | null)?.map(mapImportHistory) ?? [],
  };
}

const makeReferralCode = (name: string, phone: string) => {
  const prefix = name.replace(/\s+/g, "").slice(0, 4).toUpperCase();
  const suffix = phone.replace(/\D/g, "").slice(-4);
  return `${prefix}${suffix}`;
};

export async function createParticipant(input: {
  name: string;
  phone: string;
  school: string;
  grade: string;
  notes: string;
}) {
  const client = assertSupabase();
  const payload = {
    name: input.name,
    phone: input.phone,
    school: input.school || null,
    grade: input.grade || null,
    notes: input.notes || null,
    first_joined_at: new Date().toISOString().slice(0, 10),
    referral_code: makeReferralCode(input.name, input.phone),
    joined_by_referral: false,
  };

  const { error } = await client.from("participants").insert(payload);
  if (error) {
    throw new Error(error.message);
  }
}

export async function createEvent(input: {
  name: string;
  date: string;
  location: string;
  topic: string;
  entryFee: number;
  discountPolicy: string;
  description: string;
}) {
  const client = assertSupabase();
  const { error } = await client.from("events").insert({
    name: input.name,
    date: input.date,
    location: input.location || null,
    topic: input.topic || null,
    entry_fee: input.entryFee,
    discount_policy: input.discountPolicy || null,
    description: input.description || null,
  });

  if (error) {
    throw new Error(error.message);
  }
}
