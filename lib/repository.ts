import { mockDb } from "@/data/mock-db";
import { calculateFeeDraft, filterEvents, getDashboardSnapshot } from "@/lib/metrics";
import { slugify } from "@/lib/utils";
import type {
  AnalyticsFilters,
  Event,
  EventDetail,
  EventFilters,
  FeeCalculation,
  FeeCalculationDraft,
  MeetingNote,
  MockDatabase,
  Participant,
  ParticipantDetail,
  ParticipantFilters,
  ScheduleItem,
  SurveyResult,
  Task,
  TaskFilters,
} from "@/types";

export function createInitialDatabase(): MockDatabase {
  return structuredClone(mockDb);
}

export function listEvents(db: MockDatabase, filters: EventFilters = {}) {
  return filterEvents([...db.events].sort((a, b) => b.date.localeCompare(a.date)), filters);
}

export function getEventDetail(db: MockDatabase, id: string): EventDetail | undefined {
  const event = db.events.find((item) => item.id === id);
  if (!event) return undefined;
  return {
    event,
    hypotheses: db.hypotheses.filter((item) => item.eventId === id),
    participants: db.participants.filter((item) => event.participantIds.includes(item.id)),
    surveys: db.surveyResults.filter((item) => item.eventId === id),
  };
}

export function listParticipants(db: MockDatabase, filters: ParticipantFilters = {}) {
  return db.participants.filter((participant) => {
    const query = filters.query?.toLowerCase();
    const queryMatch =
      !query ||
      [participant.name, participant.email, participant.phone, participant.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const inactive = new Date(participant.lastJoinDate) < new Date("2026-02-14");
    const segmentMatch =
      !filters.segment ||
      filters.segment === "all" ||
      (filters.segment === "first-time" && participant.totalParticipations === 1) ||
      (filters.segment === "repeat" && participant.totalParticipations > 1) ||
      (filters.segment === "has-referrer" && Boolean(participant.referrerName)) ||
      (filters.segment === "invited-friends" && participant.invitedFriendsCount > 0) ||
      (filters.segment === "inactive" && inactive);
    return queryMatch && segmentMatch;
  });
}

export function getParticipantDetail(db: MockDatabase, id: string): ParticipantDetail | undefined {
  const participant = db.participants.find((item) => item.id === id);
  if (!participant) return undefined;
  return {
    participant,
    joinedEvents: db.events.filter((event) => participant.joinedEventIds.includes(event.id)),
    surveys: db.surveyResults.filter((survey) => survey.participantId === id),
  };
}

export function listScheduleItems(db: MockDatabase, range?: { start?: string; end?: string }) {
  return db.scheduleItems.filter((item) => {
    if (!range?.start && !range?.end) return true;
    if (range.start && item.date < range.start) return false;
    if (range.end && item.date > range.end) return false;
    return true;
  });
}

export function listTasks(db: MockDatabase, filters: TaskFilters = {}) {
  return db.tasks.filter((task) => {
    const statusMatch = !filters.status || filters.status === "all" || task.status === filters.status;
    const eventMatch = !filters.eventId || filters.eventId === "all" || task.relatedEventId === filters.eventId;
    return statusMatch && eventMatch;
  });
}

export function listMeetingNotes(db: MockDatabase, filters?: { query?: string; eventId?: string | "all" }) {
  return db.meetingNotes.filter((note) => {
    const queryMatch = !filters?.query || note.title.toLowerCase().includes(filters.query.toLowerCase());
    const eventMatch = !filters?.eventId || filters.eventId === "all" || note.relatedEventId === filters.eventId;
    return queryMatch && eventMatch;
  });
}

export function listSurveyResults(db: MockDatabase, filters?: { eventId?: string | "all" }) {
  return db.surveyResults.filter((survey) => !filters?.eventId || filters.eventId === "all" || survey.eventId === filters.eventId);
}

export function getAnalyticsSnapshot(db: MockDatabase, filters: AnalyticsFilters = {}) {
  let events = [...db.events];
  if (filters.eventId && filters.eventId !== "all") {
    events = events.filter((event) => event.id === filters.eventId);
  }
  if (filters.dateRange && filters.dateRange !== "all") {
    const months = Number(filters.dateRange.replace("m", ""));
    const limit = new Date("2026-03-15T12:00:00.000Z");
    limit.setMonth(limit.getMonth() - months);
    events = events.filter((event) => new Date(event.date) >= limit);
  }
  const eventIds = new Set(events.map((event) => event.id));
  const surveys = db.surveyResults.filter((survey) => eventIds.has(survey.eventId));
  const participants = db.participants.filter((participant) => participant.joinedEventIds.some((id) => eventIds.has(id)));
  return { events, participants, surveys };
}

export function saveFeeCalculation(db: MockDatabase, draft: FeeCalculationDraft) {
  const item: FeeCalculation = {
    id: `fee-${slugify(`${draft.eventId ?? "manual"}-${Date.now()}`)}`,
    createdAt: new Date().toISOString(),
    ...draft,
  };
  return {
    ...db,
    feeCalculations: [item, ...db.feeCalculations],
  };
}

export function createEvent(db: MockDatabase, input: Omit<Event, "id">) {
  const event: Event = { id: `evt-${slugify(`${input.title}-${input.date}`)}`, ...input };
  return {
    ...db,
    events: [event, ...db.events],
  };
}

export function updateEvent(db: MockDatabase, input: Event) {
  return {
    ...db,
    events: db.events.map((event) => (event.id === input.id ? input : event)),
  };
}

export function deleteEvent(db: MockDatabase, id: string) {
  return {
    ...db,
    events: db.events.filter((event) => event.id !== id),
    hypotheses: db.hypotheses.filter((item) => item.eventId !== id),
    surveyResults: db.surveyResults.filter((item) => item.eventId !== id),
    scheduleItems: db.scheduleItems.filter((item) => item.relatedEventId !== id),
    tasks: db.tasks.filter((item) => item.relatedEventId !== id),
    meetingNotes: db.meetingNotes.filter((item) => item.relatedEventId !== id),
  };
}

export function upsertHypothesis(db: MockDatabase, input: { id?: string; eventId: string; title: string; description: string; successCriteria: string; actualResult: string; success: boolean; improvementNotes: string }) {
  const id = input.id ?? `hyp-${slugify(`${input.eventId}-${input.title}`)}`;
  const next = { ...input, id };
  const exists = db.hypotheses.some((item) => item.id === id);
  return {
    ...db,
    hypotheses: exists ? db.hypotheses.map((item) => (item.id === id ? next : item)) : [next, ...db.hypotheses],
    events: db.events.map((event) =>
      event.id === input.eventId && !event.hypothesisIds.includes(id)
        ? { ...event, hypothesisIds: [...event.hypothesisIds, id] }
        : event,
    ),
  };
}

export function upsertParticipant(db: MockDatabase, input: Participant) {
  const exists = db.participants.some((item) => item.id === input.id);
  return {
    ...db,
    participants: exists ? db.participants.map((item) => (item.id === input.id ? input : item)) : [input, ...db.participants],
  };
}

export function upsertScheduleItem(db: MockDatabase, input: ScheduleItem) {
  const exists = db.scheduleItems.some((item) => item.id === input.id);
  return {
    ...db,
    scheduleItems: exists ? db.scheduleItems.map((item) => (item.id === input.id ? input : item)) : [input, ...db.scheduleItems],
  };
}

export function deleteScheduleItem(db: MockDatabase, id: string) {
  return {
    ...db,
    scheduleItems: db.scheduleItems.filter((item) => item.id !== id),
  };
}

export function upsertTask(db: MockDatabase, input: Task) {
  const exists = db.tasks.some((item) => item.id === input.id);
  return {
    ...db,
    tasks: exists ? db.tasks.map((item) => (item.id === input.id ? input : item)) : [input, ...db.tasks],
  };
}

export function deleteTask(db: MockDatabase, id: string) {
  return { ...db, tasks: db.tasks.filter((task) => task.id !== id) };
}

export function upsertMeetingNote(db: MockDatabase, input: MeetingNote) {
  const exists = db.meetingNotes.some((item) => item.id === input.id);
  return {
    ...db,
    meetingNotes: exists ? db.meetingNotes.map((item) => (item.id === input.id ? input : item)) : [input, ...db.meetingNotes],
  };
}

export function deleteMeetingNote(db: MockDatabase, id: string) {
  return { ...db, meetingNotes: db.meetingNotes.filter((note) => note.id !== id) };
}

export function parseSurveyCsv(text: string): SurveyResult[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];
  return lines.slice(1).map((line, index) => {
    const [eventId, participantId, satisfactionScore, rejoinIntent, recommendIntent, comment] = line.split(",");
    return {
      id: `csv-survey-${index}`,
      eventId,
      participantId,
      satisfactionScore: Number(satisfactionScore),
      rejoinIntent: rejoinIntent === "true",
      recommendIntent: recommendIntent === "true",
      comment,
    };
  });
}

export { calculateFeeDraft, getDashboardSnapshot };

