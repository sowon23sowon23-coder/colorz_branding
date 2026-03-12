import { CRMData } from "../types";
import { getDashboardStats, getEventSummaries, getParticipantSummaries, groupCount } from "../utils";
import { MiniBarChart, SectionCard, StatCard } from "../components/UI";

export function DashboardPage({ data }: { data: CRMData }) {
  const stats = getDashboardStats(data);
  const events = getEventSummaries(data);
  const participants = getParticipantSummaries(data);

  const newVsReturning = [
    { label: "First-time", value: participants.filter((entry) => entry.totalParticipationCount === 1).length },
    { label: "Returning", value: participants.filter((entry) => entry.totalParticipationCount > 1).length },
  ];
  const referralTrend = events.map((event) => ({ label: event.name, value: event.referralParticipantCount }));
  const schoolDistribution = groupCount(data.participants.map((entry) => entry.school)).slice(0, 5);
  const topicDistribution = groupCount(data.events.map((entry) => entry.topic));

  return (
    <div className="page-grid">
      <div className="stat-grid">
        <StatCard label="Total participants" value={stats.totalParticipants} helper="Unique profiles across all events" />
        <StatCard label="New this month" value={stats.newParticipantsThisMonth} helper="March 2026 first joins" />
        <StatCard label="Total events" value={stats.totalEvents} helper="Gatherings tracked in CRM" />
        <StatCard label="Attendance rate" value={`${stats.averageAttendanceRate}%`} helper="Applied vs attended average" />
        <StatCard label="Repeat rate" value={`${stats.repeatParticipationRate}%`} helper="Participants with multiple joins" />
        <StatCard label="Referral inflow" value={stats.referralInflowCount} helper="Profiles acquired via friend invites" />
        <StatCard label="Reward usage" value={stats.rewardUsageCount} helper="Discounts or benefits already consumed" />
      </div>

      <div className="two-column-grid">
        <SectionCard title="Event participant counts" description="Applicants, attendees, and no-shows by event">
          <MiniBarChart items={events.map((event) => ({ label: event.name, value: event.actualAttendeeCount }))} valueLabel="attendees" />
        </SectionCard>
        <SectionCard title="New vs returning mix" description="How often Colorz is acquiring new people vs retaining them">
          <MiniBarChart items={newVsReturning} valueLabel="participants" />
        </SectionCard>
        <SectionCard title="Referral inflow trend" description="Friend-invite contribution across gatherings">
          <MiniBarChart items={referralTrend} valueLabel="referrals" />
        </SectionCard>
        <SectionCard title="School distribution" description="Top represented campuses in the CRM">
          <MiniBarChart items={schoolDistribution} valueLabel="people" />
        </SectionCard>
        <SectionCard title="Popular event topics" description="Content themes attracting demand">
          <MiniBarChart items={topicDistribution} valueLabel="events" />
        </SectionCard>
        <SectionCard title="Operator insights" description="Fast interpretation for student admins">
          <ul className="insight-list">
            <li>{events[0]?.name} has the highest recent attendance and should be a template for repeat formats.</li>
            <li>{schoolDistribution[0]?.label} is the strongest school source and worth targeted re-engagement.</li>
            <li>{participants.filter((entry) => entry.invitedFriendsCount > 0).length} participants are active referrers worth rewarding quickly.</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
