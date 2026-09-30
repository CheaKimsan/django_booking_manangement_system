import React from "react";

export interface Column<T> {
  title: string;
  key: string;
  width?: string;
  align?: "left" | "center" | "right";
  render: (row: T, index: number) => React.ReactNode;
}

interface MainTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  onRowClick?: (row: T) => void;
}

function MainTable<T>({ columns, rows, rowKey, loading, onRowClick }: MainTableProps<T>) {
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-danger" role="status" style={{ color: 'var(--accent)' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="table-container text-center py-5 text-muted">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-50">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p className="mb-0" style={{ color: 'var(--text-muted)' }}>No records found.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width, textAlign: col.align ?? "left" }}>
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={rowKey(row)}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("[data-no-row-click]")) return;
                  onRowClick?.(row);
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{ textAlign: col.align ?? "left" }}>
                    {col.render(row, i)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MainTable;