import { useMemo, useState } from "react";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { EventsPage } from "./pages/EventsPage";
import { ImportPage } from "./pages/ImportPage";
import { ParticipantsPage } from "./pages/ParticipantsPage";
import { ReferralsPage } from "./pages/ReferralsPage";
import { RewardsPage } from "./pages/RewardsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { crmData } from "./mockData";
import { PageKey } from "./types";

const pageCopy: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Monitor participant growth, referral performance, repeat attendance, and event health." },
  participants: { title: "Participants", subtitle: "Operate the full CRM by searching people, reviewing histories, and opening profile details." },
  events: { title: "Events", subtitle: "See event-by-event demand, attendance quality, no-shows, and satisfaction response." },
  referrals: { title: "Referrals", subtitle: "Track friend invites, approval progress, and reward outcomes from each relationship." },
  rewards: { title: "Rewards & Discounts", subtitle: "Manage issued benefits, upcoming discount eligibility, and redemption status." },
  imports: { title: "CSV Import", subtitle: "Import Google Form exports and bulk operator data with mapping, preview, and duplicate detection." },
  settings: { title: "Settings", subtitle: "Keep reward logic, admin workflow notes, and future extension points organized." },
};

function App() {
  const [page, setPage] = useState<PageKey>("dashboard");
  const copy = useMemo(() => pageCopy[page], [page]);

  return (
    <Layout page={page} onPageChange={setPage} title={copy.title} subtitle={copy.subtitle}>
      {page === "dashboard" ? <DashboardPage data={crmData} /> : null}
      {page === "participants" ? <ParticipantsPage data={crmData} /> : null}
      {page === "events" ? <EventsPage data={crmData} /> : null}
      {page === "referrals" ? <ReferralsPage data={crmData} /> : null}
      {page === "rewards" ? <RewardsPage data={crmData} /> : null}
      {page === "imports" ? <ImportPage data={crmData} /> : null}
      {page === "settings" ? <SettingsPage /> : null}
    </Layout>
  );
}

export default App;
