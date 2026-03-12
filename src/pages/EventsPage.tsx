import { useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { Drawer, SectionCard, StatusBadge } from "../components/UI";
import { CRMData, EventSummary } from "../types";
import { formatDate, getEventSummaries } from "../utils";

const attendanceLabel = (status: string) => {
  if (status === "Attended") return "참석";
  if (status === "Applied") return "신청";
  return "노쇼";
};

export function EventsPage({ data }: { data: CRMData }) {
  const events = useMemo(() => getEventSummaries(data), [data]);
  const [selected, setSelected] = useState<EventSummary | null>(events[0] ?? null);

  const eventParticipants = selected
    ? data.participations
        .filter((entry) => entry.eventId === selected.id)
        .map((entry) => {
          const participant = data.participants.find((item) => item.id === entry.participantId);
          return {
            id: entry.id,
            name: participant?.name ?? "알 수 없음",
            attendance: entry.attendedStatus,
            discountApplied: entry.discountApplied,
            feedback: entry.feedback ?? "피드백 없음",
          };
        })
    : [];

  return (
    <>
      <SectionCard title="이벤트 관리" description="이벤트별 참석, 추천, 만족도 데이터를 운영 관점에서 검토합니다">
        <DataTable
          rows={events}
          rowKey={(row) => row.id}
          onRowClick={setSelected}
          columns={[
            { key: "name", label: "이벤트", sortable: true, sortValue: (row) => row.name, render: (row) => <strong>{row.name}</strong> },
            { key: "date", label: "날짜 / 주제", sortable: true, sortValue: (row) => row.date, render: (row) => `${formatDate(row.date)} / ${row.topic}` },
            { key: "location", label: "장소", render: (row) => row.location },
            { key: "applicants", label: "신청자", sortable: true, sortValue: (row) => row.applicantCount, render: (row) => row.applicantCount },
            { key: "attendees", label: "참석자", sortable: true, sortValue: (row) => row.actualAttendeeCount, render: (row) => row.actualAttendeeCount },
            { key: "referrals", label: "추천 유입", sortable: true, sortValue: (row) => row.referralParticipantCount, render: (row) => row.referralParticipantCount },
            { key: "score", label: "평균 만족도", sortable: true, sortValue: (row) => row.averageSatisfactionScore, render: (row) => row.averageSatisfactionScore || "-" },
          ]}
        />
      </SectionCard>

      <Drawer open={Boolean(selected)} title={selected?.name ?? "이벤트 상세"} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="detail-stack">
            <div className="detail-block">
              <h4>이벤트 정보</h4>
              <p>{formatDate(selected.date)} / {selected.location}</p>
              <p>{selected.topic}</p>
              <p>{selected.description}</p>
            </div>
            <div className="detail-block">
              <h4>핵심 지표</h4>
              <p>신청자: {selected.applicantCount}</p>
              <p>참석자: {selected.actualAttendeeCount}</p>
              <p>노쇼: {selected.noShowCount}</p>
              <p>첫 참여 / 재참여: {selected.firstTimeParticipantCount} / {selected.returningParticipantCount}</p>
              <p>할인 적용 수: {selected.discountAppliedCount}</p>
            </div>
            <div className="detail-block">
              <h4>참여자 목록</h4>
              <ul className="detail-list">
                {eventParticipants.map((entry) => (
                  <li key={entry.id}>
                    <strong>{entry.name}</strong> <StatusBadge status={attendanceLabel(entry.attendance)} /> {entry.discountApplied ? " / 할인 적용" : ""}
                  </li>
                ))}
              </ul>
            </div>
            <div className="detail-block">
              <h4>피드백 요약</h4>
              <ul className="detail-list">
                {eventParticipants.map((entry) => (
                  <li key={`${entry.id}-feedback`}>{entry.name}: {entry.feedback}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}
