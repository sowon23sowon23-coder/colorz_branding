import { SectionCard } from "../components/UI";

export function SettingsPage() {
  return (
    <div className="two-column-grid">
      <SectionCard title="추천 보상 규칙" description="운영자가 나중에 쉽게 조정할 수 있도록 보상 규칙을 관리합니다">
        <div className="settings-list">
          <label className="field-label">
            친구 1명 초대 보상
            <input defaultValue="다음 이벤트 5,000원 할인" />
          </label>
          <label className="field-label">
            친구 2명 초대 보상
            <input defaultValue="무료 입장 또는 특별 혜택" />
          </label>
          <label className="field-label">
            추천 유입 첫 참여 혜택
            <input defaultValue="웰컴 드링크 쿠폰" />
          </label>
        </div>
      </SectionCard>
      <SectionCard title="CRM 운영 메모" description="학생 운영진을 위한 내부 가이드입니다">
        <ul className="insight-list">
          <li>CSV 업로드 시 전화번호를 1차 중복 판별 기준으로 사용합니다.</li>
          <li>참석 업로드 확정 전 미해결 이벤트명을 반드시 검토합니다.</li>
          <li>추천 보상은 추천받은 참여자의 실제 참석 확인 후 지급합니다.</li>
        </ul>
      </SectionCard>
    </div>
  );
}
