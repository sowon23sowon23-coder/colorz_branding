import { useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { Drawer, EmptyState, SectionCard, StatusBadge } from "../components/UI";
import { CRMData, ParticipantSummary } from "../types";
import { formatDate, getParticipantSummaries } from "../utils";

const rewardLabel = (status: string) => {
  if (status === "Available") return "사용 가능";
  if (status === "Issued") return "지급 완료";
  if (status === "Used") return "사용 완료";
  if (status === "Expired") return "만료";
  return "없음";
};

export function ParticipantsPage({ data }: { data: CRMData }) {
  const participants = useMemo(() => getParticipantSummaries(data), [data]);
  const [query, setQuery] = useState("");
  const [school, setSchool] = useState("전체");
  const [grade, setGrade] = useState("전체");
  const [participantType, setParticipantType] = useState("전체");
  const [rewardFilter, setRewardFilter] = useState("전체");
  const [selected, setSelected] = useState<ParticipantSummary | null>(null);

  const schools = ["전체", ...new Set(data.participants.map((entry) => entry.school))];
  const grades = ["전체", ...new Set(data.participants.map((entry) => entry.grade))];

  const filtered = participants.filter((participant) => {
    const matchesQuery = participant.name.toLowerCase().includes(query.toLowerCase()) || participant.phone.includes(query);
    const matchesSchool = school === "전체" || participant.school === school;
    const matchesGrade = grade === "전체" || participant.grade === grade;
    const matchesType =
      participantType === "전체" ||
      (participantType === "첫 참여" && participant.totalParticipationCount === 1) ||
      (participantType === "재참여" && participant.totalParticipationCount > 1) ||
      (participantType === "추천인" && participant.invitedFriendsCount > 0) ||
      (participantType === "추천 유입" && participant.joinedByReferral);
    const matchesReward =
      rewardFilter === "전체" ||
      (rewardFilter === "사용 가능" && participant.rewardStatus === "Available") ||
      (rewardFilter === "사용 완료" && participant.rewardStatus === "Used") ||
      (rewardFilter === "없음" && participant.rewardStatus === "None");

    return matchesQuery && matchesSchool && matchesGrade && matchesType && matchesReward;
  });

  return (
    <>
      <SectionCard title="참여자 CRM" description="Colorz 전체 참여자 이력을 검색하고 필터링합니다">
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
          <select value={participantType} onChange={(event) => setParticipantType(event.target.value)}>
            {["전체", "첫 참여", "재참여", "추천인", "추천 유입"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select value={rewardFilter} onChange={(event) => setRewardFilter(event.target.value)}>
            {["전체", "사용 가능", "사용 완료", "없음"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        {filtered.length ? (
          <DataTable
            rows={filtered}
            rowKey={(row) => row.id}
            onRowClick={setSelected}
            columns={[
              { key: "name", label: "참여자", sortable: true, sortValue: (row) => row.name, render: (row) => <strong>{row.name}</strong> },
              { key: "phone", label: "전화번호", render: (row) => row.phone },
              { key: "school", label: "학교 / 학년", sortable: true, sortValue: (row) => row.school, render: (row) => `${row.school} / ${row.grade}` },
              { key: "count", label: "참여 횟수", sortable: true, sortValue: (row) => row.totalParticipationCount, render: (row) => row.totalParticipationCount },
              { key: "recent", label: "최근 참여일", sortable: true, sortValue: (row) => row.mostRecentEventDate ?? "", render: (row) => row.mostRecentEventDate ? formatDate(row.mostRecentEventDate) : "참여 기록 없음" },
              { key: "referral", label: "추천 여부", render: (row) => row.joinedByReferral ? <StatusBadge status="추천 유입" /> : <StatusBadge status="일반 유입" /> },
              { key: "reward", label: "리워드", render: (row) => <StatusBadge status={rewardLabel(row.rewardStatus)} /> },
            ]}
          />
        ) : (
          <EmptyState title="조건에 맞는 참여자가 없습니다" description="필터나 검색어를 조정해 더 많은 기록을 확인하세요." />
        )}
      </SectionCard>

      <Drawer open={Boolean(selected)} title={selected?.name ?? "참여자 상세"} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="detail-stack">
            <div className="detail-block">
              <h4>기본 프로필</h4>
              <p>{selected.phone}</p>
              <p>{selected.school} / {selected.grade}</p>
              <p>추천 코드: <strong>{selected.referralCode}</strong></p>
            </div>
            <div className="detail-block">
              <h4>참여 이력</h4>
              <ul className="detail-list">
                {selected.participatedEventList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="detail-block">
              <h4>추천 및 리워드 이력</h4>
              <p>초대한 친구 수: {selected.invitedFriendsCount}</p>
              <p>추천 유입 여부: {selected.joinedByReferral ? "예" : "아니오"}</p>
              <p>리워드 상태: <StatusBadge status={rewardLabel(selected.rewardStatus)} /></p>
            </div>
            <div className="detail-block">
              <h4>만족도 요약</h4>
              <p>{selected.satisfactionHistory.length ? `${selected.satisfactionHistory.join(", ")} / 5` : "아직 만족도 기록이 없습니다"}</p>
            </div>
            <div className="detail-block">
              <h4>메모</h4>
              <p>{selected.notes}</p>
            </div>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}
