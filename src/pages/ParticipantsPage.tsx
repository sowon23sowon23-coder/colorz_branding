import { FormEvent, useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { Drawer, EmptyState, SectionCard, StatusBadge } from "../components/UI";
import { createParticipant } from "../lib/database";
import { CRMData, ParticipantSummary } from "../types";
import { formatDate, getParticipantSummaries } from "../utils";

interface ParticipantsPageProps {
  data: CRMData;
  loading: boolean;
  error: string;
  configured: boolean;
  onRefresh: () => Promise<void>;
}

const rewardLabel = (status: string) => {
  if (status === "Available") return "사용 가능";
  if (status === "Issued") return "지급 완료";
  if (status === "Used") return "사용 완료";
  if (status === "Expired") return "만료";
  return "없음";
};

export function ParticipantsPage({ data, loading, error, configured, onRefresh }: ParticipantsPageProps) {
  const participants = useMemo(() => getParticipantSummaries(data), [data]);
  const [query, setQuery] = useState("");
  const [school, setSchool] = useState("전체");
  const [grade, setGrade] = useState("전체");
  const [selected, setSelected] = useState<ParticipantSummary | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", school: "", grade: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const schools = ["전체", ...new Set(data.participants.map((entry) => entry.school || "미입력"))];
  const grades = ["전체", ...new Set(data.participants.map((entry) => entry.grade || "미입력"))];

  const filtered = participants.filter((participant) => {
    const matchesQuery = participant.name.toLowerCase().includes(query.toLowerCase()) || participant.phone.includes(query);
    const matchesSchool = school === "전체" || (participant.school || "미입력") === school;
    const matchesGrade = grade === "전체" || (participant.grade || "미입력") === grade;
    return matchesQuery && matchesSchool && matchesGrade;
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!form.name.trim() || !form.phone.trim()) {
      setSubmitError("이름과 전화번호는 필수입니다.");
      return;
    }

    try {
      setSubmitting(true);
      await createParticipant(form);
      setForm({ name: "", phone: "", school: "", grade: "", notes: "" });
      setSubmitSuccess("참여자가 저장되었습니다.");
      await onRefresh();
    } catch (createError) {
      setSubmitError(createError instanceof Error ? createError.message : "참여자 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SectionCard title="참여자 등록" description="목업 데이터 없이 실제 참여자를 Supabase에 직접 저장합니다.">
        {!configured ? (
          <EmptyState title="Supabase 연결 필요" description="환경변수 설정 후 참여자를 저장할 수 있습니다." />
        ) : (
          <form className="filter-grid" onSubmit={handleSubmit}>
            <input placeholder="이름" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            <input placeholder="전화번호" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
            <input placeholder="학교" value={form.school} onChange={(event) => setForm((current) => ({ ...current, school: event.target.value }))} />
            <input placeholder="학년" value={form.grade} onChange={(event) => setForm((current) => ({ ...current, grade: event.target.value }))} />
            <input placeholder="메모" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? "저장 중..." : "참여자 저장"}
            </button>
          </form>
        )}
        {submitError ? <p>{submitError}</p> : null}
        {submitSuccess ? <p>{submitSuccess}</p> : null}
      </SectionCard>

      <SectionCard title="참여자 CRM" description="Supabase에 저장된 전체 참여자를 조회합니다.">
        {loading ? <p>참여자 데이터를 불러오는 중입니다.</p> : null}
        {error ? <p>{error}</p> : null}

        <div className="filter-grid">
          <input placeholder="이름 또는 전화번호 검색" value={query} onChange={(event) => setQuery(event.target.value)} />
          <select value={school} onChange={(event) => setSchool(event.target.value)}>
            {schools.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select value={grade} onChange={(event) => setGrade(event.target.value)}>
            {grades.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        {!loading && filtered.length > 0 ? (
          <DataTable
            rows={filtered}
            rowKey={(row) => row.id}
            onRowClick={setSelected}
            columns={[
              { key: "name", label: "이름", sortable: true, sortValue: (row) => row.name, render: (row) => <strong>{row.name}</strong> },
              { key: "phone", label: "전화번호", render: (row) => row.phone },
              { key: "school", label: "학교 / 학년", sortable: true, sortValue: (row) => row.school, render: (row) => `${row.school || "미입력"} / ${row.grade || "미입력"}` },
              { key: "count", label: "참여 횟수", sortable: true, sortValue: (row) => row.totalParticipationCount, render: (row) => row.totalParticipationCount },
              { key: "recent", label: "최근 참여일", sortable: true, sortValue: (row) => row.mostRecentEventDate ?? "", render: (row) => row.mostRecentEventDate ? formatDate(row.mostRecentEventDate) : "-" },
              { key: "referral", label: "추천 유입", render: (row) => <StatusBadge status={row.joinedByReferral ? "추천 유입" : "일반 유입"} /> },
              { key: "reward", label: "리워드", render: (row) => <StatusBadge status={rewardLabel(row.rewardStatus)} /> },
            ]}
          />
        ) : null}

        {!loading && filtered.length === 0 ? (
          <EmptyState title="등록된 참여자가 없습니다" description="상단 입력 폼으로 첫 참여자를 등록해 주세요." />
        ) : null}
      </SectionCard>

      <Drawer open={Boolean(selected)} title={selected?.name ?? "참여자 상세"} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="detail-stack">
            <div className="detail-block">
              <h4>기본 정보</h4>
              <p>{selected.phone}</p>
              <p>{selected.school || "미입력"} / {selected.grade || "미입력"}</p>
              <p>추천 코드: <strong>{selected.referralCode || "-"}</strong></p>
            </div>
            <div className="detail-block">
              <h4>참여 이력</h4>
              <ul className="detail-list">
                {selected.participatedEventList.length > 0 ? selected.participatedEventList.map((item) => <li key={item}>{item}</li>) : <li>아직 참여 이력이 없습니다.</li>}
              </ul>
            </div>
            <div className="detail-block">
              <h4>추천 / 리워드</h4>
              <p>초대한 친구 수: {selected.invitedFriendsCount}</p>
              <p>리워드 상태: <StatusBadge status={rewardLabel(selected.rewardStatus)} /></p>
            </div>
            <div className="detail-block">
              <h4>메모</h4>
              <p>{selected.notes || "메모 없음"}</p>
            </div>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}
