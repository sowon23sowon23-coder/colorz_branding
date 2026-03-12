import { SectionCard } from "../components/UI";

export function SettingsPage({ configured }: { configured: boolean }) {
  return (
    <div className="two-column-grid">
      <SectionCard title="Supabase 연결 상태" description="현재 앱은 정적 목업 대신 Supabase를 직접 읽도록 바뀌었습니다.">
        <ul className="insight-list">
          <li>상태: {configured ? "연결 정보 감지됨" : "환경변수 미설정"}</li>
          <li>필수 파일: `.env`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`</li>
          <li>필수 스키마: `supabase/schema.sql` 실행</li>
        </ul>
      </SectionCard>
      <SectionCard title="적용 순서" description="실데이터 입력을 시작하려면 아래 순서로 진행하면 됩니다.">
        <ol className="insight-list">
          <li>Supabase 프로젝트 생성</li>
          <li>SQL Editor에서 `supabase/schema.sql` 실행</li>
          <li>루트에 `.env` 파일 생성 후 URL과 anon key 입력</li>
          <li>개발 서버 재시작</li>
          <li>참여자/이벤트 페이지에서 직접 데이터 입력</li>
        </ol>
      </SectionCard>
    </div>
  );
}
