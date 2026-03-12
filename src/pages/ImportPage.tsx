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

const requiredRolesByType: Record<ImportType, string[]> = {
  participants: ["name", "phone"],
  participations: ["name", "phone", "eventName"],
  referrals: ["name", "phone", "referrerCode"],
};

const importTypeLabel = (type: ImportType) => {
  if (type === "participants") return "참여자";
  if (type === "participations") return "참석 기록";
  return "추천/리워드";
};

const historyStatusLabel = (status: string) => {
  if (status === "Completed") return "완료";
  if (status === "Completed with warnings") return "경고 포함 완료";
  return "실패";
};

export function ImportPage({ data }: { data: CRMData }) {
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

      if (participantExists) {
        existingParticipants += 1;
      } else {
        newParticipants += 1;
      }

      if (duplicateByNameSchool && !participantExists) {
        suspectedDuplicates += 1;
      }

      if (importType !== "participants" && eventName && !data.events.some((entry) => entry.name === eventName)) {
        unresolvedEvents += 1;
      }

      if (importType === "referrals" && referrerCode && !data.participants.some((entry) => entry.referralCode === referrerCode)) {
        invalidReferralCodes += 1;
      }

      if (phone && phone.length < 8) {
        invalidValues += 1;
      }
    });

    return { rowsFound: rows.length, newParticipants, existingParticipants, suspectedDuplicates, missingRequiredData, invalidValues, unresolvedEvents, invalidReferralCodes };
  }, [columnMap, data.events, data.participants, headers, importType, rows]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    const parsed = parseCsv(text);
    const [headerRow = [], ...bodyRows] = parsed;
    const nextMap = Object.fromEntries(headerRow.map((header) => [header, inferColumnRole(header, importType)]));

    setFileName(file.name);
    setHeaders(headerRow);
    setRows(bodyRows);
    setColumnMap(nextMap);
    setStep(2);
  };

  const downloadTemplate = () => {
    const templates: Record<ImportType, string> = {
      participants: "name,phone,school,grade,referral_code\nMinji Kim,010-1111-2222,Yonsei University,2nd year,MINJI12",
      participations: "name,phone,event_name,attendance,satisfaction\nMinji Kim,010-1111-2222,Spring Brand Mixer,Attended,5",
      referrals: "name,phone,referrer_code,event_name,reward,status\nJiwon Park,010-3333-4444,MINJI12,Creator Growth Talk,5,000 KRW discount,Approved",
    };
    const blob = new Blob([templates[importType]], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `colorz_${importType}_template.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const confirmImport = () => {
    setStep(6);
    setToast("시뮬레이션 기준으로 업로드가 완료되었습니다. 잘못된 행은 저장에서 제외되었습니다.");
    window.setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="page-grid">
      <SectionCard title="CSV 업로드 흐름" description="참여자, 참석 기록, 추천 데이터를 대량 업로드합니다" action={<button className="ghost-button" onClick={downloadTemplate}>CSV 템플릿 다운로드</button>}>
        <div className="stepper">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div key={index} className={`step ${step >= index ? "active" : ""}`}>단계 {index}</div>
          ))}
        </div>
        <div className="import-panel">
          <label className="field-label">
            업로드 유형
            <select value={importType} onChange={(event) => setImportType(event.target.value as ImportType)}>
              <option value="participants">참여자 업로드</option>
              <option value="participations">이벤트 참석 업로드</option>
              <option value="referrals">추천 / 리워드 업로드</option>
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
                <div className="preview-card"><span>감지된 행 수</span><strong>{preview.rowsFound}</strong></div>
                <div className="preview-card"><span>신규 참여자</span><strong>{preview.newParticipants}</strong></div>
                <div className="preview-card"><span>기존 참여자</span><strong>{preview.existingParticipants}</strong></div>
                <div className="preview-card"><span>의심 중복</span><strong>{preview.suspectedDuplicates}</strong></div>
                <div className="preview-card"><span>필수값 누락</span><strong>{preview.missingRequiredData}</strong></div>
                <div className="preview-card"><span>잘못된 값</span><strong>{preview.invalidValues}</strong></div>
                <div className="preview-card"><span>미해결 이벤트</span><strong>{preview.unresolvedEvents}</strong></div>
                <div className="preview-card"><span>잘못된 추천 코드</span><strong>{preview.invalidReferralCodes}</strong></div>
              </div>

              <div className="action-row">
                <button className="ghost-button" onClick={() => setStep((current) => (current > 1 ? ((current - 1) as ImportStep) : 1))}>이전</button>
                <button className="primary-button" onClick={() => setStep(5)}>확인 단계로 이동</button>
                <button className="danger-button" onClick={confirmImport}>업로드 확정</button>
              </div>
              {toast ? <div className="toast">{toast}</div> : null}
            </>
          ) : (
            <EmptyState title="아직 CSV를 업로드하지 않았습니다" description="구글폼 내보내기 또는 운영 CSV를 업로드한 뒤 컬럼을 매핑하고 미리보기를 확인하세요." />
          )}
        </div>
      </SectionCard>

      <SectionCard title="업로드 이력" description="최근 업로드 결과와 안전한 재시도 기준을 확인합니다">
        <DataTable
          rows={data.importHistory}
          rowKey={(row) => row.id}
          columns={[
            { key: "file", label: "파일명", sortable: true, sortValue: (row) => row.fileName, render: (row) => <strong>{row.fileName}</strong> },
            { key: "type", label: "유형", render: (row) => importTypeLabel(row.importType) },
            { key: "date", label: "업로드 시각", sortable: true, sortValue: (row) => row.importedAt, render: (row) => formatDate(row.importedAt) },
            { key: "rows", label: "행 수", sortable: true, sortValue: (row) => row.rows, render: (row) => row.rows },
            { key: "status", label: "상태", render: (row) => <StatusBadge status={historyStatusLabel(row.status)} /> },
            { key: "result", label: "생성 / 업데이트", render: (row) => `${row.created} / ${row.updated}` },
          ]}
        />
      </SectionCard>
    </div>
  );
}
