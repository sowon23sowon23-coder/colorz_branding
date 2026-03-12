import { CRMData, Event, EventSummary, ImportType, ParticipantSummary, RewardStatus } from "./types";

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));

export const getParticipantSummaries = (data: CRMData): ParticipantSummary[] =>
  data.participants.map((participant) => {
    const participations = data.participations.filter((entry) => entry.participantId === participant.id);
    const relatedEvents = participations
      .map((entry) => data.events.find((event) => event.id === entry.eventId))
      .filter((event): event is Event => Boolean(event))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
    const invitedFriendsCount = data.referrals.filter((referral) => referral.referrerParticipantId === participant.id).length;
    const satisfactionHistory = participations
      .map((entry) => entry.satisfactionScore)
      .filter((score): score is number => typeof score === "number");
    const reward = data.rewards.find((entry) => entry.participantId === participant.id);

    return {
      ...participant,
      totalParticipationCount: participations.length,
      participatedEventList: relatedEvents.map((event) => event.name),
      mostRecentEventDate: relatedEvents[0]?.date,
      invitedFriendsCount,
      rewardStatus: reward?.rewardStatus ?? ("None" as RewardStatus | "None"),
      satisfactionHistory,
    };
  });

export const getEventSummaries = (data: CRMData): EventSummary[] =>
  data.events
    .map((event) => {
      const rows = data.participations.filter((entry) => entry.eventId === event.id);
      const attendees = rows.filter((entry) => entry.attendedStatus === "Attended");
      const noShows = rows.filter((entry) => entry.attendedStatus === "No-show");
      const scores = attendees.map((entry) => entry.satisfactionScore).filter((score): score is number => typeof score === "number");
      const firstTimeParticipantCount = attendees.filter((entry) => {
        const participant = data.participants.find((item) => item.id === entry.participantId);
        return participant?.firstJoinedAt === event.date;
      }).length;

      return {
        ...event,
        applicantCount: rows.length,
        actualAttendeeCount: attendees.length,
        noShowCount: noShows.length,
        firstTimeParticipantCount,
        returningParticipantCount: Math.max(attendees.length - firstTimeParticipantCount, 0),
        referralParticipantCount: data.referrals.filter((entry) => entry.eventId === event.id).length,
        discountAppliedCount: rows.filter((entry) => entry.discountApplied).length,
        averageSatisfactionScore: scores.length ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)) : 0,
      };
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

export const getDashboardStats = (data: CRMData) => {
  const participantSummaries = getParticipantSummaries(data);
  const eventSummaries = getEventSummaries(data);
  const currentMonth = "2026-03";
  const newParticipantsThisMonth = data.participants.filter((entry) => entry.firstJoinedAt.startsWith(currentMonth)).length;
  const attendanceRate = eventSummaries.length
    ? Math.round((eventSummaries.reduce((sum, event) => sum + event.actualAttendeeCount, 0) / Math.max(eventSummaries.reduce((sum, event) => sum + event.applicantCount, 0), 1)) * 100)
    : 0;
  const repeatParticipationRate = Math.round((participantSummaries.filter((entry) => entry.totalParticipationCount > 1).length / Math.max(participantSummaries.length, 1)) * 100);

  return {
    totalParticipants: data.participants.length,
    newParticipantsThisMonth,
    totalEvents: data.events.length,
    averageAttendanceRate: attendanceRate,
    repeatParticipationRate,
    referralInflowCount: data.participants.filter((entry) => entry.joinedByReferral).length,
    rewardUsageCount: data.rewards.filter((entry) => entry.rewardStatus === "Used").length,
  };
};

export const groupCount = (values: string[]) =>
  Object.entries(
    values.reduce<Record<string, number>>((acc, value) => {
      acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(current.trim());
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
};

export const inferColumnRole = (header: string, importType: ImportType) => {
  const key = header.toLowerCase();
  const common = [
    { match: ["name", "participant_name", "성함", "이름"], role: "name" },
    { match: ["phone", "연락처", "전화번호"], role: "phone" },
    { match: ["school", "대학교", "학교"], role: "school" },
    { match: ["grade", "year", "학년"], role: "grade" },
    { match: ["event", "event_name", "모임명", "이벤트명"], role: "eventName" },
    { match: ["referral", "referrer", "추천인", "추천코드"], role: "referrerCode" },
  ];

  const extra =
    importType === "participations"
      ? [
          { match: ["attendance", "attended", "출석", "참석"], role: "attendanceStatus" },
          { match: ["satisfaction", "score", "만족도"], role: "satisfactionScore" },
        ]
      : importType === "referrals"
        ? [
            { match: ["reward", "혜택", "보상"], role: "rewardType" },
            { match: ["status", "상태"], role: "referralStatus" },
          ]
        : [];

  return [...common, ...extra].find((entry) => entry.match.some((item) => key.includes(item)))?.role ?? "ignore";
};
