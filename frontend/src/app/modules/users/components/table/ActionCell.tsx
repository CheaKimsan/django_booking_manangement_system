import { useState } from "react";
import {
  EditRegular,
  PersonDeleteRegular,
  DeleteRegular,
  MoreVerticalRegular
} from "@fluentui/react-icons";

interface ActionCellProps {
  row: any;
  onEdit: (row: any) => void;
  onDelete: (id: number) => void | Promise<void>;
  onToggleActive: (id: number, active: boolean) => void | Promise<void>;
}

export default function ActionCell({ row, onEdit, onDelete, onToggleActive }: ActionCellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div style={{ position: "relative" }} data-no-row-click>
      {/* Trigger Button */}
      <button
        className="action-btn"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <MoreVerticalRegular fontSize={18} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Invisible backdrop to close menu when clicking outside */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 999 }}
            onClick={() => setIsOpen(false)}
          />

          <div className="action-dropdown">
            <button
              className="action-dropdown-item"
              onClick={() => handleAction(() => onEdit(row))}
            >
              <EditRegular />
              Edit
            </button>

            <button
              className={`action-dropdown-item ${row.is_active ? "warning" : ""}`}
              onClick={() => handleAction(() => onToggleActive(row.id, !row.is_active))}
            >
              <PersonDeleteRegular />
              {row.is_active ? "Deactivate" : "Activate"}
            </button>

            <button
              className="action-dropdown-item danger"
              onClick={() => handleAction(() => onDelete(row.id))}
            >
              <DeleteRegular />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}