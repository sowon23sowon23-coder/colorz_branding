import { SectionCard } from "../components/UI";

export function SettingsPage() {
  return (
    <div className="two-column-grid">
      <SectionCard title="Referral reward rules" description="Adjust operator-facing reward logic for future extensions">
        <div className="settings-list">
          <label className="field-label">
            1 friend reward
            <input defaultValue="5,000 KRW off next event" />
          </label>
          <label className="field-label">
            2 friends reward
            <input defaultValue="Free entry or special host benefit" />
          </label>
          <label className="field-label">
            First-time referred participant benefit
            <input defaultValue="Welcome drink coupon" />
          </label>
        </div>
      </SectionCard>
      <SectionCard title="CRM operating notes" description="Internal guidance for student admins">
        <ul className="insight-list">
          <li>Use phone number as the primary deduplication key during CSV uploads.</li>
          <li>Review unresolved event names before confirming attendance imports.</li>
          <li>Issue referral rewards only after attendance is confirmed for the referred participant.</li>
        </ul>
      </SectionCard>
    </div>
  );
}
