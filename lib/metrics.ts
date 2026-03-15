import { addMonths, endOfMonth, format, isAfter, isBefore, parseISO, startOfMonth, subMonths } from "date-fns";

import type { ChartDatum, DashboardSnapshot, Event, EventType, FeeCalculationDraft, InsightItem, MockDatabase, SurveyResult } from "@/types";

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

export function calculateRepeatParticipationRate(db: MockDatabase) {
  if (db.participants.length === 0) return 0;
  const repeatCount = db.participants.filter((participant) => participant.totalParticipations > 1).length;
  return Math.round((repeatCount / db.participants.length) * 100);
}

export function calculateReferralInflow(db: MockDatabase) {
  return db.participants.filter((participant) => Boolean(participant.referrerName)).length;
}

export function calculateAverageSatisfaction(surveys: SurveyResult[]) {
  return average(surveys.map((survey) => survey.satisfactionScore));
}

export function calculateIntentRatio(surveys: SurveyResult[], key: "rejoinIntent" | "recommendIntent") {
  if (surveys.length === 0) return 0;
  const positive = surveys.filter((survey) => survey[key]).length;
  return Math.round((positive / surveys.length) * 100);
}

export function buildMonthlyTrends(db: MockDatabase, months = 6) {
  const now = new Date("2026-03-15T12:00:00.000Z");
  return Array.from({ length: months }).map((_, index) => {
    const current = addMonths(startOfMonth(subMonths(now, months - index - 1)), 0);
    const monthStart = startOfMonth(current);
    const monthEnd = endOfMonth(current);
    const events = db.events.filter((event) => {
      const date = parseISO(event.date);
      return !isBefore(date, monthStart) && !isAfter(date, monthEnd);
    });
    const participants = db.participants.filter((participant) => {
      const date = parseISO(participant.firstJoinDate);
      return !isBefore(date, monthStart) && !isAfter(date, monthEnd);
    });
    const surveys = db.surveyResults.filter((survey) => {
      const event = db.events.find((item) => item.id === survey.eventId);
      if (!event) return false;
      const date = parseISO(event.date);
      return !isBefore(date, monthStart) && !isAfter(date, monthEnd);
    });

    return {
      month: format(current, "yyyy-MM-01"),
      events: events.length,
      participants: participants.length,
      satisfaction: calculateAverageSatisfaction(surveys),
    };
  });
}

export function buildParticipantsByEvent(db: MockDatabase): ChartDatum[] {
  return [...db.events]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((event) => ({
      label: event.title,
      value: event.actualParticipants || event.participantIds.length,
    }));
}

export function buildSatisfactionTrend(db: MockDatabase): ChartDatum[] {
  return [...db.events]
    .filter((event) => event.surveyResultIds.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((event) => ({
      label: event.title,
      value: calculateAverageSatisfaction(db.surveyResults.filter((survey) => survey.eventId === event.id)),
    }));
}

export function buildEventTypeComparison(db: MockDatabase): ChartDatum[] {
  const grouped = new Map<EventType, number[]>();
  db.events.forEach((event) => {
    const current = grouped.get(event.type) ?? [];
    current.push(event.actualParticipants);
    grouped.set(event.type, current);
  });
  return Array.from(grouped.entries()).map(([label, values]) => ({
    label,
    value: Math.round(values.reduce((sum, item) => sum + item, 0) / values.length),
  }));
}

export function generateQuickInsights(db: MockDatabase): InsightItem[] {
  const foodEvents = db.events.filter((event) => event.type === "food");
  const topFoodAverage =
    foodEvents.reduce((sum, event) => sum + event.actualParticipants, 0) / Math.max(foodEvents.length, 1);
  const latestEvent = [...db.events].sort((a, b) => b.date.localeCompare(a.date))[0];
  const trends = buildMonthlyTrends(db, 2);
  const previous = trends[0]?.participants ?? 0;
  const current = trends[1]?.participants ?? 0;

  return [
    {
      id: "insight-food",
      title: "푸드 테마 강세",
      description: `푸드 중심 이벤트의 평균 참여 인원은 ${Math.round(topFoodAverage)}명으로 가장 높습니다.`,
      tone: "positive",
    },
    {
      id: "insight-repeat",
      title: "재참여 증가",
      description: current >= previous ? "이번 달 첫 유입과 재참여 흐름이 지난달보다 개선되었습니다." : "이번 달 신규 유입이 감소해 프로모션 보강이 필요합니다.",
      tone: current >= previous ? "positive" : "warning",
    },
    {
      id: "insight-latest",
      title: "최근 이벤트 성과",
      description:
        latestEvent.actualParticipants > latestEvent.targetParticipants
          ? `가장 최근 행사인 ${latestEvent.title}은 목표보다 ${latestEvent.actualParticipants - latestEvent.targetParticipants}명 더 모였습니다.`
          : `가장 최근 행사인 ${latestEvent.title}은 목표보다 ${latestEvent.targetParticipants - latestEvent.actualParticipants}명 부족했습니다.`,
      tone: latestEvent.actualParticipants > latestEvent.targetParticipants ? "positive" : "neutral",
    },
  ];
}

export function calculateFeeDraft(input: {
  expectedParticipants: number;
  foodCost: number;
  venueCost: number;
  extraCost: number;
  targetProfit: number;
  eventId?: string;
}): FeeCalculationDraft {
  const totalCost = input.foodCost + input.venueCost + input.extraCost;
  const perPersonCost = Math.ceil(totalCost / Math.max(input.expectedParticipants, 1));
  const breakEvenFee = perPersonCost;
  const recommendedFee = Math.ceil((totalCost + input.targetProfit) / Math.max(input.expectedParticipants, 1));

  return {
    eventId: input.eventId,
    expectedParticipants: input.expectedParticipants,
    foodCost: input.foodCost,
    venueCost: input.venueCost,
    extraCost: input.extraCost,
    targetProfit: input.targetProfit,
    totalCost,
    perPersonCost,
    breakEvenFee,
    recommendedFee,
  };
}

export function getDashboardSnapshot(db: MockDatabase): DashboardSnapshot {
  const repeatRate = calculateRepeatParticipationRate(db);
  const referralInflow = calculateReferralInflow(db);
  const upcomingEvent = [...db.events]
    .filter((event) => event.status === "planning" || event.status === "preparing")
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const recentMeetingNote = [...db.meetingNotes].sort((a, b) => b.date.localeCompare(a.date))[0];
  const recentEvents = [...db.events].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const recentTasks = [...db.tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);

  return {
    stats: [
      { label: "총 이벤트", value: String(db.events.length), helper: "누적 운영 이벤트 수" },
      { label: "총 참가자", value: String(db.participants.length), helper: "중복 제외 참가자" },
      { label: "재참여자", value: String(db.participants.filter((item) => item.totalParticipations > 1).length), helper: "2회 이상 참여" },
      { label: "재참여율", value: `${repeatRate}%`, helper: "참가자 기준" },
      { label: "추천 유입", value: String(referralInflow), helper: "추천인 기록 보유" },
      { label: "진행 중 태스크", value: String(db.tasks.filter((task) => task.status !== "done").length), helper: "운영 준비 항목" },
    ],
    monthlyTrends: buildMonthlyTrends(db),
    participantsByEvent: buildParticipantsByEvent(db),
    satisfactionTrend: buildSatisfactionTrend(db),
    recentEvents,
    recentTasks,
    insights: generateQuickInsights(db),
    upcomingEvent,
    recentMeetingNote,
  };
}

export function filterEvents(events: Event[], filters: { query?: string; status?: string; type?: string }) {
  return events.filter((event) => {
    const queryMatch = !filters.query || [event.title, event.location, event.owner].join(" ").toLowerCase().includes(filters.query.toLowerCase());
    const statusMatch = !filters.status || filters.status === "all" || event.status === filters.status;
    const typeMatch = !filters.type || filters.type === "all" || event.type === filters.type;
    return queryMatch && statusMatch && typeMatch;
  });
}

export function buildKeywordFrequency(surveys: SurveyResult[]) {
  const stopwords = new Set(["그리고", "정말", "조금", "너무", "좋았어요", "있어요", "있었어요", "행사", "시간"]);
  const counts = new Map<string, number>();
  surveys.forEach((survey) => {
    survey.comment
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 1 && !stopwords.has(word))
      .forEach((word) => {
        counts.set(word, (counts.get(word) ?? 0) + 1);
      });
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }));
}

