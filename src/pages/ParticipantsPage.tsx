import { useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { Drawer, EmptyState, SectionCard, StatusBadge } from "../components/UI";
import { CRMData, ParticipantSummary } from "../types";
import { formatDate, getParticipantSummaries } from "../utils";

export function ParticipantsPage({ data }: { data: CRMData }) {
  const participants = useMemo(() => getParticipantSummaries(data), [data]);
  const [query, setQuery] = useState("");
  const [school, setSchool] = useState("All");
  const [grade, setGrade] = useState("All");
  const [participantType, setParticipantType] = useState("All");
  const [rewardFilter, setRewardFilter] = useState("All");
  const [selected, setSelected] = useState<ParticipantSummary | null>(null);

  const schools = ["All", ...new Set(data.participants.map((entry) => entry.school))];
  const grades = ["All", ...new Set(data.participants.map((entry) => entry.grade))];

  const filtered = participants.filter((participant) => {
    const matchesQuery = participant.name.toLowerCase().includes(query.toLowerCase()) || participant.phone.includes(query);
    const matchesSchool = school === "All" || participant.school === school;
    const matchesGrade = grade === "All" || participant.grade === grade;
    const matchesType =
      participantType === "All" ||
      (participantType === "First-time" && participant.totalParticipationCount === 1) ||
      (participantType === "Returning" && participant.totalParticipationCount > 1) ||
      (participantType === "Referrer" && participant.invitedFriendsCount > 0) ||
      (participantType === "Referred" && participant.joinedByReferral);
    const matchesReward =
      rewardFilter === "All" ||
      (rewardFilter === "Available" && participant.rewardStatus === "Available") ||
      (rewardFilter === "Used" && participant.rewardStatus === "Used") ||
      (rewardFilter === "None" && participant.rewardStatus === "None");

    return matchesQuery && matchesSchool && matchesGrade && matchesType && matchesReward;
  });

  return (
    <>
      <SectionCard title="Participant CRM" description="Search and filter the full Colorz member history">
        <div className="filter-grid">
          <input placeholder="Search by name or phone" value={query} onChange={(event) => setQuery(event.target.value)} />
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
            {["All", "First-time", "Returning", "Referrer", "Referred"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select value={rewardFilter} onChange={(event) => setRewardFilter(event.target.value)}>
            {["All", "Available", "Used", "None"].map((item) => (
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
              { key: "name", label: "Participant", sortable: true, sortValue: (row) => row.name, render: (row) => <strong>{row.name}</strong> },
              { key: "phone", label: "Phone", render: (row) => row.phone },
              { key: "school", label: "School / Grade", sortable: true, sortValue: (row) => row.school, render: (row) => `${row.school} · ${row.grade}` },
              { key: "count", label: "Participation count", sortable: true, sortValue: (row) => row.totalParticipationCount, render: (row) => row.totalParticipationCount },
              { key: "recent", label: "Most recent event", sortable: true, sortValue: (row) => row.mostRecentEventDate ?? "", render: (row) => row.mostRecentEventDate ? formatDate(row.mostRecentEventDate) : "No events" },
              { key: "referral", label: "Referral", render: (row) => row.joinedByReferral ? <StatusBadge status="Joined via referral" /> : <StatusBadge status="Organic" /> },
              { key: "reward", label: "Reward", render: (row) => <StatusBadge status={row.rewardStatus} /> },
            ]}
          />
        ) : (
          <EmptyState title="No matching participants" description="Adjust the filters or search query to see more records." />
        )}
      </SectionCard>

      <Drawer open={Boolean(selected)} title={selected?.name ?? "Participant detail"} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="detail-stack">
            <div className="detail-block">
              <h4>Basic profile</h4>
              <p>{selected.phone}</p>
              <p>{selected.school} · {selected.grade}</p>
              <p>Referral code: <strong>{selected.referralCode}</strong></p>
            </div>
            <div className="detail-block">
              <h4>Participation history</h4>
              <ul className="detail-list">
                {selected.participatedEventList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="detail-block">
              <h4>Referral and reward history</h4>
              <p>Invited friends: {selected.invitedFriendsCount}</p>
              <p>Joined by referral: {selected.joinedByReferral ? "Yes" : "No"}</p>
              <p>Reward status: <StatusBadge status={selected.rewardStatus} /></p>
            </div>
            <div className="detail-block">
              <h4>Satisfaction summary</h4>
              <p>{selected.satisfactionHistory.length ? `${selected.satisfactionHistory.join(", ")} / 5` : "No satisfaction scores yet"}</p>
            </div>
            <div className="detail-block">
              <h4>Notes</h4>
              <p>{selected.notes}</p>
            </div>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}
