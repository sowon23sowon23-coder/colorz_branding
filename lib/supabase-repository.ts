import { createInitialDatabase } from "@/lib/repository";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Event, MockDatabase, Participant } from "@/types";

type EventRow = {
  id: string;
  name: string;
  date: string;
  location: string | null;
  entry_fee: number | null;
  description: string | null;
  event_type: Event["type"] | null;
  status: Event["status"] | null;
  target_participants: number | null;
  actual_participants: number | null;
  total_cost: number | null;
  total_revenue: number | null;
  owner: string | null;
  notes: string | null;
  reflection: string | null;
  food_items: string[] | null;
};

type ParticipantRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  first_joined_at: string | null;
  last_joined_at: string | null;
  total_participations: number | null;
  referrer_name: string | null;
  invited_friends_count: number | null;
  tags: string[] | null;
  notes: string | null;
};

type ParticipationRow = {
  participant_id: string;
  event_id: string;
};

function ensureClient() {
  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error("Supabase environment variables are missing.");
  }
  return client;
}

function inferEventStatus(date: string): Event["status"] {
  return new Date(date) >= new Date() ? "planning" : "completed";
}

function mapEventRow(row: EventRow, participantIds: string[]): Event {
  return {
    id: row.id,
    title: row.name,
    date: row.date,
    location: row.location ?? "",
    type: row.event_type ?? "networking",
    status: row.status ?? inferEventStatus(row.date),
    targetParticipants: row.target_participants ?? 0,
    actualParticipants: row.actual_participants ?? 0,
    description: row.description ?? "",
    foodItems: row.food_items ?? [],
    entryFee: row.entry_fee ?? 0,
    totalCost: row.total_cost ?? 0,
    totalRevenue: row.total_revenue ?? 0,
    owner: row.owner ?? "",
    notes: row.notes ?? "",
    participantIds,
    surveyResultIds: [],
    hypothesisIds: [],
    reflection: row.reflection ?? "",
  };
}

function mapParticipantRow(row: ParticipantRow, joinedEventIds: string[]): Participant {
  const totalParticipations = row.total_participations ?? joinedEventIds.length;
  const firstJoinDate = row.first_joined_at ?? new Date().toISOString().slice(0, 10);
  const lastJoinDate = row.last_joined_at ?? firstJoinDate;
  const tags = row.tags && row.tags.length > 0 ? row.tags : [totalParticipations > 1 ? "repeat" : "first-time"];

  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    phone: row.phone,
    firstJoinDate,
    lastJoinDate,
    totalParticipations,
    joinedEventIds,
    referrerName: row.referrer_name ?? "",
    invitedFriendsCount: row.invited_friends_count ?? 0,
    tags,
    notes: row.notes ?? "",
  };
}

export async function fetchDatabaseFromSupabase(): Promise<MockDatabase> {
  const client = ensureClient();

  const [{ data: eventRows, error: eventsError }, { data: participantRows, error: participantsError }, { data: participationRows, error: participationsError }] =
    await Promise.all([
      client.from("events").select("id, name, date, location, entry_fee, description, event_type, status, target_participants, actual_participants, total_cost, total_revenue, owner, notes, reflection, food_items").order("date", { ascending: false }),
      client.from("participants").select("id, name, email, phone, first_joined_at, last_joined_at, total_participations, referrer_name, invited_friends_count, tags, notes").order("created_at", { ascending: false }),
      client.from("participations").select("participant_id, event_id"),
    ]);

  if (eventsError) throw eventsError;
  if (participantsError) throw participantsError;
  if (participationsError) throw participationsError;

  const eventParticipantMap = new Map<string, string[]>();
  const participantEventMap = new Map<string, string[]>();

  for (const row of (participationRows ?? []) as ParticipationRow[]) {
    eventParticipantMap.set(row.event_id, [...(eventParticipantMap.get(row.event_id) ?? []), row.participant_id]);
    participantEventMap.set(row.participant_id, [...(participantEventMap.get(row.participant_id) ?? []), row.event_id]);
  }

  const fallback = createInitialDatabase();

  return {
    ...fallback,
    events: ((eventRows ?? []) as EventRow[]).map((row) => mapEventRow(row, eventParticipantMap.get(row.id) ?? [])),
    participants: ((participantRows ?? []) as ParticipantRow[]).map((row) => mapParticipantRow(row, participantEventMap.get(row.id) ?? [])),
  };
}

function eventPayload(input: Omit<Event, "id"> | Event) {
  return {
    name: input.title,
    date: input.date,
    location: input.location,
    entry_fee: input.entryFee,
    description: input.description,
    event_type: input.type,
    status: input.status,
    target_participants: input.targetParticipants,
    actual_participants: input.actualParticipants,
    total_cost: input.totalCost,
    total_revenue: input.totalRevenue,
    owner: input.owner,
    notes: input.notes,
    reflection: input.reflection,
    food_items: input.foodItems,
  };
}

function participantPayload(input: Participant) {
  return {
    name: input.name,
    email: input.email,
    phone: input.phone,
    first_joined_at: input.firstJoinDate,
    last_joined_at: input.lastJoinDate,
    total_participations: input.totalParticipations,
    referrer_name: input.referrerName,
    invited_friends_count: input.invitedFriendsCount,
    tags: input.tags,
    notes: input.notes,
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function createEventInSupabase(input: Omit<Event, "id">) {
  const client = ensureClient();
  const { error } = await client.from("events").insert(eventPayload(input));
  if (error) throw error;
}

export async function updateEventInSupabase(input: Event) {
  const client = ensureClient();
  const { error } = await client.from("events").update(eventPayload(input)).eq("id", input.id);
  if (error) throw error;
}

export async function deleteEventInSupabase(id: string) {
  const client = ensureClient();
  const { error } = await client.from("events").delete().eq("id", id);
  if (error) throw error;
}

export async function saveParticipantInSupabase(input: Participant) {
  const client = ensureClient();

  if (isUuid(input.id)) {
    const { error } = await client.from("participants").update(participantPayload(input)).eq("id", input.id);
    if (error) throw error;
    return;
  }

  const { error } = await client.from("participants").insert(participantPayload(input));
  if (error) throw error;
}
