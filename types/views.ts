import type {
  Event,
  EventStatus,
  EventType,
  FeeCalculation,
  Hypothesis,
  MeetingNote,
  Participant,
  ScheduleItem,
  SurveyResult,
  Task,
  TaskStatus,
} from "@/types/entities";

export interface DashboardStat {
  label: string;
  value: string;
  helper: string;
}

export interface InsightItem {
  id: string;
  title: string;
  description: string;
  tone: "neutral" | "positive" | "warning";
}

export interface ChartDatum {
  label: string;
  value: number;
}

export interface TrendDatum {
  month: string;
  participants: number;
  events: number;
  satisfaction: number;
}

export interface EventFilters {
  query?: string;
  status?: EventStatus | "all";
  type?: EventType | "all";
}

export interface ParticipantFilters {
  query?: string;
  segment?: "all" | "first-time" | "repeat" | "has-referrer" | "invited-friends" | "inactive";
}

export interface TaskFilters {
  status?: TaskStatus | "all";
  eventId?: string | "all";
}

export interface AnalyticsFilters {
  eventId?: string | "all";
  dateRange?: "3m" | "6m" | "12m" | "all";
}

export interface DashboardSnapshot {
  stats: DashboardStat[];
  monthlyTrends: TrendDatum[];
  participantsByEvent: ChartDatum[];
  satisfactionTrend: ChartDatum[];
  recentEvents: Event[];
  recentTasks: Task[];
  insights: InsightItem[];
  upcomingEvent?: Event;
  recentMeetingNote?: MeetingNote;
}

export interface EventDetail {
  event: Event;
  hypotheses: Hypothesis[];
  participants: Participant[];
  surveys: SurveyResult[];
}

export interface ParticipantDetail {
  participant: Participant;
  joinedEvents: Event[];
  surveys: SurveyResult[];
}

export interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
  items: ScheduleItem[];
}

export interface FeeCalculationDraft extends Omit<FeeCalculation, "id" | "createdAt"> {}

