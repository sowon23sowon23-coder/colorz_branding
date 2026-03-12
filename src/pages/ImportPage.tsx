import { ChangeEvent, useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { EmptyState, SectionCard, StatusBadge } from "../components/UI";
import { CRMData, ImportType } from "../types";
import { formatDate, inferColumnRole, parseCsv } from "../utils";

type ImportStep = 1 | 2 | 3 | 4 | 5 | 6;

interface PreviewReport {
  rowsFound: number;
  newParticipants: number;
  existingParticipants: number;
  suspectedDuplicates: number;
  missingRequiredData: number;
  invalidValues: number;
  unresolvedEvents: number;
  invalidReferralCodes: number;
}

interface ImportPageProps {
  data: CRMData;
  configured: boolean;
}

const requiredRolesByType: Record<ImportType, string[]> = {
  participants: ["name", "phone"],
  participations: ["name", "phone", "eventName"],
  referrals: ["name", "phone", "referrerCode"],
};

export function ImportPage({ data, configured }: ImportPageProps) {
  const [step, setStep] = useState<ImportStep>(1);
  const [importType, setImportType] = useState<ImportType>("participants");
  const [fileName, setFileName] = useState("선택된 파일 없음");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");

  const preview = useMemo<PreviewReport>(() => {
    const headerIndex = Object.fromEntries(headers.map((header, index) => [header, index]));
    let newParticipants = 0;
    let existingParticipants = 0;
    let suspectedDuplicates = 0;
    let missingRequiredData = 0;
    let invalidValues = 0;
    let unresolvedEvents = 0;
    let invalidReferralCodes = 0;

    rows.forEach((row) => {
      const getValue = (role: string) => {
        const header = Object.keys(columnMap).find((key) => columnMap[key] === role);
        return header ? row[headerIndex[header]] ?? "" : "";
      };

      if (requiredRolesByType[importType].some((role) => !getValue(role))) {
        missingRequiredData += 1;
      }

      const phone = getValue("phone");
      const name = getValue("name");
      const school = getValue("school");
      const eventName = getValue("eventName");
      const referrerCode = getValue("referrerCode");
      const participantExists = data.participants.some((entry) => entry.phone === phone);
      const duplicateByNameSchool = name && school ? data.participants.some((entry) => entry.name === name && entry.school === school) : false;

      if (participantExists) existingParticipants += 1;
      else newParticipants += 1;

      if (duplicateByNameSchool && !participantExists) suspectedDuplicates += 1;
      if (importType !== "participants" && eventName && !data.events.some((entry) => entry.name === eventName)) unresolvedEvents += 1;
      if (importType === "referrals" && referrerCode && !data.participants.some((entry) => entry.referralCode === referrerCode)) invalidReferralCodes += 1;
      if (phone && phone.length < 8) invalidValues += 1;
    });

    return { rowsFound: rows.length, newParticipants, existingParticipants, suspectedDuplicates, missingRequiredData, invalidValues, unresolvedEvents, invalidReferralCodes };
  }, [columnMap, data.events, data.participants, headers, importType, rows]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseCsv(text);
    const [headerRow = [], ...bodyRows] = parsed;
    setFileName(file.name);
    setHeaders(headerRow);
    setRows(bodyRows);
    setColumnMap(Object.fromEntries(headerRow.map((header) => [header, inferColumnRole(header, importType)])));
    setStep(2);
  };

  const confirmImport = () => {
    setStep(6);
    setToast(
      configured
        ? "현재 화면은 프리뷰 전용입니다. 실제 Supabase 저장 로직은 다음 단계에서 연결할 수 있습니다."
        : "Supabase 연결 전에는 CSV 검증만 가능합니다.",
    );
    window.setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="page-grid">
      <SectionCard title="CSV 검증 흐름" description="헤더 매핑, 중복 감지, 미해결 항목 점검까지 프론트에서 확인합니다.">
        <div className="stepper">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div key={index} className={`step ${step >= index ? "active" : ""}`}>단계 {index}</div>
          ))}
        </div>

        <div className="import-panel">
          <label className="field-label">
            업로드 유형
            <select value={importType} onChange={(event) => setImportType(event.target.value as ImportType)}>
              <option value="participants">참여자</option>
              <option value="participations">참석 기록</option>
              <option value="referrals">추천/리워드</option>
            </select>
          </label>

          <label className="upload-zone">
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <span>CSV 파일 업로드</span>
            <small>{fileName}</small>
          </label>

          {headers.length > 0 ? (
            <>
              <div className="mapping-grid">
                {headers.map((header) => (
                  <label key={header} className="field-label">
                    {header}
                    <select value={columnMap[header] ?? "ignore"} onChange={(event) => setColumnMap((current) => ({ ...current, [header]: event.target.value }))}>
                      {["ignore", "name", "phone", "school", "grade", "eventName", "referrerCode", "attendanceStatus", "satisfactionScore", "rewardType", "referralStatus"].map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>

              <div className="preview-grid">
                <div className="preview-card"><span>행 수</span><strong>{preview.rowsFound}</strong></div>
                <div className="preview-card"><span>신규 참여자</span><strong>{preview.newParticipants}</strong></div>
                <div className="preview-card"><span>기존 참여자</span><strong>{preview.existingParticipants}</strong></div>
                <div className="preview-card"><span>의심 중복</span><strong>{preview.suspectedDuplicates}</strong></div>
                <div className="preview-card"><span>필수값 누락</span><strong>{preview.missingRequiredData}</strong></div>
                <div className="preview-card"><span>잘못된 값</span><strong>{preview.invalidValues}</strong></div>
                <div className="preview-card"><span>이벤트 미해결</span><strong>{preview.unresolvedEvents}</strong></div>
                <div className="preview-card"><span>추천 코드 오류</span><strong>{preview.invalidReferralCodes}</strong></div>
              </div>

              <div className="action-row">
                <button className="ghost-button" onClick={() => setStep((current) => (current > 1 ? ((current - 1) as ImportStep) : 1))}>이전</button>
                <button className="primary-button" onClick={() => setStep(5)}>확인 단계</button>
                <button className="danger-button" onClick={confirmImport}>검증 완료</button>
              </div>
              {toast ? <div className="toast">{toast}</div> : null}
            </>
          ) : (
            <EmptyState title="아직 CSV를 올리지 않았습니다" description="실제 저장 전에 먼저 구조와 중복 가능성을 검증할 수 있습니다." />
          )}
        </div>
      </SectionCard>

      <SectionCard title="업로드 이력" description="현재는 Supabase import_history 테이블에 저장된 이력만 표시합니다.">
        {data.importHistory.length > 0 ? (
          <DataTable
            rows={data.importHistory}
            rowKey={(row) => row.id}
            columns={[
              { key: "file", label: "파일명", sortable: true, sortValue: (row) => row.fileName, render: (row) => <strong>{row.fileName}</strong> },
              { key: "type", label: "유형", render: (row) => row.importType },
              { key: "date", label: "업로드 시각", sortable: true, sortValue: (row) => row.importedAt, render: (row) => formatDate(row.importedAt) },
              { key: "rows", label: "행 수", sortable: true, sortValue: (row) => row.rows, render: (row) => row.rows },
              { key: "status", label: "상태", render: (row) => <StatusBadge status={row.status} /> },
              { key: "result", label: "생성 / 수정", render: (row) => `${row.created} / ${row.updated}` },
            ]}
          />
        ) : (
          <EmptyState title="업로드 이력 없음" description="CSV 저장 로직과 import_history 기록을 연결하면 이력이 쌓입니다." />
        )}
      </SectionCard>
    </div>
  );
}
