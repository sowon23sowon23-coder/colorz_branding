import { FormEvent, useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { Drawer, EmptyState, SectionCard, StatusBadge } from "../components/UI";
import { createEvent } from "../lib/database";
import { CRMData, EventSummary } from "../types";
import { formatDate, getEventSummaries } from "../utils";

interface EventsPageProps {
  data: CRMData;
  loading: boolean;
  error: string;
  configured: boolean;
  onRefresh: () => Promise<void>;
}

const attendanceLabel = (status: string) => {
  if (status === "Attended") return "참석";
  if (status === "Applied") return "신청";
  return "노쇼";
};

export function EventsPage({ data, loading, error, configured, onRefresh }: EventsPageProps) {
  const events = useMemo(() => getEventSummaries(data), [data]);
  const [selected, setSelected] = useState<EventSummary | null>(null);
  const [form, setForm] = useState({
    name: "",
    date: "",
    location: "",
    topic: "",
    entryFee: "0",
    discountPolicy: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const eventParticipants = selected
    ? data.participations
        .filter((entry) => entry.eventId === selected.id)
        .map((entry) => ({
          id: entry.id,
          participantName: data.participants.find((item) => item.id === entry.participantId)?.name ?? "알 수 없음",
          attendance: entry.attendedStatus,
          discountApplied: entry.discountApplied,
          feedback: entry.feedback ?? "피드백 없음",
        }))
    : [];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!form.name.trim() || !form.date) {
      setSubmitError("이벤트명과 날짜는 필수입니다.");
      return;
    }

    try {
      setSubmitting(true);
      await createEvent({
        name: form.name,
        date: form.date,
        location: form.location,
        topic: form.topic,
        entryFee: Number(form.entryFee) || 0,
        discountPolicy: form.discountPolicy,
        description: form.description,
      });
      setForm({ name: "", date: "", location: "", topic: "", entryFee: "0", discountPolicy: "", description: "" });
      setSubmitSuccess("이벤트가 저장되었습니다.");
      await onRefresh();
    } catch (createError) {
      setSubmitError(createError instanceof Error ? createError.message : "이벤트 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SectionCard title="이벤트 등록" description="이벤트 데이터를 직접 Supabase에 저장합니다.">
        {!configured ? (
          <EmptyState title="Supabase 연결 필요" description="환경변수와 스키마가 설정되면 이벤트를 저장할 수 있습니다." />
        ) : (
          <form className="filter-grid" onSubmit={handleSubmit}>
            <input placeholder="이벤트명" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            <input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
            <input placeholder="장소" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
            <input placeholder="주제" value={form.topic} onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))} />
            <input type="number" placeholder="참가비" value={form.entryFee} onChange={(event) => setForm((current) => ({ ...current, entryFee: event.target.value }))} />
            <input placeholder="할인 정책" value={form.discountPolicy} onChange={(event) => setForm((current) => ({ ...current, discountPolicy: event.target.value }))} />
            <input placeholder="설명" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? "저장 중..." : "이벤트 저장"}
            </button>
          </form>
        )}
        {submitError ? <p>{submitError}</p> : null}
        {submitSuccess ? <p>{submitSuccess}</p> : null}
      </SectionCard>

      <SectionCard title="이벤트 목록" description="Supabase에 저장된 이벤트를 조회합니다.">
        {loading ? <p>이벤트 데이터를 불러오는 중입니다.</p> : null}
        {error ? <p>{error}</p> : null}
        {!loading && events.length > 0 ? (
          <DataTable
            rows={events}
            rowKey={(row) => row.id}
            onRowClick={setSelected}
            columns={[
              { key: "name", label: "이벤트명", sortable: true, sortValue: (row) => row.name, render: (row) => <strong>{row.name}</strong> },
              { key: "date", label: "날짜 / 주제", sortable: true, sortValue: (row) => row.date, render: (row) => `${formatDate(row.date)} / ${row.topic || "미입력"}` },
              { key: "location", label: "장소", render: (row) => row.location || "-" },
              { key: "applicants", label: "신청자", sortable: true, sortValue: (row) => row.applicantCount, render: (row) => row.applicantCount },
              { key: "attendees", label: "참석자", sortable: true, sortValue: (row) => row.actualAttendeeCount, render: (row) => row.actualAttendeeCount },
              { key: "referrals", label: "추천 유입", sortable: true, sortValue: (row) => row.referralParticipantCount, render: (row) => row.referralParticipantCount },
              { key: "score", label: "평균 만족도", sortable: true, sortValue: (row) => row.averageSatisfactionScore, render: (row) => row.averageSatisfactionScore || "-" },
            ]}
          />
        ) : null}

        {!loading && events.length === 0 ? (
          <EmptyState title="등록된 이벤트가 없습니다" description="상단 입력 폼으로 첫 이벤트를 등록해 주세요." />
        ) : null}
      </SectionCard>

      <Drawer open={Boolean(selected)} title={selected?.name ?? "이벤트 상세"} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="detail-stack">
            <div className="detail-block">
              <h4>이벤트 정보</h4>
              <p>{formatDate(selected.date)} / {selected.location || "미입력"}</p>
              <p>{selected.topic || "미입력"}</p>
              <p>{selected.description || "설명 없음"}</p>
            </div>
            <div className="detail-block">
              <h4>요약 지표</h4>
              <p>신청자: {selected.applicantCount}</p>
              <p>참석자: {selected.actualAttendeeCount}</p>
              <p>노쇼: {selected.noShowCount}</p>
              <p>추천 유입: {selected.referralParticipantCount}</p>
            </div>
            <div className="detail-block">
              <h4>참여자 목록</h4>
              <ul className="detail-list">
                {eventParticipants.length > 0 ? eventParticipants.map((entry) => (
                  <li key={entry.id}>
                    <strong>{entry.participantName}</strong> <StatusBadge status={attendanceLabel(entry.attendance)} /> {entry.discountApplied ? " / 할인 적용" : ""}
                  </li>
                )) : <li>아직 연결된 참여 기록이 없습니다.</li>}
              </ul>
            </div>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}
