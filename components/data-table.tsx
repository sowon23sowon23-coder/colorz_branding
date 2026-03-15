import { cn } from "@/lib/utils";

export function DataTable({ headers, rows, className }: { headers: string[]; rows: React.ReactNode[][]; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-medium">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-slate-100 align-top text-slate-700">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

