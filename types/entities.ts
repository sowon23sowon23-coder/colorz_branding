export type EventStatus = "planning" | "preparing" | "completed" | "analyzed";
export type EventType = "networking" | "food" | "career" | "workshop" | "social";
export type ScheduleType = "event" | "meeting" | "preparation" | "surveyDeadline" | "promotion";
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "done";

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  type: EventType;
  status: EventStatus;
  targetParticipants: number;
  actualParticipants: number;
  description: string;
  foodItems: string[];
  entryFee: number;
  totalCost: number;
  totalRevenue: number;
  owner: string;
  notes: string;
  participantIds: string[];
  surveyResultIds: string[];
  hypothesisIds: string[];
  reflection: string;
}

export interface Hypothesis {
  id: string;
  eventId: string;
  title: string;
  description: string;
  successCriteria: string;
  actualResult: string;
  success: boolean;
  improvementNotes: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  firstJoinDate: string;
  lastJoinDate: string;
  totalParticipations: number;
  joinedEventIds: string[];
  referrerName: string;
  invitedFriendsCount: number;
  tags: string[];
  notes: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  time: string;
  type: ScheduleType;
  relatedEventId?: string;
  owner: string;
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  relatedEventId?: string;
  assignee: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
}

export interface MeetingNote {
  id: string;
  title: string;
  date: string;
  attendees: string[];
  relatedEventId?: string;
  content: string;
  decisions: string[];
  actionItems: string[];
}

export interface SurveyResult {
  id: string;
  eventId: string;
  participantId: string;
  satisfactionScore: number;
  rejoinIntent: boolean;
  recommendIntent: boolean;
  comment: string;
}

export interface FeeCalculation {
  id: string;
  eventId?: string;
  expectedParticipants: number;
  foodCost: number;
  venueCost: number;
  extraCost: number;
  targetProfit: number;
  totalCost: number;
  perPersonCost: number;
  breakEvenFee: number;
  recommendedFee: number;
  createdAt: string;
}

export interface MockDatabase {
  events: Event[];
  hypotheses: Hypothesis[];
  participants: Participant[];
  scheduleItems: ScheduleItem[];
  tasks: Task[];
  meetingNotes: MeetingNote[];
  surveyResults: SurveyResult[];
  feeCalculations: FeeCalculation[];
}

