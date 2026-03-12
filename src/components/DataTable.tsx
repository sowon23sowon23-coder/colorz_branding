import { ReactNode, useMemo, useState } from "react";

type Column<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
};

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
}

export function DataTable<T>({ columns, rows, rowKey, onRowClick, pageSize = 6 }: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const sortedRows = useMemo(() => {
    if (!sortKey) {
      return rows;
    }
    const column = columns.find((item) => item.key === sortKey);
    if (!column?.sortValue) {
      return rows;
    }
    return [...rows].sort((left, right) => {
      const leftValue = column.sortValue!(left);
      const rightValue = column.sortValue!(right);
      if (leftValue < rightValue) {
        return direction === "asc" ? -1 : 1;
      }
      if (leftValue > rightValue) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [columns, direction, rows, sortKey]);

  const pageCount = Math.max(Math.ceil(sortedRows.length / pageSize), 1);
  const clampedPage = Math.min(page, pageCount);
  const pageRows = sortedRows.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setDirection("desc");
  };

  return (
    <div className="table-shell">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>
                  {column.sortable ? (
                    <button className="sort-button" onClick={() => toggleSort(column.key)}>
                      {column.label}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr key={rowKey(row)} className={onRowClick ? "clickable-row" : ""} onClick={() => onRowClick?.(row)}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>
          {clampedPage} / {pageCount} 페이지
        </span>
        <div className="pagination">
          <button className="ghost-button" onClick={() => setPage(Math.max(clampedPage - 1, 1))}>
            이전
          </button>
          <button className="ghost-button" onClick={() => setPage(Math.min(clampedPage + 1, pageCount))}>
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
