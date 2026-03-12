import { useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { Drawer, SectionCard, StatusBadge } from "../components/UI";
import { CRMData, EventSummary } from "../types";
import { formatDate, getEventSummaries } from "../utils";

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
            name: participant?.name ?? "Unknown",
            attendance: entry.attendedStatus,
            discountApplied: entry.discountApplied,
            feedback: entry.feedback ?? "No feedback",
          };
        })
    : [];

  return (
    <>
      <SectionCard title="Event management" description="Review event-level attendance, referral, and satisfaction data">
        <DataTable
          rows={events}
          rowKey={(row) => row.id}
          onRowClick={setSelected}
          columns={[
            { key: "name", label: "Event", sortable: true, sortValue: (row) => row.name, render: (row) => <strong>{row.name}</strong> },
            { key: "date", label: "Date / Topic", sortable: true, sortValue: (row) => row.date, render: (row) => `${formatDate(row.date)} · ${row.topic}` },
            { key: "location", label: "Location", render: (row) => row.location },
            { key: "applicants", label: "Applicants", sortable: true, sortValue: (row) => row.applicantCount, render: (row) => row.applicantCount },
            { key: "attendees", label: "Attendees", sortable: true, sortValue: (row) => row.actualAttendeeCount, render: (row) => row.actualAttendeeCount },
            { key: "referrals", label: "Referral inflow", sortable: true, sortValue: (row) => row.referralParticipantCount, render: (row) => row.referralParticipantCount },
            { key: "score", label: "Avg satisfaction", sortable: true, sortValue: (row) => row.averageSatisfactionScore, render: (row) => row.averageSatisfactionScore || "-" },
          ]}
        />
      </SectionCard>

      <Drawer open={Boolean(selected)} title={selected?.name ?? "Event detail"} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="detail-stack">
            <div className="detail-block">
              <h4>Event information</h4>
              <p>{formatDate(selected.date)} · {selected.location}</p>
              <p>{selected.topic}</p>
              <p>{selected.description}</p>
            </div>
            <div className="detail-block">
              <h4>Quick stats</h4>
              <p>Applicants: {selected.applicantCount}</p>
              <p>Attendees: {selected.actualAttendeeCount}</p>
              <p>No-shows: {selected.noShowCount}</p>
              <p>First-time vs returning: {selected.firstTimeParticipantCount} / {selected.returningParticipantCount}</p>
              <p>Discount applied count: {selected.discountAppliedCount}</p>
            </div>
            <div className="detail-block">
              <h4>Participant list</h4>
              <ul className="detail-list">
                {eventParticipants.map((entry) => (
                  <li key={entry.id}>
                    <strong>{entry.name}</strong> <StatusBadge status={entry.attendance} /> {entry.discountApplied ? "· Discount applied" : ""}
                  </li>
                ))}
              </ul>
            </div>
            <div className="detail-block">
              <h4>Feedback highlights</h4>
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
