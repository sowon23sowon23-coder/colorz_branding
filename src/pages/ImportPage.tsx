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

export function ImportPage({ data }: { data: CRMData }) {
  const [step, setStep] = useState<ImportStep>(1);
  const [importType, setImportType] = useState<ImportType>("participants");
  const [fileName, setFileName] = useState("No file selected");
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
    setToast("Import completed in simulation mode. Invalid rows were excluded from save.");
    window.setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="page-grid">
      <SectionCard title="CSV import workflow" description="Bulk upload participant, event participation, and referral data" action={<button className="ghost-button" onClick={downloadTemplate}>Download CSV template</button>}>
        <div className="stepper">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div key={index} className={`step ${step >= index ? "active" : ""}`}>Step {index}</div>
          ))}
        </div>
        <div className="import-panel">
          <label className="field-label">
            Import type
            <select value={importType} onChange={(event) => setImportType(event.target.value as ImportType)}>
              <option value="participants">Participants import</option>
              <option value="participations">Event participation import</option>
              <option value="referrals">Referral / reward import</option>
            </select>
          </label>

          <label className="upload-zone">
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <span>Upload CSV file</span>
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
                <div className="preview-card"><span>Rows found</span><strong>{preview.rowsFound}</strong></div>
                <div className="preview-card"><span>New participants</span><strong>{preview.newParticipants}</strong></div>
                <div className="preview-card"><span>Existing participants</span><strong>{preview.existingParticipants}</strong></div>
                <div className="preview-card"><span>Suspected duplicates</span><strong>{preview.suspectedDuplicates}</strong></div>
                <div className="preview-card"><span>Missing required data</span><strong>{preview.missingRequiredData}</strong></div>
                <div className="preview-card"><span>Invalid values</span><strong>{preview.invalidValues}</strong></div>
                <div className="preview-card"><span>Unresolved events</span><strong>{preview.unresolvedEvents}</strong></div>
                <div className="preview-card"><span>Invalid referral codes</span><strong>{preview.invalidReferralCodes}</strong></div>
              </div>

              <div className="action-row">
                <button className="ghost-button" onClick={() => setStep((current) => (current > 1 ? ((current - 1) as ImportStep) : 1))}>Back</button>
                <button className="primary-button" onClick={() => setStep(5)}>Continue to confirmation</button>
                <button className="danger-button" onClick={confirmImport}>Confirm import</button>
              </div>
              {toast ? <div className="toast">{toast}</div> : null}
            </>
          ) : (
            <EmptyState title="No CSV uploaded yet" description="Upload a Google Form or operator export, then map the headers before previewing the import." />
          )}
        </div>
      </SectionCard>

      <SectionCard title="Import history log" description="Recent upload attempts with safe retry visibility">
        <DataTable
          rows={data.importHistory}
          rowKey={(row) => row.id}
          columns={[
            { key: "file", label: "File", sortable: true, sortValue: (row) => row.fileName, render: (row) => <strong>{row.fileName}</strong> },
            { key: "type", label: "Type", render: (row) => row.importType },
            { key: "date", label: "Imported at", sortable: true, sortValue: (row) => row.importedAt, render: (row) => formatDate(row.importedAt) },
            { key: "rows", label: "Rows", sortable: true, sortValue: (row) => row.rows, render: (row) => row.rows },
            { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
            { key: "result", label: "Created / updated", render: (row) => `${row.created} / ${row.updated}` },
          ]}
        />
      </SectionCard>
    </div>
  );
}
